"use client"
import React, { useState, useCallback, useEffect } from 'react';
import Footer from "@/components/sections/Footer";
import Navbar from './Navbar';
//import { useRouter } from 'next/router';
import "@/app/globals.css";
import { Plus, UploadCloud, X, Loader2, Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Grid3x3, List, Share2, Copy, Check, ExternalLink, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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
import { clusterApiUrl, Transaction } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import router from 'next/router';

require('@solana/wallet-adapter-react-ui/styles.css');

// Version number for the marketplace
const MARKETPLACE_VERSION = "v2.2.1";

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
  category?: string;
  tags?: string[];
  createdAt?: string;
  userId?: string; // Added to identify gig owner
}

interface Freelancer {
  id: string; // Maps to User.id
  name: string;
  avatar: string;
  skills?: string[];
  website?: string;
  twitter?: string;
  discord?: string;
  bio?: string;
  hourlyRate?: number; // Optional, as not directly in User model but may be derived
}

interface JobProfile {
  title?: string;
  skills?: string[];
  description?: string;
  hourlyRate?: number;
}

interface FreelancerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: Freelancer | null;
}

interface SavedGig {
  id: string;
  gigId: string;
  userId: string;
  createdAt: string;
}

interface JobCardProps {
  job: Job;
  onProfileClick: (freelancer: Freelancer) => void;
  onGigClick: (job: Job) => void;
  viewMode: 'grid' | 'list';
  currentUserId?: string;
  onHireClick: (job: Job) => void;
  onSaveClick: (job: Job) => void; // Add save click handler
  savedGigs: Set<string>; // Add saved gigs set
}

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GigDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: Job | null;
  currentUserId?: string;
}



// Search and Filter interfaces
interface SearchFilters {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'title';
}

// New Hire-related interfaces
interface HireRequest {
  id: string;
  gigId: string;
  gigTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  message: string;
  deadline?: string;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: Job | null;
  currentUserId?: string;
  onHireSuccess: () => void;
}

interface HireRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hireRequests: HireRequest[];
  onStatusUpdate: (requestId: string, status: HireRequest['status']) => void;
}


// Hire Modal Component
const HireModal: React.FC<HireModalProps> = ({ isOpen, onClose, gig, currentUserId, onHireSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    deadline: '',
    requirements: '',
    customAmount: '',
    useCustomAmount: false
  });

  const { connected, publicKey, signTransaction } = useWallet();
  const router = useRouter();

  const showToast = (type: ToastType, message: string) => {
    setToastAlert({ type, message });
    setTimeout(() => setToastAlert(null), 5000);
  };

  useEffect(() => {
    if (isOpen && gig) {
      setFormData({
        message: `Hi ${gig.freelancer.name}, I'm interested in hiring you for "${gig.title}". Let's discuss the details!`,
        deadline: '',
        requirements: '',
        customAmount: gig.price.toString(),
        useCustomAmount: false
      });
      setError('');
    }
  }, [isOpen, gig]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gig || !currentUserId || !connected || !publicKey) {
      setError('Please connect your wallet and ensure you are logged in');
      showToast('error', 'Wallet connection required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.message.trim()) {
        throw new Error('Please provide a message to the freelancer');
      }

      if (formData.deadline && new Date(formData.deadline) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      const finalAmount = formData.useCustomAmount ?
        parseFloat(formData.customAmount) : gig.price;

      if (isNaN(finalAmount) || finalAmount <= 0) {
        throw new Error('Please provide a valid amount');
      }

      // Create hire request payload
      const hireRequestData = {
        gigId: gig.id,
        clientWallet: publicKey.toString(),
      };

      console.log('Sending hire request:', hireRequestData);

      // Send hire request to API
      const hireResponse = await fetch('/api/hire-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicKey.toString()}`
        },
        body: JSON.stringify(hireRequestData),
      });

      console.log('Hire response status:', hireResponse.status);
      const responseText = await hireResponse.text();
      console.log('Hire response text:', responseText);

      if (!hireResponse.ok) {
        try {
          const parsedError = JSON.parse(responseText);
          throw new Error(parsedError.error || `Failed to create hire request: HTTP ${hireResponse.status}`);
        } catch {
          throw new Error(`Unexpected response from server: ${responseText.substring(0, 200)}...`);
        }
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error('Failed to parse response as JSON');
      }

      const { hireId, transaction: transactionBase64, conversationId } = responseData;

      // Sign the transaction
      try {
        const transactionBuffer = Buffer.from(transactionBase64, 'base64');
        const transaction = Transaction.from(transactionBuffer);
        if (!signTransaction) {
          throw new Error('Wallet does not support transaction signing');
        }
        const signedTransaction = await signTransaction(transaction);
        const serializedSignedTransaction = signedTransaction.serialize().toString('base64');

        console.log('Sending PATCH request for hireId:', hireId);

        // Update hire request with transaction ID
        const updateResponse = await fetch(`/api/hire-requests/${hireId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey.toString()}`
          },
          body: JSON.stringify({
            status: 'PENDING',
            transactionId: serializedSignedTransaction,
          }),
        });

        console.log('Update response status:', updateResponse.status);
        const updateResponseText = await updateResponse.text();
        console.log('Update response text:', updateResponseText);

        if (!updateResponse.ok) {
          try {
            const errorData = JSON.parse(updateResponseText);
            throw new Error(errorData.error || 'Failed to update hire request');
          } catch {
            throw new Error(`Unexpected update response: ${updateResponseText.substring(0, 200)}...`);
          }
        }
      } catch (signError) {
        console.error('Transaction signing error:', signError);
        // Update hire request to FAILED status
        await fetch(`/api/hire-requests/${hireId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey.toString()}`
          },
          body: JSON.stringify({
            status: 'FAILED',
          }),
        });
        throw new Error('Failed to sign transaction');
      }

      showToast('success', 'Hire request sent successfully! 🎉');
      onHireSuccess();

      setTimeout(() => {
        onClose();
        router.push(`/inbox?conversationId=${conversationId}`);
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Hire request error:', err);
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !gig) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#26272B] shadow-2xl">
        {toastAlert && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${toastAlert.type === 'success' ? 'bg-green-500' :
              toastAlert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white text-sm font-medium`}>
            {toastAlert.message}
          </div>
        )}

        <div className="sticky top-0 bg-[#1A1B1E] border-b border-[#26272B] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Hire {gig.freelancer.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#26272B] rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <img src={gig.image} alt={gig.title} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{gig.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{gig.description.substring(0, 100)}...</p>
                  <div className="flex items-center space-x-2">
                    <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                    <span className="text-white font-medium">{gig.price} SOL</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Message to Freelancer <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent resize-none"
                placeholder="Describe your project requirements and expectations..."
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000 characters</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useCustomAmount"
                  checked={formData.useCustomAmount}
                  onChange={(e) => setFormData({ ...formData, useCustomAmount: e.target.checked })}
                  className="w-4 h-4 text-[#8B5CF6] bg-[#26272B] border-gray-600 rounded focus:ring-[#8B5CF6]"
                />
                <label htmlFor="useCustomAmount" className="text-white text-sm">
                  Negotiate custom amount
                </label>
              </div>

              {formData.useCustomAmount && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Proposed Amount (SOL) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.customAmount}
                      onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                      className="w-full bg-[#26272B] text-white rounded-lg p-3 pr-16 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      max="10000"
                      required={formData.useCustomAmount}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                      <span className="text-gray-400 text-sm">SOL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Project Deadline <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Additional Requirements <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full bg-[#26272B] text-white rounded-lg p-3 h-24 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent resize-none"
                placeholder="Any specific requirements, deliverables, or expectations..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.requirements.length}/500 characters</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#26272B] text-white py-3 px-6 rounded-lg hover:bg-[#333] transition-colors border border-gray-600"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.message.trim()}
                className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 px-6 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Hire Request
                    <span className="ml-2">🚀</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



// Hire Request Status Component
const HireRequestCard: React.FC<{
  request: HireRequest;
  onStatusUpdate: (requestId: string, status: HireRequest['status']) => void;
  isFreelancer: boolean;
}> = ({ request, onStatusUpdate, isFreelancer }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: HireRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10';
      case 'ACCEPTED': return 'text-green-400 bg-green-400/10';
      case 'DECLINED': return 'text-red-400 bg-red-400/10';
      case 'COMPLETED': return 'text-blue-400 bg-blue-400/10';
      case 'CANCELLED': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: HireRequest['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'DECLINED': return <X className="w-4 h-4" />;
      case 'COMPLETED': return <Check className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (newStatus: HireRequest['status']) => {
    setIsLoading(true);
    try {
      await onStatusUpdate(request.id, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#26272B] rounded-lg p-4 border border-[#333]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-white font-semibold">{request.gigTitle}</h3>
          <p className="text-gray-400 text-sm">
            {isFreelancer ? `From: ${request.clientName}` : `To: ${request.freelancerName}`}
          </p>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          <span>{request.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
          <span className="text-white font-medium">{request.amount} SOL</span>
        </div>

        {request.deadline && (
          <p className="text-gray-400 text-sm">
            Deadline: {new Date(request.deadline).toLocaleDateString()}
          </p>
        )}

        <p className="text-gray-300 text-sm">{request.message}</p>

        {request.requirements && (
          <div className="bg-[#1A1B1E] rounded p-2 mt-2">
            <p className="text-gray-400 text-xs font-medium mb-1">Requirements:</p>
            <p className="text-gray-300 text-sm">{request.requirements}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">
          {new Date(request.createdAt).toLocaleDateString()}
        </span>

        {isFreelancer && request.status === 'PENDING' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate('DECLINED')}
              disabled={isLoading}
              className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={() => handleStatusUpdate('ACCEPTED')}
              disabled={isLoading}
              className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        )}

        {request.status === 'ACCEPTED' && (
          <button
            onClick={() => handleStatusUpdate('COMPLETED')}
            disabled={isLoading}
            className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
};

// Social media sharing utilities
// Fixed Social media sharing utilities with better error handling
const shareToTwitter = (title: string, description: string, url: string) => {
  try {
    const text = `Check out this gig: ${title} - ${description.substring(0, 100)}...`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  } catch (error) {
    console.error('Error sharing to Twitter:', error);
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(`${title} - ${description} - ${url}`);
    alert('Link copied to clipboard! You can now paste it on Twitter.');
  }
};

const shareToInstagram = (title: string, description: string) => {
  try {
    const text = `Check out this gig: ${title}\n\n${description}\n\nVisit our marketplace to learn more!`;
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard! You can now paste it in your Instagram post or story.');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    alert('Unable to copy to clipboard. Please copy the gig details manually.');
  }
};

const shareToTikTok = (title: string, description: string, url: string) => {
  try {
    const text = `Check out this amazing gig: ${title}! ${url}`;
    // For mobile, try to open TikTok app, otherwise copy to clipboard
    if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const tiktokUrl = `https://www.tiktok.com/upload?text=${encodeURIComponent(text)}`;
      window.open(tiktokUrl, '_blank');
    } else {
      navigator.clipboard.writeText(text);
      alert('Content copied to clipboard! You can now paste it when creating your TikTok video.');
    }
  } catch (error) {
    console.error('Error sharing to TikTok:', error);
    navigator.clipboard.writeText(`${title} - ${description} - ${url}`);
    alert('Link copied to clipboard!');
  }
};

// Social Share Component
// Fixed Social Share Component with proper URL handling
// Fixed Social Share Component with proper URL handling
const SocialShareButtons: React.FC<{
  gig: Job;
  showCopyLink?: boolean;
  showForAllUsers?: boolean;
}> = ({ gig, showCopyLink = true, showForAllUsers = false }) => {
  const [copied, setCopied] = useState(false);
  const [gigUrl, setGigUrl] = useState('');

  // Set gig URL safely with proper fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      // Use the dedicated gig page route
      const gigPath = `/gig/${gig.id}`;
      setGigUrl(`${baseUrl}${gigPath}`);
    }
  }, [gig.id]);

  const copyGigLink = async () => {
    try {
      // Ensure we have a URL to copy
      const urlToCopy = gigUrl || `${window.location.origin}/marketplace/gig/${gig.id}`;

      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API if available
        await navigator.clipboard.writeText(urlToCopy);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = urlToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error('Copy command failed');
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Optional: Show toast notification
      console.log('Gig link copied successfully:', urlToCopy);

    } catch (err) {
      console.error('Failed to copy link:', err);

      // Show user-friendly error message
      alert(`Failed to copy link automatically. Please copy this URL manually:\n\n${gigUrl || `${window.location.origin}/marketplace/gig/${gig.id}`}`);
    }
  };

  // Updated share functions with better URL handling
  const shareToTwitter = (title: string, description: string, url: string) => {
    try {
      const text = `Check out this gig: ${title}`;
      const hashtags = 'solana,web3,freelance,marketplace';
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      copyGigLink(); // Fallback to copying link
    }
  };

  const shareToInstagram = (title: string, description: string) => {
    try {
      const text = `🚀 Check out this amazing gig: ${title}\n\n${description.substring(0, 150)}${description.length > 150 ? '...' : ''}\n\n💼 Available on our Solana marketplace!\n\n#solana #web3 #freelance #marketplace`;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      alert('Content copied to clipboard! You can now paste it in your Instagram post or story.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Unable to copy to clipboard. Please copy the gig details manually.');
    }
  };

  const shareToTikTok = (title: string, description: string, url: string) => {
    try {
      const text = `🔥 Amazing gig alert: ${title}!\n\n💰 Available on Solana marketplace\n🔗 ${url}\n\n#solana #web3 #freelance #gig`;

      // For mobile devices, try to open TikTok
      if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Copy to clipboard first
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text);
        }

        // Try to open TikTok app
        const tiktokUrl = `https://www.tiktok.com/upload`;
        window.open(tiktokUrl, '_blank');
        alert('Content copied to clipboard! Paste it when creating your TikTok video.');
      } else {
        // Desktop - just copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        alert('Content copied to clipboard! You can now paste it when creating your TikTok video.');
      }
    } catch (error) {
      console.error('Error sharing to TikTok:', error);
      copyGigLink(); // Fallback to copying link
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => shareToTwitter(gig.title, gig.description, gigUrl)}
        className="flex items-center space-x-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-3 py-2 rounded-lg transition-colors text-sm"
        type="button"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
        <span>Twitter</span>
      </button>

      <button
        onClick={() => shareToInstagram(gig.title, gig.description)}
        className="flex items-center space-x-2 bg-gradient-to-r from-[#E4405F] to-[#F56040] hover:from-[#d63384] hover:to-[#e85d37] text-white px-3 py-2 rounded-lg transition-colors text-sm"
        type="button"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        <span>Instagram</span>
      </button>

      <button
        onClick={() => shareToTikTok(gig.title, gig.description, gigUrl)}
        className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-colors text-sm"
        type="button"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
        <span>TikTok</span>
      </button>

      {showCopyLink && (
        <button
          onClick={copyGigLink}
          className="flex items-center space-x-2 bg-[#26272B] hover:bg-[#333] text-white px-3 py-2 rounded-lg transition-colors text-sm border border-gray-600"
          type="button"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      )}
    </div>
  );
};
interface GigDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: Job | null;
  currentUserId?: string;
  onHireClick: (gig: Job) => void; // Add hire click handler
}
// Updated GigDetailModal with always-visible sharing buttons
const GigDetailModal: React.FC<GigDetailModalProps> = ({ isOpen, onClose, gig, currentUserId, onHireClick }) => {
  const router = useRouter();

  if (!isOpen || !gig) return null;

  const isOwner = currentUserId && gig.userId === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#26272B] shadow-2xl">
        <div className="sticky top-0 bg-[#1A1B1E] border-b border-[#26272B] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Gig Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div>
              <div className="relative h-64 lg:h-80 overflow-hidden rounded-lg mb-6">
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-full object-contain bg-[#0F1014]"
                />
              </div>

              {/* Freelancer Info */}
              <div className="bg-[#26272B] rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={gig.freelancer.avatar}
                    alt={gig.freelancer.name}
                    className="w-12 h-12 rounded-full border-2 border-[#8B5CF6]"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{gig.freelancer.name}</h3>
                    <div className="flex text-yellow-400 text-sm">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                {!isOwner && (
                  <button
                    onClick={() => onHireClick(gig)}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all font-medium"
                  >
                    HIRE NOW
                  </button>
                )}
              </div>
              {/* Social Sharing - Now shows for everyone */}
              <div className="bg-[#26272B] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">
                  {isOwner ? 'Share Your Gig' : 'Share This Gig'}
                </h4>
                <SocialShareButtons gig={gig} showCopyLink={true} showForAllUsers={true} />
              </div>

            </div>



            {/* Right Column - Detailed Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{gig.title}</h1>
                <div className="flex items-center space-x-2">
                  <img src="/images/sol-logo.png" alt="SOL" className="w-6 h-6" />
                  <span className="text-2xl font-bold text-white">{gig.price} SOL</span>
                </div>
              </div>

              {/* Category */}
              {gig.category && (
                <div className="mb-4">
                  <span className="bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-sm">
                    {gig.category}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{gig.description}</p>
              </div>

              {/* Tags */}
              {gig.tags && gig.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Skills & Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[#26272B] text-[#8B5CF6] px-3 py-1 rounded-full text-sm border border-[#333]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              {gig.createdAt && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-2">Posted</h3>
                  <p className="text-gray-400">
                    {new Date(gig.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isOwner ? (
                  <>
                    <button
                      onClick={() => onHireClick(gig)}
                      className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 px-6 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all font-medium"
                    >
                      HIRE NOW
                    </button>
                    <button
                      onClick={() => router.push(`/inbox?freelancerId=${gig.userId}`)}
                      className="flex-1 bg-[#26272B] text-white py-3 px-6 rounded-lg hover:bg-[#333] transition-colors border border-gray-600"
                    >
                      Contact Freelancer
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4 bg-[#26272B] rounded-lg">
                    <p className="text-gray-400">This is your gig</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Gig Detail Modal Component




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

      const createdGig = await response.json();

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
  const [profileData, setProfileData] = useState<Freelancer | null>(null);
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      if (!freelancer?.id) return;

      setIsLoading(true);
      setError('');

      try {
        // Fetch user data using freelancer.id (maps to User.id)
        const response = await fetch(`/api/users?userId=${encodeURIComponent(freelancer.id)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch freelancer profile: ${errorText || response.status}`);
        }

        const userData = await response.json();

        // Fetch job profile to get skills and additional details
        let jobProfileData: JobProfile | null = null;
        try {
          const jobProfileResponse = await fetch(`/api/job-profiles?userId=${encodeURIComponent(freelancer.id)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (jobProfileResponse.ok) {
            jobProfileData = await jobProfileResponse.json();
            setJobProfile(jobProfileData);
          }
        } catch (jobProfileError) {
          console.warn('Failed to fetch job profile:', jobProfileError);
          // Continue without job profile if it fails
        }

        setProfileData({
          id: userData.id,
          name: userData.name || freelancer.name || 'Unnamed Freelancer',
          avatar: userData.profileImage || freelancer.avatar || '/images/default-avatar.png',
          skills: jobProfileData?.skills || userData.skills || [],
          website: userData.website,
          twitter: userData.twitter,
          discord: userData.discord,
          bio: userData.bio || jobProfileData?.description,
          hourlyRate: jobProfileData?.hourlyRate,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load freelancer profile';
        setError(errorMessage);
        setProfileData(freelancer); // Fallback to passed freelancer data
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && freelancer?.id) {
      fetchFreelancerProfile();
    }
  }, [isOpen, freelancer]);

  if (!isOpen || !freelancer) return null;

  const displayData = profileData || freelancer;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-xl w-full max-w-sm relative border border-[#26272B] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-5">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#8B5CF6] mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading profile...</p>
            </div>
          ) : error ? (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Header Section */}
              <div className="text-center mb-4">
                <img
                  src={displayData.avatar}
                  alt={displayData.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-[#8B5CF6]"
                />
                <h3 className="text-white font-bold text-lg">{displayData.name}</h3>
                <div className="flex justify-center text-yellow-400 text-sm mb-2">
                  {'★'.repeat(5)} {/* Static rating, as schema doesn't include ratings */}
                </div>
                <p className="text-[#8B5CF6] font-semibold text-sm">
                  {displayData.skills && displayData.skills.length > 0
                    ? displayData.skills[0].toUpperCase()
                    : jobProfile?.title?.toUpperCase() || 'FREELANCER'}
                </p>
              </div>

              {/* Action Section */}
              <div className="flex items-center justify-between mb-4 p-3 bg-[#26272B] rounded-lg">
                <button className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-4 py-2 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all text-sm font-medium">
                  HIRE NOW
                </button>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                    <span className="text-white font-medium">
                      {displayData.hourlyRate ? `${displayData.hourlyRate} SOL/hr` : 'Rate N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {displayData.bio || 'No bio available.'}
              </p>

              {/* Skills Section */}
              {displayData.skills && displayData.skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2 text-sm">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {displayData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-[#26272B] text-white px-2 py-1 rounded-full text-xs border border-[#333]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="text-white font-semibold mb-2">Portfolio</h4>
                  {displayData.website ? (
                    <a
                      href={displayData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors flex items-center space-x-1"
                    >
                      <ExternalLink size={12} />
                      <span>Website</span>
                    </a>
                  ) : (
                    <p className="text-gray-400">No portfolio available</p>
                  )}
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Connect</h4>
                  <div className="space-y-1">
                    {displayData.twitter ? (
                      <a
                        href={displayData.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors block"
                      >
                        Twitter
                      </a>
                    ) : (
                      <p className="text-gray-400">No Twitter</p>
                    )}
                    {displayData.discord ? (
                      <a
                        href={displayData.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors block"
                      >
                        Discord
                      </a>
                    ) : (
                      <p className="text-gray-400">No Discord</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
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

// Enhanced Search and Filter Component
const SearchAndFilters: React.FC<{
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}> = ({ filters, onFiltersChange, totalResults, viewMode, onViewModeChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All Categories',
    'Smart Contract Development',
    'UI/UX Design',
    'Web Development',
    'Mobile Development',
    'Blockchain Development',
    'NFT Creation',
    'DeFi Development',
    'Token Development',
    'Technical Writing',
    'Marketing',
    'Community Management'
  ];

  return (
    <div className="bg-[#1A1B1E] rounded-lg p-4 mb-6 border border-[#26272B]">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search gigs, skills, or keywords..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className="w-full bg-[#26272B] text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-[#26272B] text-white px-4 py-3 rounded-lg hover:bg-[#333] transition-colors border border-gray-600"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <div className="flex border border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-[#8B5CF6] text-white' : 'bg-[#26272B] text-gray-400 hover:text-white'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-[#8B5CF6] text-white' : 'bg-[#26272B] text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#26272B]">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600"
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Min Price (SOL)</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.minPrice}
              onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
              className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Max Price (SOL)</label>
            <input
              type="number"
              placeholder="1000.00"
              value={filters.maxPrice}
              onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
              className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
              className="w-full bg-[#26272B] text-white rounded-lg p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none border border-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#26272B]">
        <span className="text-gray-400 text-sm">
          {totalResults} {totalResults === 1 ? 'gig' : 'gigs'} found
        </span>
        <button
          onClick={() => onFiltersChange({ query: '', category: '', minPrice: '', maxPrice: '', sortBy: 'newest' })}
          className="text-[#8B5CF6] hover:text-[#7C3AED] text-sm transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};


// Enhanced Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-4 bg-[#1A1B1E] rounded-lg border border-[#26272B]">
      <div className="text-gray-400 text-sm">
        Showing {startItem}-{endItem} of {totalItems} results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-[#26272B] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`w-10 h-10 text-sm rounded-lg transition-colors ${page === currentPage
                ? 'bg-[#8B5CF6] text-white'
                : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'bg-[#26272B] text-white hover:bg-[#333] border border-gray-600'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-[#26272B] text-white rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
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

// Enhanced JobCard with better mobile responsiveness and gig click functionality
const JobCard: React.FC<JobCardProps> = ({
  job,
  onProfileClick,
  onGigClick,
  onHireClick,
  onSaveClick,
  viewMode,
  currentUserId,
  savedGigs
}) => {
  const isOwnGig = currentUserId && job.userId === currentUserId;
  const isSaved = savedGigs.has(job.id);

  if (viewMode === 'list') {
    return (
      <div className="bg-[#1A1B1E] rounded-lg border border-[#26272B] hover:shadow-xl hover:shadow-[#8B5CF6]/20 hover:border-[#8B5CF6]/30 transition-all duration-300 cursor-pointer group p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className="relative w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
            onClick={() => onGigClick(job)}
          >
            <img
              src={job.image}
              alt={job.title}
              className="w-full h-full object-contain bg-[#0F1014] group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div
                  className="flex items-center space-x-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onProfileClick(job.freelancer)}
                >
                  <img
                    src={job.freelancer.avatar}
                    alt={job.freelancer.name}
                    className="w-5 h-5 rounded-full flex-shrink-0"
                  />
                  <span className="text-white text-sm font-medium truncate">{job.freelancer.name}</span>
                </div>
                <h3
                  className="text-white font-semibold text-lg mb-2 group-hover:text-[#8B5CF6] transition-colors line-clamp-1 cursor-pointer"
                  onClick={() => onGigClick(job)}
                >
                  {job.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">{job.description}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <div className="flex items-center space-x-1">
                  <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
                  <span className="text-white text-lg font-medium group-hover:text-[#8B5CF6] transition-colors">{job.price} SOL</span>
                </div>
                <div className="flex gap-2">
                  {currentUserId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveClick(job);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 ${isSaved
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-[#26272B] text-gray-400 hover:text-white hover:bg-[#333]'
                        }`}
                      title={isSaved ? 'Remove from saved' : 'Save gig'}
                    >
                      <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  )}
                  {!isOwnGig && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHireClick(job);
                      }}
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-4 py-2 rounded-lg text-sm hover:from-[#7C3AED] hover:to-[#6B2CF5] hover:scale-105 transition-all duration-200 whitespace-nowrap"
                    >
                      HIRE NOW
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1B1E] rounded-lg overflow-hidden border border-[#26272B] hover:shadow-xl hover:shadow-[#8B5CF6]/20 hover:border-[#8B5CF6]/30 hover:scale-[1.02] transition-all duration-300 cursor-pointer group w-full">
      <div
        className="relative h-40 sm:h-48 overflow-hidden cursor-pointer"
        onClick={() => onGigClick(job)}
      >
        <img
          src={job.image}
          alt={job.title}
          className="w-full h-full object-contain bg-[#0F1014] group-hover:scale-105 transition-transform duration-300"
        />
        {currentUserId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveClick(job);
            }}
            className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm ${isSaved
                ? 'bg-[#8B5CF6] text-white shadow-lg'
                : 'bg-black/50 text-gray-300 hover:text-white hover:bg-black/70'
              }`}
            title={isSaved ? 'Remove from saved' : 'Save gig'}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <div
          className="flex items-center space-x-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onProfileClick(job.freelancer)}
        >
          <img
            src={job.freelancer.avatar}
            alt={job.freelancer.name}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
          />
          <span className="text-white text-xs sm:text-sm font-medium truncate">{job.freelancer.name}</span>
        </div>
        <h3
          className="text-white font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-[#8B5CF6] transition-colors leading-tight cursor-pointer"
          onClick={() => onGigClick(job)}
        >
          {job.title}
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">{job.description}</p>

        <div className="flex justify-between items-center">
          {!isOwnGig ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHireClick(job);
              }}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm hover:from-[#7C3AED] hover:to-[#6B2CF5] hover:scale-105 transition-all duration-200"
            >
              HIRE
            </button>
          ) : (
            <span className="text-gray-500 text-xs">Your Gig</span>
          )}
          <div className="flex items-center space-x-1">
            <img src="/images/sol-logo.png" alt="SOL" className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-white text-xs sm:text-sm font-medium group-hover:text-[#8B5CF6] transition-colors">{job.price} SOL</span>
          </div>
        </div>
      </div>
    </div>
  );
};



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
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedGigForHire, setSelectedGigForHire] = useState<Job | null>(null);
  const [isPostGigModalOpen, setIsPostGigModalOpen] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [isGigDetailModalOpen, setIsGigDetailModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [selectedGig, setSelectedGig] = useState<Job | null>(null);
  const [allGigs, setAllGigs] = useState<Job[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [savedGigs, setSavedGigs] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
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
  const handleHireClick = useCallback((gig: Job) => {
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }
    setSelectedGigForHire(gig);
    setIsHireModalOpen(true);
  }, [connected]);
  const handleHireSuccess = useCallback(() => {
    // Refresh gigs or show success message
    // You might want to refresh the gigs list here
  }, []);

  // Get current user ID when wallet is connected
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!connected || !publicKey) {
        setCurrentUserId(undefined);
        return;
      }

      try {
        const walletAddress = publicKey.toString();
        const response = await fetch(`/api/users?wallet=${encodeURIComponent(walletAddress)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.id) {
            setCurrentUserId(userData.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    getCurrentUser();
  }, [connected, publicKey]);

  // Fetch saved gigs when user is connected
  useEffect(() => {
    const fetchSavedGigs = async () => {
      if (!connected || !publicKey || !currentUserId) {
        setSavedGigs(new Set());
        return;
      }

      try {
        const response = await fetch('/api/saved-gigs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey.toString()}`
          },
        });

        if (response.ok) {
          const savedGigsData = await response.json();
          const savedGigIds = new Set<string>(savedGigsData.map((saved: SavedGig) => saved.gigId));
          setSavedGigs(savedGigIds);
        }
      } catch (error) {
        console.error('Error fetching saved gigs:', error);
      }
    };

    fetchSavedGigs();
  }, [connected, publicKey, currentUserId]);

  

  // Handle save/unsave gig
  const handleSaveGig = useCallback(async (gig: Job) => {
    console.log('Save gig clicked:', {
      gigId: gig.id,
      connected,
      publicKey: publicKey?.toString(),
      currentUserId,
      isSaving: isSaving.has(gig.id)
    });

    if (!connected || !publicKey || !currentUserId) {
      console.log('Missing required data for saving');
      setIsWalletModalOpen(true);
      return;
    }

    if (isSaving.has(gig.id)) {
      console.log('Already saving this gig, skipping');
      return;
    }

    setIsSaving(prev => new Set(prev).add(gig.id));

    try {
      const isSaved = savedGigs.has(gig.id);
      console.log('Is gig currently saved?', isSaved);

      if (isSaved) {
        // Find the saved gig record to delete
        console.log('Fetching saved gigs to find record to delete');
        const response = await fetch('/api/saved-gigs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey.toString()}`
          },
        });

        console.log('Fetch saved gigs response status:', response.status);

        if (response.ok) {
          const savedGigsData = await response.json();
          console.log('Saved gigs data:', savedGigsData);
          const savedGigRecord = savedGigsData.find((saved: SavedGig) => saved.gigId === gig.id);

          if (savedGigRecord) {
            console.log('Found saved gig record to delete:', savedGigRecord.id);
            const deleteResponse = await fetch(`/api/saved-gigs/${savedGigRecord.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicKey.toString()}`
              },
            });

            console.log('Delete response status:', deleteResponse.status);

            if (deleteResponse.ok) {
              setSavedGigs(prev => {
                const newSet = new Set(prev);
                newSet.delete(gig.id);
                console.log('Removed gig from saved set');
                return newSet;
              });
              // Show success message
              console.log('Gig unsaved successfully');
            } else {
              const errorText = await deleteResponse.text();
              console.error('Failed to delete saved gig:', errorText);
            }
          } else {
            console.log('Saved gig record not found');
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch saved gigs:', errorText);
        }
      } else {
        // Save the gig
        console.log('Saving gig:', { gigId: gig.id, userId: currentUserId });
        const response = await fetch('/api/saved-gigs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey.toString()}`
          },
          body: JSON.stringify({
            gigId: gig.id,
            userId: currentUserId
          }),
        });

        console.log('Save gig response status:', response.status);

        if (response.ok) {
          const savedGigData = await response.json();
          console.log('Saved gig data:', savedGigData);
          setSavedGigs(prev => new Set(prev).add(gig.id));
          console.log('Gig saved successfully');
        } else {
          const errorText = await response.text();
          console.error('Failed to save gig:', response.status, errorText);

          try {
            const errorData = JSON.parse(errorText);
            console.error('Error details:', errorData);
          } catch {
            console.error('Raw error response:', errorText);
          }
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving gig:', error);
    } finally {
      setIsSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(gig.id);
        return newSet;
      });
    }
  }, [connected, publicKey, currentUserId, savedGigs, isSaving]);

  const handleRefreshGigs = useCallback(async () => {
    setIsRefreshing(true);
    setError('');
  
    try {
      const response = await fetch('/api/gigs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add cache-busting parameter
          'Cache-Control': 'no-cache',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to refresh gigs:', response.status, errorText);
        throw new Error(`Failed to refresh gigs: HTTP ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Gigs refreshed successfully:', data);
      setAllGigs(data);
      setCurrentPage(1); // Reset to first page after refresh
      
      // Show success toast (optional)
      // showToast('success', 'Gigs refreshed successfully!');
      
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to refresh gigs';
      console.error('Gig refresh error:', err);
      setError(error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

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

  const handleGigClick = useCallback((gig: Job) => {
    setSelectedGig(gig);
    setIsGigDetailModalOpen(true);
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
        setAllGigs(data);
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

  // Filter and sort gigs - Modified to default to newest first (descending order)
  useEffect(() => {
    let filtered = [...allGigs];

    // Apply search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(gig =>
        gig.title.toLowerCase().includes(query) ||
        gig.description.toLowerCase().includes(query) ||
        gig.freelancer.name.toLowerCase().includes(query) ||
        gig.category?.toLowerCase().includes(query) ||
        gig.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(gig => gig.category === filters.category);
    }

    // Apply price filters
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(gig => gig.price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(gig => gig.price <= maxPrice);
    }

    // Apply sorting - Default to newest first (descending order by creation date)
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          // Default to newest first
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
    });

    setFilteredGigs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allGigs, filters]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when user comes back to the tab
        handleRefreshGigs();
        
        // Set up auto-refresh interval
        intervalId = setInterval(() => {
          if (!isRefreshing && !isLoading) {
            handleRefreshGigs();
          }
        }, 30000); // Refresh every 30 seconds
      } else {
        // Clear interval when tab is not visible
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };
  
    // Set up initial auto-refresh
    intervalId = setInterval(() => {
      if (!isRefreshing && !isLoading && document.visibilityState === 'visible') {
        handleRefreshGigs();
      }
    }, 30000);
  
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleRefreshGigs, isRefreshing, isLoading]);
  
  // 6. Optional: Add keyboard shortcut for refresh (add this useEffect)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+R or F5 for refresh (prevent default browser refresh)
      if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
        event.preventDefault();
        handleRefreshGigs();
      }
    };
  
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleRefreshGigs]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredGigs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGigs = filteredGigs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url("/images/Ellipse-why.png")',
          backgroundBlendMode: 'overlay',
        }}
      />
      <HireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        gig={selectedGigForHire}
        currentUserId={currentUserId}
        onHireSuccess={handleHireSuccess}
      />


      <div className="relative z-50">
        <Navbar navItems={navItems} title="" description="" />
      </div>
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
  <div>
    <h1 className="text-3xl sm:text-4xl font-bold">Marketplace</h1>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-sm text-gray-400">Build {MARKETPLACE_VERSION}</span>
      <span className="text-green-600">•</span>
      <span className="text-sm text-gray-400">{filteredGigs.length} gigs available</span>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <button
      onClick={handleRefreshGigs}
      disabled={isRefreshing || isLoading}
      className="flex items-center space-x-2 bg-[#26272B] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
      title="Refresh gigs"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </button>
    <button
      onClick={handleOpenPostGigModal}
      className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-2 px-4 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all duration-200 flex items-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Post a Gig</span>
    </button>
  </div>
</div>

        {/* Search and Filters */}
        <SearchAndFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={filteredGigs.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
            <span className="ml-2 text-white">Loading gigs...</span>
          </div>
        ) : error ? (
          <Alert className="mb-8 bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        ) : filteredGigs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#1A1B1E] rounded-lg p-8 border border-[#26272B]">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No gigs found</h3>
              <p className="text-gray-400 text-lg mb-4">
                {filters.query || filters.category || filters.minPrice || filters.maxPrice
                  ? "Try adjusting your search filters or browse all gigs."
                  : "No gigs available at the moment."}
              </p>
              {(filters.query || filters.category || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={() => setFilters({ query: '', category: '', minPrice: '', maxPrice: '', sortBy: 'newest' })}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-2 px-4 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Gigs Grid/List */}
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
                : "space-y-4"
            }>
              {paginatedGigs.map((gig) => (
                <JobCard
                  key={gig.id}
                  job={gig}
                  onProfileClick={handleProfileClick}
                  onGigClick={handleGigClick}
                  onHireClick={handleHireClick}
                  onSaveClick={handleSaveGig}
                  viewMode={viewMode}
                  currentUserId={currentUserId}
                  savedGigs={savedGigs}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredGigs.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}

        {children}
      </main>

      {/* Modals */}
      <WalletConnectionModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <PostGigModal isOpen={isPostGigModalOpen} onClose={() => setIsPostGigModalOpen(false)} />
      <FreelancerProfileModal
        isOpen={isFreelancerModalOpen}
        onClose={() => setIsFreelancerModalOpen(false)}
        freelancer={selectedFreelancer}
      />
      <GigDetailModal
        isOpen={isGigDetailModalOpen}
        onClose={() => setIsGigDetailModalOpen(false)}
        gig={selectedGig}
        currentUserId={currentUserId}
        onHireClick={handleHireClick}
      />

      <HireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        gig={selectedGigForHire}
        currentUserId={currentUserId}
        onHireSuccess={handleHireSuccess}
      />

    </div>
  );
};

export default HeroWithWallet;