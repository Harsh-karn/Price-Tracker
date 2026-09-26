import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    }, 500);

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
      setSuccessMsg(`Successfully tracking ${selectedProduct.name} - ${option.label}`);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search Header */}
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Discover Products
        </h1>
        <p className="text-gray-400 text-lg">Search the store and start tracking prices</p>
        
        <div className="relative w-full max-w-2xl mt-4 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm shadow-xl placeholder-slate-500 text-lg"
            placeholder="Search by product name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Results List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white px-2">Results {results.length > 0 && `(${results.length})`}</h2>
          
          {query && !loading && results.length === 0 && (
            <div className="p-8 text-center bg-slate-800/20 border border-slate-700/30 rounded-2xl backdrop-blur-sm">
              <p className="text-gray-400">No products found matching "{query}"</p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((product) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                  selectedProduct?.id === product.id 
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">{product.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{product.brand} • {product.category}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-colors ${selectedProduct?.id === product.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Selected Product Detail */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white px-2">Track Option</h2>
          
          {!selectedProduct ? (
            <div className="p-8 text-center bg-slate-800/20 border border-slate-700/30 rounded-2xl h-[200px] flex items-center justify-center backdrop-blur-sm">
              <p className="text-slate-500">Select a product to view tracking options</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h3>
              <p className="text-slate-400 text-sm mb-6">SKU: {selectedProduct.sku}</p>

              {loadingOptions ? (
                <div className="flex items-center space-x-3 text-slate-400 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                  <span>Loading options...</span>
                </div>
              ) : options.length === 0 ? (
                <p className="text-slate-400">No options found for this product.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">Available Options</p>
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
                      <span className="text-white font-medium">{opt.label}</span>
                      <button
                        onClick={() => handleTrack(opt)}
                        disabled={trackingId === opt.id}
                        className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        {trackingId === opt.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Track</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {successMsg && (
                <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-400 text-sm">{successMsg}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
