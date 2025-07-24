import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { nanoid } from 'nanoid';
import "../app/globals.css";

const VerifyPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to dashboard if already verified
  useEffect(() => {
    const checkVerification = async () => {
      if (publicKey) {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: publicKey.toString() }),
          });
          const user = await response.json();
          if (user.isEmailVerified) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking verification:', error);
        }
      }
    };
    checkVerification();
  }, [publicKey, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!publicKey) {
      setError('Please connect your wallet first');
      setIsLoading(false);
      return;
    }

    if (!email) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    try {
      const otp = nanoid(6);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: publicKey.toString(), email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      setSuccess('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Send OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!publicKey) {
      setError('Please connect your wallet first');
      setIsLoading(false);
      return;
    }

    if (!otp) {
      setError('Please enter the OTP');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: publicKey.toString(), email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      setSuccess('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Account</h1>

        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/20">
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {!connected && (
          <div className="mb-6 text-center">
            <p className="text-gray-400 mb-4">Connect your Solana wallet to start verification</p>
            <WalletMultiButton className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg" />
          </div>
        )}

        {connected && (
          <>
            <form onSubmit={handleSendOtp} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#26272B] text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-2 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[#26272B] text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                  placeholder="Enter OTP"
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-2 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;