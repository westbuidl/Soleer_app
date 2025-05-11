import React, { useState, useRef, useEffect } from 'react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import "../app/globals.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';

// Interface definitions
interface GigCardProps {
  image: string;
  status: 'completed' | 'active';
}
interface Tab {
  id: string;
  label: string;
}

interface ScrollableTabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

interface NavItem {
  title: string;
  href: string;
}

interface TimeRangeDropdownProps {
  selectedRange: string;
  onSelect: (range: string) => void;
  className?: string;
}

const TimeRangeDropdown: React.FC<TimeRangeDropdownProps> = ({ selectedRange, onSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeRanges = [
    'All time',
    'Last 24 hours',
    'Last 7 days',
    'Last 30 days',
    'Last 3 months',
    'Last 6 months',
    'Last year'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
      >
        <span>{selectedRange}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => {
                onSelect(range);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                selectedRange === range ? 'text-purple-500' : 'text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
const GigCard: React.FC<GigCardProps> = ({ image, status }) => (
  <div className="relative rounded-lg overflow-hidden bg-gray-900">
    <div className="aspect-square">
      <img src={image} alt="Gig preview" className="w-full h-full object-cover" />
    </div>
    <div className="p-4 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-gray-700"></div>
        <span className="text-white">Freexxyz</span>
        <button className="ml-auto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      <h3 className="text-white font-medium">UX designer</h3>
      <p className="text-gray-400 text-sm truncate">Brief description of this gig, Brief description of this gig...</p>
      <div className="flex justify-between items-center pt-2">
        {status === 'completed' ? (
          <span className="px-3 py-1 bg-green-900 text-green-400 rounded-md text-sm">Completed</span>
        ) : (
          <button className="px-4 py-1 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-700">
            Details
          </button>
        )}
        <div className="flex items-center space-x-1">
          <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
          <span className="text-white">8 SOL</span>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-900 rounded-lg">
    <img src="/images/icons/smart-contract.png" alt="No data" className="w-20 h-20 mb-4 opacity-50" />
    <p className="text-gray-400 text-center">{message}</p>
  </div>
);

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tabsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 p-1 rounded-full shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      
      <div
        ref={tabsRef}
        className="flex space-x-8 overflow-x-auto scrollbar-hide px-4 py-2 -mx-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-4 relative ${
              activeTab === tab.id 
                ? 'text-white border-b-2 border-purple-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 p-1 rounded-full shadow-lg"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRanges, setTimeRanges] = useState({
    earnings: 'All time',
    pendingPayments: 'All time',
    gigsCompleted: 'All time',
    transactions: 'This month'
  });
  const [showAlert, setShowAlert] = useState(false);
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  // Function to handle time range changes for different metrics
  const handleTimeRangeChange = (metric: keyof typeof timeRanges, range: string) => {
    setTimeRanges(prev => ({
      ...prev,
      [metric]: range
    }));
    
    // Here you would typically fetch new data based on the selected time range
    // For example:
    // fetchMetricData(metric, range);
  };

  const renderStatsCard = (
    label: string, 
    value: string | number, 
    icon?: React.ReactNode,
    timeRangeKey?: keyof typeof timeRanges
  ) => (
    <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400">{label}</span>
        {timeRangeKey && (
          <TimeRangeDropdown
            selectedRange={timeRanges[timeRangeKey]}
            onSelect={(range) => handleTimeRangeChange(timeRangeKey, range)}
          />
        )}
      </div>
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-2xl font-medium">{value}</span>
      </div>
    </div>
  );
  
  const tabs: Tab[] = [
    { id: 'stats', label: 'Job earnings & stats' },
    { id: 'saved', label: 'Saved' },
    { id: 'hires', label: 'My Hires' },
    { id: 'active', label: 'Active Jobs' },
    { id: 'completed', label: 'Completed Jobs' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const navItems = [
    { title: 'DASHBOARD', href: '../dashboard' },
    { title: 'INBOX', href: '../inbox' },
    { title: 'PROFILE', href: '../profile' },
    { title: 'MARKETPLACE', href: '/' },
    { title: 'SOLEER HOME', href: 'https://www.soleer.xyz' },
    { title: 'FAQ', href: 'https://www.soleer.xyz/faq' },
  ];

  useEffect(() => {
    // Check wallet connection status
    if (!connected) {
      setShowAlert(true);
      // Redirect after a short delay
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [connected, router]);

  if (showAlert) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white p-4">
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 max-w-md mx-auto mt-8">
          <p className="text-white text-center">
            Please connect your wallet to access your profile. Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }


  return (
    
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url("/images/Ellipse-why.png")',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      <div className="relative z-50">
        <Navbar navItems={navItems} title={''} description={''} />
      </div>
      
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto relative">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="border-b border-gray-800 mb-8">
          <ScrollableTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {renderStatsCard(
                "Earnings",
                "0 SOL",
                <img src="/images/sol-logo.png" alt="SOL" className="w-5 h-5" />,
                "earnings"
              )}
              {renderStatsCard(
                "Pending payments",
                "0 SOL",
                <img src="/images/sol-logo.png" alt="SOL" className="w-5 h-5" />,
                "pendingPayments"
              )}
              {renderStatsCard(
                "Gigs Completed",
                "0",
                undefined,
                "gigsCompleted"
              )}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                <span className="text-gray-400">Total Gigs worked on</span>
                <p className="text-2xl font-medium mt-2">0</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Gigs</span>
                  <button className="text-purple-500 hover:text-purple-400">View</button>
                </div>
                <p className="text-2xl font-medium mt-2">0</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gigs Completion rate</span>
                  <button className="text-purple-500 hover:text-purple-400">View</button>
                </div>
                <p className="text-2xl font-medium mt-2">0%</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Transaction history</h2>
                <TimeRangeDropdown
                  selectedRange={timeRanges.transactions}
                  onSelect={(range) => handleTimeRangeChange('transactions', range)}
                  className="w-full sm:w-auto"
                />
              </div>

              <EmptyState message="No transactions yet. Your transaction history will appear here." />
            </div>
          </>
        )}

        {activeTab === 'saved' && (
          <EmptyState message="No saved gigs yet. Your saved gigs will appear here." />
        )}

        {activeTab === 'hires' && (
          <EmptyState message="No hires yet. Your hired freelancers will appear here." />
        )}

        {activeTab === 'active' && (
          <EmptyState message="No active jobs yet. Your ongoing gigs will appear here." />
        )}

        {activeTab === 'completed' && (
          <EmptyState message="No completed jobs yet. Your finished gigs will appear here." />
        )}

        {activeTab === 'reviews' && (
          <EmptyState message="No reviews yet. Your gig reviews will appear here." />
        )}

        {activeTab === 'analytics' && (
          <EmptyState message="No analytics data available yet. Your performance metrics will appear here." />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;