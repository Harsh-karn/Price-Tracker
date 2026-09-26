import { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus, Loader2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
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
      setError('Failed to load options for this product.');
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
      setSuccessMsg(`Tracking started for ${selectedProduct.name} - ${option.label}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('You are already tracking this option.');
      } else {
        setError('Failed to track product.');
      }
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Search Products</h1>
        <p className="text-sm text-gray-500 mb-6">Find items from the store to add to your tracking list.</p>
        
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-sm shadow-sm"
            placeholder="Search by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Results {results.length > 0 && `(${results.length})`}
          </h2>
          
          {query && !loading && results.length === 0 && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
              No products found matching "{query}"
            </div>
          )}

          <div className="space-y-2">
            {results.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedProduct?.id === product.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-900 font-medium text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{product.brand} &bull; {product.category}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${selectedProduct?.id === product.id ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Product Detail */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tracking Options</h2>
          
          {!selectedProduct ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg h-[150px] flex items-center justify-center">
              <p className="text-sm text-gray-500">Select a product to view its options.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedProduct.name}</h3>
              <p className="text-gray-500 text-xs mb-5">SKU: {selectedProduct.sku}</p>

              {loadingOptions ? (
                <div className="flex items-center space-x-2 text-gray-500 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching variants...</span>
                </div>
              ) : options.length === 0 ? (
                <p className="text-gray-500 text-sm">No options available for tracking.</p>
              ) : (
                <div className="space-y-2">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <span className="text-gray-900 text-sm font-medium">{opt.label}</span>
                      <button
                        onClick={() => handleTrack(opt)}
                        disabled={trackingId === opt.id}
                        className="flex items-center space-x-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                      >
                        {trackingId === opt.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                        ) : (
                          <>
                            <Plus className="h-3 w-3 text-blue-600" />
                            <span>Track</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {successMsg && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100 flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm">{successMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
