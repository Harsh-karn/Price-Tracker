"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const productService_1 = require("./services/productService");
const supabase_1 = require("./services/supabase");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize product catalog
productService_1.productService.loadCatalog();
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json([]);
    }
    const results = productService_1.productService.searchProducts(query);
    res.json(results.slice(0, 20)); // Return top 20 matches
});
app.get('/api/products/:id/options', async (req, res) => {
    const options = await productService_1.productService.getProductOptions(Number(req.params.id));
    res.json(options);
});
app.post('/api/track', async (req, res) => {
    const { storeProductId, name, slug, optionId, optionLabel } = req.body;
    if (!storeProductId || !name || !slug || !optionId || !optionLabel) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // 1. Ensure product exists
        let { data: product, error: pError } = await supabase_1.supabase
            .from('products')
            .select('id')
            .eq('store_product_id', storeProductId)
            .single();
        if (pError || !product) {
            const { data: newProduct, error: npError } = await supabase_1.supabase
                .from('products')
                .insert([{ store_product_id: storeProductId, name, slug }])
                .select('id')
                .single();
            if (npError)
                throw npError;
            product = newProduct;
        }
        // 2. Ensure product option exists
        let { data: option, error: oError } = await supabase_1.supabase
            .from('product_options')
            .select('id')
            .eq('product_id', product.id)
            .eq('store_option_id', optionId)
            .single();
        if (oError || !option) {
            const { data: newOption, error: noError } = await supabase_1.supabase
                .from('product_options')
                .insert([{ product_id: product.id, store_option_id: optionId, label: optionLabel }])
                .select('id')
                .single();
            if (noError)
                throw noError;
            option = newOption;
        }
        // 3. Track the item
        const { data: trackedItem, error: tError } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Error tracking product:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/tracked', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const scraper_1 = require("./scraper/scraper");
app.post('/api/scrape/run', async (req, res) => {
    try {
        const results = await scraper_1.scraper.runAllScrapes();
        res.json({ success: true, results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
});
//# sourceMappingURL=server.js.map