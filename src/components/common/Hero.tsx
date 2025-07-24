"use client"
import React, { useState, useCallback, useEffect } from 'react';
import Footer from "@/components/sections/Footer";
import Navbar from './Navbar';
import "@/app/globals.css";
import ComingSoonModal from '../../pages/ComingSoonModal';
import { Plus, UploadCloud, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { 
  WalletModalProvider, 
  WalletMultiButton, 
  WalletDisconnectButton 
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter 
} from '@solana/wallet-adapter-wallets';

require('@solana/wallet-adapter-react-ui/styles.css');

// Define Toast types
type ToastType = 'success' | 'error' | 'info';

interface ToastAlert {
  type: ToastType;
  message: string;
}

interface Freelancer {
  name: string;
  avatar: string;
  skills?: string[];
}

interface Job {
  id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  freelancer: Freelancer;
}

interface FreelancerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: Freelancer | null;
}

interface JobCardProps {
  job: Job;
  onProfileClick: (freelancer: Freelancer) => void;
}

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostGigModal: React.FC<PostGigModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    image: null as File | null,
    subject: '',
    description: '',
    amount: '',
    category: '',
    tags: '' as string | string[],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  const showToast = (type: ToastType, message: string) => {
    setToastAlert({ type, message });
    setTimeout(() => setToastAlert(null), 5000);
  };

  // Check verification status with better error handling
  useEffect(() => {
    const checkVerification = async () => {
      if (!publicKey || !connected) {
        return;
      }

      try {
        const walletAddress = publicKey.toString();
        const response = await fetch(`/api/profile/check-email?wallet=${encodeURIComponent(walletAddress)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Verification check failed:', response.status, errorText);
          
          if (response.status === 404) {
            showToast('error', 'User not found. Please complete your profile setup.');
            setTimeout(() => {
              router.push('/profile');
            }, 2000);
            return;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to check verification status'}`);
        }
        
        const data = await response.json();
        if (!data.isVerified) {
          showToast('error', 'Please verify your email before posting a gig');
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
        }
      } catch (error) {
        console.error('Verification check error:', error);
        setError('Failed to check verification status. Please try again.');
        showToast('error', 'Failed to check verification status');
      }
    };

    if (connected && publicKey && isOpen) {
      checkVerification();
    }
  }, [publicKey, connected, router, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'Image size must be less than 10MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
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
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('Uploading file:', { name: file.name, size: file.size, type: file.type });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Image upload failed (Status: ${response.status})`);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No URL returned from server');
      }

      console.log('Image uploaded successfully:', data.url);
      return data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!publicKey) {
        throw new Error('Please connect your wallet to post a gig');
      }

      if (!formData.subject || !formData.description || !formData.amount) {
        throw new Error('Please fill in all required fields (Subject, Description, Amount)');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        throw new Error('Please enter a valid amount between 0.01 and 1000 SOL');
      }

      const walletAddress = publicKey.toString();
      console.log('Fetching user for wallet:', walletAddress);

      // Verify user and get User.id with better error handling
      const userResponse = await fetch(`/api/users?wallet=${encodeURIComponent(walletAddress)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('User fetch failed:', userResponse.status, errorText);
        
        if (userResponse.status === 404) {
          throw new Error('User not found. Please register your wallet first.');
        }
        
        throw new Error(`Failed to fetch user: HTTP ${userResponse.status}`);
      }

      let userData;
      try {
        userData = await userResponse.json();
      } catch (parseError) {
        console.error('Failed to parse user response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!userData || !userData.id) {
        console.error('Invalid user data received:', userData);
        throw new Error('User not found or invalid user data. Please register your wallet.');
      }

      if (!userData.emailVerified) {
        throw new Error('Please verify your email before posting a gig');
      }

      console.log('User verified, proceeding with gig creation for user ID:', userData.id);

      const tags = Array.isArray(formData.tags)
        ? formData.tags
        : formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const gigData = {
        title: formData.subject,
        description: formData.description,
        amount,
        image: imageUrl,
        status: 'ACTIVE',
        userId: userData.id, // Use User.id (cuid), not walletAddress
        category: formData.category || null,
        tags,
      };

      console.log('Creating gig with data:', gigData);

      const response = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gigData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gig creation failed:', response.status, errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Failed to create gig: HTTP ${response.status}`);
        }
        
        throw new Error(errorData.error || 'Failed to create gig');
      }

      showToast('success', 'Gig Posted Successfully! 🎉');
      setFormData({
        image: null,
        subject: '',
        description: '',
        amount: '',
        category: '',
        tags: '',
      });
      setPreviewUrl(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const error = err as Error;
      console.error('Gig creation error:', error);
      setError(error.message);
      showToast('error', error.message);
      
      if (error.message.includes('email verification') || 
          error.message.includes('User not found') ||
          error.message.includes('register your wallet')) {
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        {toastAlert && (
          <div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
              toastAlert.type === 'success'
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
          <h2 className="text-xl font-bold text-white mb-6">Post a New Gig</h2>

          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Gig Image <span className="text-gray-400">(optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
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
                      Click to upload image
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

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                placeholder="Enter gig subject"
                disabled={isLoading}
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent resize-none"
                placeholder="Describe your gig in detail"
                disabled={isLoading}
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Category <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                placeholder="e.g., Smart Contract Development"
                disabled={isLoading}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Tags <span className="text-gray-400">(optional, comma-separated)</span>
              </label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                placeholder="e.g., blockchain, solidity, web3"
                disabled={isLoading}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

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

            <button
              type="submit"
              disabled={isLoading || !formData.subject || !formData.description || !formData.amount}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Post Gig'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const FreelancerProfileModal: React.FC<FreelancerProfileModalProps> = ({ isOpen, onClose, freelancer }) => {
  if (!isOpen || !freelancer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
      <div className="bg-[#1A1B1E] rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>

          <div className="flex items-center space-x-4 mb-6">
            <img
              src={freelancer.avatar}
              alt={freelancer.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-white font-bold">{freelancer.name}</h3>
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button className="bg-[#8B5CF6] text-white px-6 py-2 rounded-lg hover:bg-[#7C3AED]">
              HIRE
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-red-500">Not enough Sol</span>
              <div className="flex items-center space-x-2">
                <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                <span className="text-white">8 Sol</span>
              </div>
            </div>
          </div>

          <h3 className="text-white text-xl font-bold mb-4">UI/UX DESIGNER</h3>

          <p className="text-gray-400 mb-6">
            Thousands of sponsorship jobs are advertised daily. If you haven't landed one,
            you're not looking in the right place.
          </p>

          <div className="mb-6">
            <h4 className="text-white font-bold mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-[#26272B] text-white px-4 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold mb-2">Portfolio</h4>
              <a
                href="#"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white"
              >
                <span>Website</span>
              </a>
            </div>

            <div>
              <h4 className="text-white font-bold mb-2">Socials</h4>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-white">X.com</a>
                <a href="#" className="text-gray-400 hover:text-white">Telegram</a>
                <a href="#" className="text-gray-400 hover:text-white">Discord</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WalletConnectionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#1A1B1E] to-[#2C2C2E] rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your Solana wallet to continue.</p>
          <div className="flex justify-center">
            <WalletMultiButton
              className="!bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6B2CF5] !transition-all !duration-200 !rounded-xl !px-8 !py-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ZapIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const StarIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const JobCard: React.FC<JobCardProps> = ({ job, onProfileClick }) => (
  <div className="bg-[#1A1B1E] rounded-lg overflow-hidden border border-[#26272B] hover:shadow-lg transition-shadow">
    <div className="relative h-[140px]">
      <img
        src={job.image}
        alt={job.title}
        className="w-full h-full object-cover"
      />
      <button className="absolute top-2 right-2 p-1 bg-[#26272B] rounded">
        <img src="/images/bookmark.png" alt="Bookmark" className="w-3 h-3" />
      </button>
    </div>
    <div className="p-3">
      <div
        className="flex items-center space-x-2 mb-2 cursor-pointer"
        onClick={() => onProfileClick(job.freelancer)}
      >
        <img
          src={job.freelancer.avatar}
          alt={job.freelancer.name}
          className="w-5 h-5 rounded-full"
        />
        <span className="text-white text-xs font-medium truncate">{job.freelancer.name}</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">{job.title}</h3>
      <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{job.description}</p>
      <div className="flex justify-between items-center">
        <button className="bg-[#1E1E1E] text-white px-3 py-1 rounded text-xs hover:bg-[#2A2A2A] transition-colors">
          HIRE
        </button>
        <div className="flex items-center space-x-1">
          <img src="/images/sol-logo.png" alt="SOL" className="w-3 h-3" />
          <span className="text-white text-xs font-medium">{job.price} Sol</span>
        </div>
      </div>
    </div>
  </div>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeroWithWallet: React.FC = () => {
  const endpoint = clusterApiUrl('devnet');
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Hero />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

interface HeroProps {
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isPostGigModalOpen, setIsPostGigModalOpen] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [gigs, setGigs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  const navItems = [
    { title: 'DASHBOARD', href: '/dashboard' },
    { title: 'INBOX', href: '/inbox' },
    { title: 'PROFILE', href: '/profile' },
    { title: 'MARKETPLACE', href: '/' },
    { title: 'SOLEER HOME', href: 'https://www.soleer.xyz' },
    { title: 'FAQ', href: 'https://www.soleer.xyz/faq' },
  ];

  const handleOpenPostGigModal = async () => {
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/profile/check-email?wallet=${encodeURIComponent(publicKey?.toString() || '')}`);
      if (!response.ok) {
        throw new Error('Failed to check verification status');
      }
      const data = await response.json();
      if (!data.isVerified) {
        router.push('/profile');
      } else {
        setIsPostGigModalOpen(true);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      router.push('/profile');
    }
  };

  const handleProfileClick = useCallback((freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsFreelancerModalOpen(true);
  }, []);

  // Fetch all gigs
  useEffect(() => {
    const fetchGigs = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/gigs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch gigs:', response.status, errorText);
          throw new Error(`Failed to fetch gigs: HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Gigs fetched successfully:', data);
        setGigs(data);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to fetch gigs';
        console.error('Gig fetch error:', err);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url("/images/Ellipse-why.png")',
          backgroundBlendMode: 'overlay',
        }}
      />
      <div className="relative z-50">
        <Navbar navItems={navItems} title="" description="" />
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Marketplace</h1>
          <button
            onClick={handleOpenPostGigModal}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-2 px-4 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5]"
          >
            Post a Gig
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
            <span className="ml-2 text-white">Loading gigs...</span>
          </div>
        ) : error ? (
          <Alert className="mb-8 bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No gigs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <JobCard
                key={gig.id}
                job={gig}
                onProfileClick={handleProfileClick}
              />
            ))}
          </div>
        )}

        {children}
      </main>
      <WalletConnectionModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <PostGigModal isOpen={isPostGigModalOpen} onClose={() => setIsPostGigModalOpen(false)} />
      <FreelancerProfileModal
        isOpen={isFreelancerModalOpen}
        onClose={() => setIsFreelancerModalOpen(false)}
        freelancer={selectedFreelancer}
      />
    
    </div>
  );
};

export default HeroWithWallet;