import { useState, useEffect } from 'react';
import { getTrackedItems, getScrapeHistory, type TrackedItem, type ScrapeHistory } from '../api';

export default function Dashboard() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for expanded history
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, ScrapeHistory[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

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

  const toggleHistory = async (itemId: string) => {
    if (expandedId === itemId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(itemId);
    
    // Only fetch if we haven't already
    if (!historyMap[itemId]) {
      setLoadingHistory(prev => ({ ...prev, [itemId]: true }));
      try {
        const history = await getScrapeHistory(itemId);
        setHistoryMap(prev => ({ ...prev, [itemId]: history }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingHistory(prev => ({ ...prev, [itemId]: false }));
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
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
            <div key={item.id} className="border-b border-[#E4E6E5]">
              <div className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start group">
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
                  <button 
                    onClick={() => toggleHistory(item.id)}
                    className="mt-3 text-xs text-[#2C503D] uppercase tracking-wide hover:underline"
                  >
                    {expandedId === item.id ? 'Hide Log' : 'View Scrape Log'}
                  </button>
                </div>

                <div className="text-sm text-[#6A6D6C] sm:text-right">
                  <div>Active</div>
                  <div className="mt-1">Since {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              {expandedId === item.id && (
                <div className="pb-4">
                  {loadingHistory[item.id] ? (
                    <div className="text-xs text-[#6A6D6C] py-2 bg-[#F0F0F0] px-4">Loading history...</div>
                  ) : historyMap[item.id]?.length === 0 ? (
                    <div className="text-xs text-[#6A6D6C] py-2 bg-[#F0F0F0] px-4">No scrape events yet. Wait for cron job.</div>
                  ) : (
                    <div className="bg-[#FFFFFF] border border-[#E4E6E5] text-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E4E6E5] bg-[#F9F9F8]">
                            <th className="py-2 px-4 font-medium text-[#6A6D6C]">Date/Time</th>
                            <th className="py-2 px-4 font-medium text-[#6A6D6C]">Outcome</th>
                            <th className="py-2 px-4 font-medium text-[#6A6D6C]">Price</th>
                            <th className="py-2 px-4 font-medium text-[#6A6D6C]">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyMap[item.id]?.map((log) => (
                            <tr key={log.id} className="border-b border-[#E4E6E5] last:border-b-0">
                              <td className="py-2 px-4 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="py-2 px-4 capitalize">
                                <span className={log.outcome === 'success' ? 'text-[#2C503D]' : 'text-red-700'}>
                                  {log.outcome}
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                {log.price !== null ? `$${log.price}` : '-'}
                              </td>
                              <td className="py-2 px-4">
                                {log.stock || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
