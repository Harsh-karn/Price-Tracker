export interface ScrapeResult {
    trackedItemId: string;
    price: number | null;
    stock: string | null;
    outcome: 'success' | 'retried' | 'failed';
}
export declare class Scraper {
    private readonly storeUrl;
    scrapeItem(trackedItemId: string, storeProductId: number, optionLabel: string): Promise<ScrapeResult>;
    private saveScrapeHistory;
    runAllScrapes(): Promise<ScrapeResult[] | undefined>;
}
export declare const scraper: Scraper;
//# sourceMappingURL=scraper.d.ts.map