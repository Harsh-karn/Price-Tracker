import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { productService } from './services/productService';
import { supabase } from './services/supabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize product catalog
productService.loadCatalog();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/search', (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.json([]);
  }
  const results = productService.searchProducts(query);
  res.json(results.slice(0, 20)); // Return top 20 matches
});

app.get('/api/products/:id/options', async (req, res) => {
  const options = await productService.getProductOptions(Number(req.params.id));
  res.json(options);
});

app.post('/api/track', async (req, res) => {
  const { storeProductId, name, slug, optionId, optionLabel } = req.body;
  if (!storeProductId || !name || !slug || !optionId || !optionLabel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Ensure product exists
    let { data: product, error: pError } = await supabase
      .from('products')
      .select('id')
      .eq('store_product_id', storeProductId)
      .single();

    if (pError || !product) {
      const { data: newProduct, error: npError } = await supabase
        .from('products')
        .insert([{ store_product_id: storeProductId, name, slug }])
        .select('id')
        .single();
      
      if (npError) throw npError;
      product = newProduct;
    }

    // 2. Ensure product option exists
    let { data: option, error: oError } = await supabase
      .from('product_options')
      .select('id')
      .eq('product_id', product.id)
      .eq('store_option_id', optionId)
      .single();

    if (oError || !option) {
      const { data: newOption, error: noError } = await supabase
        .from('product_options')
        .insert([{ product_id: product.id, store_option_id: optionId, label: optionLabel }])
        .select('id')
        .single();
        
      if (noError) throw noError;
      option = newOption;
    }

    // 3. Track the item
    const { data: trackedItem, error: tError } = await supabase
      .from('tracked_items')
      .insert([{ product_option_id: option.id }])
      .select('id')
      .single();

    if (tError) {
      if (tError.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'Already tracking this product option' });
      }
      throw tError;
    }

    res.json({ success: true, trackedItemId: trackedItem.id });
  } catch (error: any) {
    console.error('Error tracking product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tracked', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tracked_items')
      .select(`
        id,
        created_at,
        product_options (
          id,
          store_option_id,
          label,
          products (
            id,
            store_product_id,
            name,
            slug
          )
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import { scraper } from './scraper/scraper';

app.get('/api/tracked/:id/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scrape_history')
      .select('*')
      .eq('tracked_item_id', req.params.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/scrape/run', async (req, res) => {
  try {
    const results = await scraper.runAllScrapes();
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
