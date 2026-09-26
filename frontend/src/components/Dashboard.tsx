import { useState, useEffect } from 'react';
import { getTrackedItems, type TrackedItem } from '../api';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Active Tracking</h1>
          <p className="text-sm text-gray-500">Monitoring prices for {items.length} items</p>
        </div>
        <button 
          onClick={fetchItems}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-3">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-500">Loading tracked items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center bg-white border border-gray-200 rounded-lg p-10 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">No items tracked</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Use the Search tab to find products and start tracking them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <a 
                  href={`https://demo.inelabteamdev.com/item/${item.product_options.products.store_product_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="View on store"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight line-clamp-2">
                {item.product_options.products.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">
                Option: <span className="font-medium text-gray-700">{item.product_options.label}</span>
              </p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="text-xs text-gray-500">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
