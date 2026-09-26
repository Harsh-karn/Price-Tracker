import { useState, useEffect } from 'react';
import { searchProducts, getProductOptions, trackProduct, type Product, type ProductOption } from '../api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchProducts(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setOptions([]);
    setTrackingId(null);
    setError(null);
    setSuccessMsg(null);
    setLoadingOptions(true);
    
    try {
      const opts = await getProductOptions(product.id);
      setOptions(opts);
    } catch (err) {
      setError('Failed to load options.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleTrack = async (option: ProductOption) => {
    if (!selectedProduct) return;
    setTrackingId(option.id);
    setError(null);
    setSuccessMsg(null);
    
    try {
      await trackProduct(
        selectedProduct.id,
        selectedProduct.name,
        selectedProduct.slug,
        option.id,
        option.label
      );
      setSuccessMsg(`Tracking initiated.`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Option already tracked.');
      } else {
        setError('Failed to track product.');
      }
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-12">
      
      {/* Search Input */}
      <div>
        <label htmlFor="searchQuery" className="block text-xl font-medium text-[#1C1E1D] mb-4">
          Search Catalog
        </label>
        <div className="flex items-center border border-[#E4E6E5] bg-[#F9F9F8]">
          <input
            id="searchQuery"
            type="text"
            className="w-full bg-transparent text-[#1C1E1D] px-4 py-3 focus:outline-none focus:border-[#1C1E1D] transition-colors rounded-none"
            placeholder="Enter product name or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <span className="px-4 text-sm text-[#6A6D6C]">Searching...</span>
          )}
        </div>
      </div>

      {/* Main Structure */}
      {query && !loading && results.length === 0 && (
        <div className="text-sm text-[#6A6D6C] py-4 border-t border-[#E4E6E5]">
          No records found.
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Results Column */}
          <div>
            <h2 className="text-sm text-[#6A6D6C] mb-4">Results</h2>
            <div className="border-t border-[#E4E6E5]">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`w-full text-left py-3 border-b border-[#E4E6E5] ${
                    selectedProduct?.id === product.id 
                      ? 'text-[#1C1E1D]' 
                      : 'text-[#6A6D6C] hover:text-[#1C1E1D]'
                  }`}
                >
                  <div className="text-base">{product.name}</div>
                  <div className="text-sm mt-1">SKU: {product.sku}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div>
            <h2 className="text-sm text-[#6A6D6C] mb-4">Selected Item</h2>
            <div className="border-t border-[#E4E6E5] py-3">
              {!selectedProduct ? (
                <div className="text-sm text-[#6A6D6C]">
                  Select an item from the results to view options.
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base text-[#1C1E1D]">{selectedProduct.name}</h3>
                    <div className="text-sm text-[#6A6D6C] mt-1">Category: {selectedProduct.category}</div>
                  </div>

                  <div>
                    {loadingOptions ? (
                      <div className="text-sm text-[#6A6D6C]">Fetching variants...</div>
                    ) : options.length === 0 ? (
                      <div className="text-sm text-[#6A6D6C]">No variants available.</div>
                    ) : (
                      <div className="space-y-4">
                        {options.map((opt) => (
                          <div key={opt.id} className="flex justify-between items-center border border-[#E4E6E5] p-4">
                            <span className="text-sm text-[#1C1E1D]">{opt.label}</span>
                            <button
                              onClick={() => handleTrack(opt)}
                              disabled={trackingId === opt.id}
                              className="bg-[#2C503D] hover:bg-[#1f382a] disabled:bg-[#E4E6E5] text-[#F9F9F8] disabled:text-[#6A6D6C] px-4 py-1.5 text-sm transition-colors rounded-none"
                            >
                              {trackingId === opt.id ? 'Processing...' : 'Track'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-[#1C1E1D] border-l-2 border-[#1C1E1D] pl-3 py-1">
                      {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="text-sm text-[#2C503D] border-l-2 border-[#2C503D] pl-3 py-1">
                      {successMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
