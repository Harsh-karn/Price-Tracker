export interface ProductListing {
    id: number;
    slug: string;
    name: string;
    brand: string;
    category: string;
    sku: string;
}
declare class ProductService {
    private catalog;
    private isLoaded;
    private readonly storeUrl;
    loadCatalog(): Promise<void>;
    searchProducts(query: string): ProductListing[];
    getProductOptions(productId: number): Promise<{
        id: string;
        label: string;
    }[]>;
}
export declare const productService: ProductService;
export {};
//# sourceMappingURL=productService.d.ts.map