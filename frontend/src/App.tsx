import { useState } from 'react';
import Search from './components/Search';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search'>('dashboard');

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-[#1C1E1D] font-sans antialiased">
      <nav className="border-b border-[#E4E6E5] bg-[#F9F9F8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-baseline justify-between py-6">
            <div className="text-xl font-medium tracking-tight">
              Price Tracker
            </div>
            
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'text-[#1C1E1D] border-b border-[#1C1E1D] pb-1' 
                    : 'text-[#6A6D6C] hover:text-[#1C1E1D] pb-1'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`transition-colors ${
                  activeTab === 'search' 
                    ? 'text-[#1C1E1D] border-b border-[#1C1E1D] pb-1' 
                    : 'text-[#6A6D6C] hover:text-[#1C1E1D] pb-1'
                }`}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {activeTab === 'dashboard' ? <Dashboard /> : <Search />}
      </main>
    </div>
  );
}

export default App;
