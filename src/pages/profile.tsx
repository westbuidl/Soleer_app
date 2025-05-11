'use client'
import { useState, useEffect } from 'react';
import { Image, Copy, Check, Mail, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/sections/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import "../app/globals.css";





const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

interface ApiError {
  message: string;
}

interface ToastAlert {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}



// Types
interface FormData {
  username: string;
  name: string;
  bio: string;
  website: string;
  twitter: string;
  linkedin: string;
  discord: string;
  jobTitle: string;
  skills: string;
  jobDescription: string;
  portfolio: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  emailVerified?: boolean;  // Changed from isEmailVerified
  verifiedEmail?: string;
}


const ProfilePage = () => {
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  // State declarations (including existing ones)
  const [activeTab, setActiveTab] = useState('verify');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [cachedOTP, setCachedOTP] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  const [toastAlert, setToastAlert] = useState<ToastAlert>({
    show: false,
    message: '',
    type: 'success'
  });

  // Show toast alert helper function
  const showToastAlert = (message: string, type: 'success' | 'error') => {
    setToastAlert({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setToastAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  

  // Add effect to check email verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!publicKey) {
        setIsCheckingVerification(false);
        return;
      }

      try {
        const response = await fetch(`/api/profile/check-email?wallet=${encodeURIComponent(publicKey.toString())}`);
        const data = await response.json();

        if (data.isVerified) {
          setIsEmailVerified(true);
          setEmail(data.email);
          setActiveTab('edit');
          // Update form data with existing user data
          setFormData(prev => ({
            ...prev,
            emailVerified: true,
            verifiedEmail: data.email,
            ...data.userData
          }));
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setIsCheckingVerification(false);
      }
    };

    checkVerificationStatus();
  }, [publicKey]);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    username: '',
    name: '',
    bio: '',
    website: '',
    twitter: '',
    linkedin: '',
    discord: '',
    jobTitle: '',
    skills: '',
    jobDescription: '',
    portfolio: '',
  });




  // URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // File upload handler
  const uploadToCloudStorage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'profile') {
            setProfileImage(reader.result as string);
          } else {
            setBannerImage(reader.result as string);
          }
        };
        reader.readAsDataURL(file);

        // Upload to cloud storage
        const cloudUrl = await uploadToCloudStorage(file);

        // Update form data
        setFormData(prev => ({
          ...prev,
          [type === 'profile' ? 'profileImageUrl' : 'bannerImageUrl']: cloudUrl
        }));
      } catch (error) {
        console.error(`Error handling ${type} image upload:`, error);
      }
    }
  };

  // Modified email verification handler
  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setIsVerifyingEmail(true);

    if (!publicKey) {
      setVerificationError('Wallet not connected');
      setIsVerifyingEmail(false);
      return;
    }

    try {
      // Check if this email is already verified
      const checkResponse = await fetch(`/api/profile/check-email?email=${encodeURIComponent(email)}&wallet=${encodeURIComponent(publicKey.toString())}`);
      const checkResult = await checkResponse.json();

      if (checkResult.isVerified) {
        // If email is already verified, load user data and switch to edit tab
        setIsEmailVerified(true);
        setActiveTab('edit');

        // Update form data with the existing user data
        setFormData(prev => ({
          ...prev,
          emailVerified: true,
          verifiedEmail: email,
          ...checkResult.userData
        }));

        setIsVerifyingEmail(false);
        return;
      }

      // Only proceed with OTP if email is not verified
      const otp = generateOTP();
      setCachedOTP(otp);

      const expiryTime = Date.now() + 5 * 60 * 1000;
      setOtpExpiry(expiryTime);
      setCountdown(300);

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          wallet: publicKey.toString()
        }),
      });

      if (!response.ok) throw new Error('Failed to send OTP');

      setIsVerificationModalOpen(true);
    } catch (error) {
      setVerificationError('Failed to send verification code. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Modified verification code submit handler
  const handleVerificationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (!publicKey) {
      setVerificationError('Wallet not connected');
      return;
    }

    if (Date.now() > otpExpiry) {
      setVerificationError('Verification code has expired. Please request a new one.');
      return;
    }

    if (verificationCode === cachedOTP) {
      try {
        const defaultUsername = email.split('@')[0];

        const response = await fetch('/api/profile/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            email,
            username: defaultUsername
          }),
        });

        if (!response.ok) {
          const errorData = await response.json() as ApiError;
          throw new Error(errorData.message || 'Failed to update verification status');
        }

        const userData = await response.json();

        setIsEmailVerified(true);
        setIsVerificationModalOpen(false);
        setActiveTab('edit');

        setFormData(prev => ({
          ...prev,
          emailVerified: true,
          verifiedEmail: email,
          username: userData?.username || '',
          name: userData?.name || '',
          bio: userData?.bio || '',
          website: userData?.website || '',
          twitter: userData?.twitter || '',
          linkedin: userData?.linkedin || '',
          discord: userData?.discord || '',
          profileImageUrl: userData?.profileImageUrl || '',
          bannerImageUrl: userData?.bannerImageUrl || '',
          jobTitle: userData?.jobTitle || '',
          skills: userData?.skills || '',
          jobDescription: userData?.jobDescription || '',
          portfolio: userData?.portfolio || '',
        }));

        setCachedOTP('');
        setOtpExpiry(0);
        setCountdown(0);

        showToastAlert('Email verification successful!', 'success');
      } catch (error) {
        console.error('Error updating verification status:', error);
        if (error instanceof Error) {
          setVerificationError(error.message);
          if (error.message.includes('email is already')) {
            setEmail('');
          }
        } else {
          setVerificationError('Failed to update verification status. Please try again.');
        }
      }
    } else {
      setVerificationError('Invalid verification code. Please try again.');
    }
  };
  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isVerificationModalOpen) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, isVerificationModalOpen]);

  // Connected wallet check effect
  useEffect(() => {
    if (!connected) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [connected, router]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError('');

    try {
      if (!isEmailVerified) {
        setSaveError('Please verify your email first');
        return;
      }

      if (!publicKey) {
        setSaveError('Wallet not connected');
        return;
      }

      const profileData = {
        walletAddress: publicKey.toString(),
        email,
        isEmailVerified,
        verifiedEmail: email,
        ...formData
      };

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const savedData = await response.json();
      setFormData(prevData => ({
        ...prevData,
        ...savedData
      }));

      showToastAlert('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
      showToastAlert('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // New state for email verification

  const renderToastAlert = () => {
    if (!toastAlert.show) return null;

    return (
      <div className={`fixed top-4 right-4 z-50 w-96 ${toastAlert.type === 'success' ? 'bg-green-900/90' : 'bg-red-900/90'} border ${toastAlert.type === 'success' ? 'border-green-500' : 'border-red-500'} rounded-lg p-4 shadow-lg transition-opacity duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {toastAlert.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <X className="w-5 h-5 text-red-500 mr-2" />
            )}
            <p className="text-white">{toastAlert.message}</p>
          </div>
          <button
            onClick={() => setToastAlert(prev => ({ ...prev, show: false }))}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };
  const navItems = [
    { title: 'DASHBOARD', href: '../dashboard' },
    { title: 'INBOX', href: '../inbox' },
    { title: 'PROFILE', href: '../profile' },
    { title: 'MARKETPLACE', href: '/' },
    { title: 'SOLEER HOME', href: 'https://www.soleer.xyz' },
    { title: 'FAQ', href: 'https://www.soleer.xyz/faq' },
  ];

  useEffect(() => {
    if (!connected) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        //router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [connected, router]);





  const shortenAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };



  // Add countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isVerificationModalOpen) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, isVerificationModalOpen]);

  // Modified verification code submit handler


  const renderEmailVerificationTab = () => (
    <div className="space-y-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl mb-4">Verify Your Email</h2>
      {isCheckingVerification ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Checking verification status...</span>
        </div>
      ) : isEmailVerified ? (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-500 font-medium flex items-center gap-2">
            <Check className="w-5 h-5" />
            Email {email} is verified!
          </p>
          <p className="text-gray-400 mt-2">
            You can now proceed to edit your profile.
          </p>
        </div>
      ) : (
        <form onSubmit={handleEmailVerification} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
              placeholder="Enter your email"
              required
              disabled={isVerifyingEmail}
            />
          </div>
          <button
            type="submit"
            disabled={isVerifyingEmail}
            className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white flex items-center justify-center gap-2 disabled:opacity-75 transition-opacity duration-150"
          >
            {isVerifyingEmail ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending verification...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Verify Email
              </>
            )}
          </button>
          {verificationError && (
            <p className="text-red-500 text-sm mt-2">{verificationError}</p>
          )}
        </form>
      )}
    </div>
  );
  // Modified verification modal content
  const renderVerificationModal = () => (
    <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
      <DialogContent className="bg-[#1C1C1E] border-gray-800">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleVerificationCodeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Please enter the verification code sent to {email}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full bg-[#2C2C2E] rounded-md p-3 text-white"
              placeholder="Enter verification code"
              required
            />
            <p className="text-sm text-red-400 mt-2">
              Code expires in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
          </div>
          {verificationError && (
            <p className="text-red-500 text-sm">{verificationError}</p>
          )}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 bg-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md"
            >
              Verify
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Render save changes button only for edit and job tabs

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

  const renderSaveButton = () => {
    if (activeTab === 'verify' || !isEmailVerified) return null;

    return (
      <div className="flex justify-end mt-8 mb-16">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>

        {saveError && (
          <p className="text-red-500 mt-2">{saveError}</p>
        )}
      </div>
    );
  };

  

  return (

    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {renderToastAlert()}
      {showAlert && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 max-w-md mx-auto mt-8">
          <p className="text-white text-center">
            Please connect your wallet to access your profile. Redirecting to home page...
          </p>
        </div>
      )}

      <div className="relative z-50">
        <Navbar navItems={navItems} title="" description="" />
      </div>

      <div className="w-full">
        <div
          className="relative h-48 bg-gradient-to-r from-purple-900 via-blue-800 to-green-600"
          style={{
            backgroundImage: bannerImage ? `url(${bannerImage})` : '',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <label className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-black/50 px-4 py-2 rounded-md cursor-pointer hover:bg-black/70 z-50">
            <Image className="w-5 h-5" />
            <span>Change Banner</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(e, 'banner')}
              accept="image/*"
            />
          </label>
        </div>

        <main className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1C1C1E] border-4 border-[#0A0A0B]">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src="/images/user.png" alt="Default profile" className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{shortenAddress(publicKey?.toString())}</h1>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            <button
              className={`pb-2 ${activeTab === 'verify' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('verify')}
            >
              Verify Email
            </button>
            <button
              className={`pb-2 ${activeTab === 'edit' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('edit')}
              disabled={!isEmailVerified}
            >
              Edit profile
            </button>
            <button
              className={`pb-2 ${activeTab === 'job' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
              onClick={() => setActiveTab('job')}
              disabled={!isEmailVerified}
            >
              My Job profile
            </button>
          </div>


          <div className="space-y-6">

            {activeTab === 'verify' && renderEmailVerificationTab()}

            {activeTab === 'edit' && isEmailVerified && (
              <>
                <h2 className="text-xl mb-4">Enter your details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Username*</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}

                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                      placeholder="Your username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}

                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Add a short bio (0/180 characters)</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}

                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white min-h-[100px]"
                      placeholder="Tell us about yourself"
                      maxLength={180}
                    />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg mb-4">Upload a profile image</h3>
                    <label className="inline-flex items-center gap-2 bg-[#1C1C1E] px-4 py-2 rounded-md cursor-pointer hover:bg-[#2C2C2E]">
                      <Image className="w-5 h-5" />
                      <span>Choose media</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        accept="image/*"
                      />
                    </label>
                  </div>



                  <div className="mt-8">
                    <h3 className="text-lg mb-4">Add web & social links</h3>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}

                        className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                        placeholder="Enter your portfolio website"
                      />
                    </div>



                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Twitter</label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}

                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                      placeholder="Enter your Twitter(X)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Linkedin</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                    placeholder="Enter your Linkedin"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Discord</label>
                  <input
                    type="text"
                    name="discord"
                    value={formData.discord}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                    placeholder="Enter your Discord"
                  />
                </div>
              </>
            )}

            {activeTab === 'job' && isEmailVerified && (
              <>
                <h2 className="text-xl mb-4">Job details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Job title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      required
                      onChange={handleInputChange}
                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                      placeholder="Your job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Skills (Enter your top skill set)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                      placeholder="Your skills"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Add a description about what you offer</label>
                    <textarea
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleInputChange}
                      className="w-full bg-[#1C1C1E] rounded-md p-3 text-white min-h-[100px]"
                      placeholder="Describe your services"
                      required
                    />
                  </div>

                  <div>
                    <h3 className="text-lg mb-4">Set a banner for this Job</h3>
                    <label className="inline-flex items-center gap-2 bg-[#1C1C1E] px-4 py-2 rounded-md cursor-pointer hover:bg-[#2C2C2E]">
                      <Image className="w-5 h-5" />
                      <span>Set job banner</span>
                      <input type="file" className="hidden" accept="image/*" />

                    </label>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg mb-4">Add web & social links</h3>
                    <div className="space-y-4">
                      {['Portfolio website', 'Twitter', 'LinkedIn', 'DISCORD'].map((platform) => (
                        <div key={platform}>
                          <label className="block text-sm text-gray-400 mb-1">{platform}</label>
                          <input
                            type="text"
                            className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
                            placeholder={`Your ${platform.toLowerCase()} link`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>


          {(activeTab === 'edit' || activeTab === 'job') && isEmailVerified && (
            <div className="flex justify-end mt-8 mb-16">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
              {saveError && (
                <p className="text-red-500 mt-2">{saveError}</p>
              )}
            </div>
          )}
          <div className="flex justify-end mt-8 mb-16">

          </div>
        </main>
      </div>

      {renderVerificationModal()}

      <Footer />
    </div>
  );
};

export default ProfilePage;

function setShowAlert(arg0: boolean) {
  throw new Error('Function not implemented.');
}