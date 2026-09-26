import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTrackedItems, TrackedItem } from '../api';
import { Loader2, Activity, ExternalLink, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getTrackedItems();
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Tracking</h1>
          <p className="text-slate-400 mt-2">Monitoring prices and stock across {items.length} items</p>
        </div>
        <button 
          onClick={fetchItems}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400">Loading tracked items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center bg-slate-800/20 border border-slate-700/50 rounded-3xl p-12 backdrop-blur-sm shadow-xl">
          <div className="bg-slate-800/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <Activity className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No items tracked yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Head over to the search tab to find products and start tracking their prices automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group backdrop-blur-sm shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span>Tracking Active</span>
                  </div>
                  <a 
                    href={`https://demo.inelabteamdev.com/item/${item.product_options.products.store_product_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-white transition-colors"
                    title="View on store"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={item.product_options.products.name}>
                  {item.product_options.products.name}
                </h3>
                <p className="text-slate-400 text-sm mb-6">Option: <span className="text-white font-medium">{item.product_options.label}</span></p>

                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="text-sm text-slate-500">Added {new Date(item.created_at).toLocaleDateString()}</div>
                  <div className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors cursor-pointer">
                    View History &rarr;
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
