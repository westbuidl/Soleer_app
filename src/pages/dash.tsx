import React, { useState, useRef, useEffect, useCallback } from 'react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, Edit3, Pause, Play, Trash2, UploadCloud, X } from 'lucide-react';
import "../olapp/globals.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';
//import React, { useState, useCallback } from 'react';
//import { X, UploadCloud, Loader2, Edit3, Trash2, Pause, Play } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";


// Interface definitions
interface Gig {
  id: number;
  title: string;
  description: string;
  image: string | null;
  amount: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

interface GigCardProps {
  image: string;
  status: 'completed' | 'active';
  title: string;
  description: string;
  price: number;
  gig: Gig;
  onManage: (gig: Gig) => void;
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
interface EditGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: Gig | null;
  onGigUpdated: (updatedGig: Gig) => void;
  onGigDeleted: (gigId: number) => void;
}

interface EditFormData {
  title: string;
  description: string;
  amount: string;
  category: string;
  tags: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  image: File | null;
}

// Toast types
type ToastType = 'success' | 'error' | 'info';

interface ToastAlert {
  type: ToastType;
  message: string;
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
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${selectedRange === range ? 'text-purple-500' : 'text-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const GigCard: React.FC<GigCardProps> = ({ image, status, title, description, price, gig, onManage }) => (
  <div className="bg-[#1A1B1E] rounded-lg overflow-hidden border border-[#26272B] hover:shadow-xl hover:shadow-[#8B5CF6]/20 hover:border-[#8B5CF6]/30 hover:scale-[1.02] transition-all duration-300 cursor-pointer group w-full max-w-[280px]">
    <div className="relative h-[160px] overflow-hidden">
      <img
        src={image || '/images/default-gig.png'}
        alt={title}
        className="w-full h-full object-contain bg-[#0F1014] group-hover:scale-105 transition-transform duration-300"
      />
      <button className="absolute top-2 right-2 p-1 bg-[#26272B]/80 backdrop-blur-sm rounded hover:bg-[#26272B] transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
    <div className="p-3">
      <div className="flex items-center space-x-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-4 h-4 rounded-full bg-[#8B5CF6]"></div>
        <span className="text-white text-xs font-medium truncate">You</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">{title}</h3>
      <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{description}</p>
      <div className="flex justify-between items-center">
        {status === 'completed' ? (
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs font-medium border border-green-500/30">
            Completed
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              onManage(gig);
            }}
            className="bg-[#1E1E1E] text-white px-3 py-1 rounded text-xs hover:bg-[#8B5CF6] hover:scale-105 transition-all duration-200"
          >
            MANAGE
          </button>
        )}
        <div className="flex items-center space-x-1">
          <img src="/images/sol-logo.png" alt="SOL" className="w-3 h-3" />
          <span className="text-white text-xs font-medium group-hover:text-[#8B5CF6] transition-colors">{price} Sol</span>
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
            className={`whitespace-nowrap pb-4 relative ${activeTab === tab.id
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

const EditGigModal: React.FC<EditGigModalProps> = ({
  isOpen,
  onClose,
  gig,
  onGigUpdated,
  onGigDeleted
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    description: '',
    amount: '',
    category: '',
    tags: '',
    status: 'ACTIVE',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Initialize form data when gig changes
  React.useEffect(() => {
    if (gig && isOpen) {
      setFormData({
        title: gig.title || '',
        description: gig.description || '',
        amount: gig.amount !== undefined && gig.amount !== null ? gig.amount.toString() : '',
        category: '', // Add category to Gig interface if needed
        tags: '', // Add tags to Gig interface if needed
        status: gig.status || 'ACTIVE',
        image: null
      });
      setPreviewUrl(gig.image || null);
      setError('');
      setConfirmDelete(false);
    }
  }, [gig, isOpen]);

  const showToast = (type: ToastType, message: string) => {
    setToastAlert({ type, message });
    setTimeout(() => setToastAlert(null), 5000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'Image size must be less than 10MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Please upload a valid image file');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Image upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  // Mock update function (replace with actual API call)
  const handleUpdateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gig) return;

    setError('');
    setIsLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        throw new Error('Please enter a valid amount between 0.01 and 1000 SOL');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedGig: Gig = {
        ...gig,
        title: formData.title,
        description: formData.description,
        amount: amount,
        status: formData.status,
        image: previewUrl
      };

      onGigUpdated(updatedGig);
      showToast('success', 'Gig updated successfully! 🎉');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showToast('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock delete function (replace with actual API call)
  const handleDeleteGig = async () => {
    if (!gig) return;

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onGigDeleted(gig.id);
      showToast('success', 'Gig deleted successfully');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showToast('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'PAUSED') => {
    if (!gig) return;

    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedGig: Gig = {
        ...gig,
        status: newStatus
      };

      onGigUpdated(updatedGig);
      setFormData({ ...formData, status: newStatus });
      showToast('success', `Gig ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      showToast('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !gig) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        {toastAlert && (
          <div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${toastAlert.type === 'success'
                ? 'bg-green-500'
                : toastAlert.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              } text-white text-sm font-medium`}
          >
            {toastAlert.message}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white z-10"
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Manage Gig
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${gig.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  gig.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                    gig.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                }`}>
                {gig.status}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-[#26272B] rounded-lg">
            <button
              onClick={() => handleStatusChange(gig.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${gig.status === 'ACTIVE'
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
            >
              {gig.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
              <span>{gig.status === 'ACTIVE' ? 'Pause Gig' : 'Activate Gig'}</span>
            </button>

            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete Gig</span>
            </button>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {confirmDelete && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h3 className="text-red-400 font-medium mb-2">Confirm Deletion</h3>
              <p className="text-gray-400 text-sm mb-4">
                Are you sure you want to delete this gig? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteGig}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateGig} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Gig Image
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(gig.image);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-800/20 rounded-lg transition-colors">
                    <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-400 text-sm text-center">
                      Click to upload new image
                      <br />
                      <span className="text-xs">Max 10MB • JPEG, PNG, GIF, WebP</span>
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                placeholder="Enter gig title"
                disabled={isLoading}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent resize-none"
                placeholder="Describe your gig"
                disabled={isLoading}
                required
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                  placeholder="e.g., Web Development"
                  disabled={isLoading}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Amount (SOL) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#26272B] text-white rounded-lg p-3 pr-16 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max="1000"
                    disabled={isLoading}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                    <span className="text-gray-400 text-sm">SOL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Tags <span className="text-gray-400">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                placeholder="e.g., react, typescript, web3"
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title || !formData.description || !formData.amount}
                className="px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Gig'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
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
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoadingGigs, setIsLoadingGigs] = useState(false);
  const [gigError, setGigError] = useState('');
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  // Function to handle time range changes for different metrics
  const handleTimeRangeChange = (metric: keyof typeof timeRanges, range: string) => {
    setTimeRanges(prev => ({
      ...prev,
      [metric]: range
    }));
  };

  // Fetch gigs for the connected wallet
  useEffect(() => {
    const fetchGigs = async () => {
      if (!connected || !publicKey || activeTab !== 'active') {
        setGigs([]);
        setIsLoadingGigs(false);
        return;
      }

      setIsLoadingGigs(true);
      setGigError('');
      try {
        const walletAddress = publicKey.toString();
        const encodedWallet = encodeURIComponent(walletAddress);
        console.log('Fetching gigs for wallet:', walletAddress);
        const response = await fetch(`/api/gigs?wallet=${encodedWallet}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch gigs');
        }

        const fetchedGigs = await response.json();
        console.log('Fetched gigs:', fetchedGigs);
        setGigs(fetchedGigs);
      } catch (error) {
        console.error('Error fetching gigs:', error);
        setGigError(error instanceof Error ? error.message : 'Failed to load gigs');
      } finally {
        setIsLoadingGigs(false);
      }
    };

    fetchGigs();
  }, [connected, publicKey, activeTab]);

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


  const [selectedGigForEdit, setSelectedGigForEdit] = useState<Gig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add these callback functions to your Dashboard component:
  const handleManageClick = useCallback((gig: Gig) => {
    setSelectedGigForEdit(gig);
    setIsEditModalOpen(true);
  }, []);

  const handleGigUpdated = useCallback((updatedGig: Gig) => {
    setGigs(prevGigs =>
      prevGigs.map(gig => gig.id === updatedGig.id ? updatedGig : gig)
    );
  }, []);

  const handleGigDeleted = useCallback((gigId: number) => {
    setGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigId));
  }, []);




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
    { title: 'DASHBOARD', href: '/dashboard' },
    { title: 'INBOX', href: '/inbox' },
    { title: 'PROFILE', href: '/profile' },
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
                <p className="text-2xl font-medium mt-2">{gigs.length}</p>
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
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Active Jobs</h2>
            {isLoadingGigs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span className="ml-2 text-white">Loading gigs...</span>
              </div>
            ) : gigError ? (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-500 font-medium">{gigError}</p>
              </div>
            ) : gigs.length === 0 ? (
              <EmptyState message="No active jobs yet. Your ongoing gigs will appear here." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {gigs.map(gig => (
                  <GigCard
                    key={gig.id}
                    image={gig.image || '/images/default-gig.png'}
                    status={gig.status === 'COMPLETED' ? 'completed' : 'active'}
                    title={gig.title}
                    description={gig.description}
                    price={gig.amount}
                    gig={gig}
                    onManage={handleManageClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Completed Jobs</h2>
            {gigs.filter(g => g.status === 'COMPLETED').length === 0 ? (
              <EmptyState message="No completed jobs yet. Your finished gigs will appear here." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {gigs.filter(g => g.status === 'COMPLETED').map(gig => (
                  <GigCard
                    key={gig.id}
                    image={gig.image || '/images/default-gig.png'}
                    status="completed"
                    title={gig.title}
                    description={gig.description}
                    price={gig.amount}
                    gig={gig}
                    onManage={handleManageClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <EmptyState message="No reviews yet. Your gig reviews will appear here." />
        )}

        {activeTab === 'analytics' && (
          <EmptyState message="No analytics data available yet. Your performance metrics will appear here." />
        )}
      </main>
      <EditGigModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        gig={selectedGigForEdit}
        onGigUpdated={handleGigUpdated}
        onGigDeleted={handleGigDeleted}
      />


      <Footer />
    </div>
  );
};

export default Dashboard;