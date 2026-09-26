export interface ProductListing {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
}

class ProductService {
  private catalog: ProductListing[] = [];
  private isLoaded = false;
  private readonly storeUrl = process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com';

  async loadCatalog() {
    if (this.isLoaded) return;
    
    try {
      console.log('Fetching mock store product catalog...');
      const firstPage = await fetch(`${this.storeUrl}/api/v2/listings?page=1&limit=60`);
      const data = await firstPage.json();
      
      this.catalog = [...data.results];
      const totalPages = data.totalPages;

      // Fetch remaining pages concurrently
      const promises = [];
      for (let i = 2; i <= totalPages; i++) {
        promises.push(
          fetch(`${this.storeUrl}/api/v2/listings?page=${i}&limit=60`)
            .then(res => res.json())
        );
      }

      const remainingPages = await Promise.all(promises);
      for (const page of remainingPages) {
        this.catalog = this.catalog.concat(page.results);
      }
      
      this.isLoaded = true;
      console.log(`Loaded ${this.catalog.length} products into memory cache.`);
    } catch (error) {
      console.error('Failed to load product catalog:', error);
    }
  }

  searchProducts(query: string): ProductListing[] {
    if (!query) return [];
    const q = query.toLowerCase();
    return this.catalog.filter(p => p.name.toLowerCase().includes(q));
  }

  async getProductOptions(productId: number): Promise<{ id: string, label: string }[]> {
    try {
      const res = await fetch(`${this.storeUrl}/api/v2/items/${productId}`);
      const data = await res.json();
      return data.options || [];
    } catch (error) {
      console.error(`Failed to fetch options for product ${productId}:`, error);
      return [];
    }
  }
}

export const productService = new ProductService();
