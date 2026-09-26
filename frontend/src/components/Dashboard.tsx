import { useState, useEffect } from 'react';
import { getTrackedItems, type TrackedItem } from '../api';

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
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-medium text-[#1C1E1D]">Active Tracking</h1>
        <button 
          onClick={fetchItems}
          className="text-sm text-[#6A6D6C] hover:text-[#1C1E1D]"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="text-[#6A6D6C] text-sm py-4 border-t border-[#E4E6E5]">
          Loading records...
        </div>
      ) : items.length === 0 ? (
        <div className="text-[#6A6D6C] text-sm py-4 border-t border-[#E4E6E5]">
          No products currently tracked.
        </div>
      ) : (
        <div className="border-t border-[#E4E6E5]">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-4 border-b border-[#E4E6E5] flex flex-col sm:flex-row sm:justify-between sm:items-start group"
            >
              <div className="mb-2 sm:mb-0">
                <a 
                  href={`https://demo.inelabteamdev.com/item/${item.product_options.products.store_product_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-[#1C1E1D] hover:underline"
                >
                  {item.product_options.products.name}
                </a>
                <div className="text-sm text-[#6A6D6C] mt-1">
                  Variant: {item.product_options.label}
                </div>
              </div>

              <div className="text-sm text-[#6A6D6C] sm:text-right">
                <div>Active</div>
                <div className="mt-1">Since {new Date(item.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
