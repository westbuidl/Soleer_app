'use client'
import React, { useState, useEffect } from 'react';
import { Image, Copy, Check, Mail } from 'lucide-react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/sections/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import "../app/globals.css";

const ProfilePage = () => {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState('verify');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [email, setEmail] = useState('');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

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
  }

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

  const navItems = [
    { title: 'ABOUT', href: '#about' },
    { title: 'HOW IT WORKS', href: '#how-it-works' },
    { title: 'BENEFITS', href: '#benefits' },
    { title: 'ROADMAP', href: '#roadmap' },
    { title: 'MARKETPLACE', href: '#marketplace' },
    { title: 'FAQ', href: '/faq' }
  ];

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEditProfile = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (formData.bio && formData.bio.length > 180) {
      errors.bio = 'Bio must not exceed 180 characters';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Please enter a valid URL';
    }

    if (formData.twitter && !formData.twitter.startsWith('https://twitter.com/')) {
      errors.twitter = 'Please enter a valid Twitter URL';
    }

    if (formData.linkedin && !formData.linkedin.startsWith('https://linkedin.com/')) {
      errors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    return errors;
  };

  const validateJobProfile = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.jobTitle) {
      errors.jobTitle = 'Job title is required';
    } else if (formData.jobTitle.length < 2) {
      errors.jobTitle = 'Job title must be at least 2 characters';
    }

    if (!formData.skills) {
      errors.skills = 'Skills are required';
    } else if (formData.skills.length < 3) {
      errors.skills = 'Please enter at least one skill';
    }

    if (!formData.jobDescription) {
      errors.jobDescription = 'Job description is required';
    } else if (formData.jobDescription.length < 50) {
      errors.jobDescription = 'Job description must be at least 50 characters';
    }

    if (formData.portfolio && !isValidUrl(formData.portfolio)) {
      errors.portfolio = 'Please enter a valid portfolio URL';
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!connected || !publicKey) {
      router.push('/');
      return;
    }

    if (!isEmailVerified) {
      setSaveError('Please verify your email first');
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});
    setSaveError('');

    const errors = activeTab === 'edit' 
      ? validateEditProfile() 
      : validateJobProfile();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': publicKey.toString(),
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          email,
          ...formData,
          profileImage,
          bannerImage,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormInput = ({ 
    name,
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    textarea = false,
    required = false
  }: {
    name: keyof FormData;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    placeholder?: string;
    textarea?: boolean;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#1C1C1E] rounded-md p-3 text-white ${
            validationErrors[name] ? 'border border-red-500' : ''
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#1C1C1E] rounded-md p-3 text-white ${
            validationErrors[name] ? 'border border-red-500' : ''
          }`}
          placeholder={placeholder}
        />
      )}
      {validationErrors[name] && (
        <p className="text-red-500 text-sm mt-1">{validationErrors[name]}</p>
      )}
    </div>
  );

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

  const handleEmailVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setIsVerificationModalOpen(true);
  };

  const handleVerificationCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '123456') {
      setIsEmailVerified(true);
      setIsVerificationModalOpen(false);
      setActiveTab('edit');
    } else {
      setVerificationError('Invalid verification code. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfileImage(reader.result as string);
        } else {
          setBannerImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  const renderEmailVerificationTab = () => (
    <div className="space-y-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl mb-4">Verify Your Email</h2>
      {isEmailVerified ? (
        <Alert className="bg-green-900 border-green-600">
          <AlertDescription>
            Email verified successfully! You can now proceed to edit your profile.
          </AlertDescription>
        </Alert>
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
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Verify Email
          </button>
          {verificationError && (
            <p className="text-red-500 text-sm mt-2">{verificationError}</p>
          )}
        </form>
      )}
    </div>
  );

  const renderEditProfileContent = () => (
    <div className="space-y-6">
      <h2 className="text-xl mb-4">Edit Profile</h2>
      <div className="space-y-4">
        <FormInput
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Your username"
          required
        />
        <FormInput
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Your name"
        />
        <FormInput
          name="bio"
          label={`Add a short bio (${formData.bio.length}/180 characters)`}
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself"
          textarea
        />
        <div className="mt-8">
          <h3 className="text-lg mb-4">Web & Social Links</h3>
          <FormInput
            name="website"
            label="Website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="Your website URL"
          />
          <FormInput
            name="twitter"
            label="Twitter"
            value={formData.twitter}
            onChange={handleInputChange}
            placeholder="https://twitter.com/username"
          />
          <FormInput
            name="linkedin"
            label="LinkedIn"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/username"
          />
          <FormInput
            name="discord"
            label="Discord"
            value={formData.discord}
            onChange={handleInputChange}
            placeholder="Your Discord username"
          />
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );

  const renderJobProfileContent = () => (
    <div className="space-y-6">
      <h2 className="text-xl mb-4">Job Profile</h2>
      <div className="space-y-4">
        <FormInput
          name="jobTitle"
          label="Job Title"
          value={formData.jobTitle}
          onChange={handleInputChange}
          placeholder="Your job title"
          required
        />
        <FormInput
          name="skills"
          label="Skills"
          value={formData.skills}
          onChange={handleInputChange}
          placeholder="Your top skills (comma separated)"
          required
        />
        <FormInput
          name="jobDescription"
          label="Job Description"
          value={formData.jobDescription}
          onChange={handleInputChange}
          placeholder="Describe your services"
          textarea
          required
        />
        <FormInput
          name="portfolio"
          label="Portfolio Website"
          value={formData.portfolio}
          onChange={handleInputChange}
          placeholder="Your portfolio URL"
        />
      </div>
      <div className="flex justify-end mt-8">
        <button
         onClick={handleSaveChanges}
         disabled={isSaving}
         className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white disabled:opacity-50"
       >
         {isSaving ? 'Saving...' : 'Save changes'}
       </button>
     </div>
   </div>
 );

 return (
   <div className="min-h-screen bg-black text-white">
     <div className="relative z-50">
        <Navbar navItems={navItems} title="" description="" />
      </div>
     
     {showAlert && !connected && (
       <Alert className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-900 border-red-600">
         <AlertDescription>
           Please connect your wallet to access this page. Redirecting...
         </AlertDescription>
       </Alert>
     )}

     <main className="container mx-auto px-4 py-8">
       <div className="max-w-4xl mx-auto">
         {/* Profile Header */}
         <div className="relative mb-8">
           <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-lg">
             {bannerImage && (
               <img
                 src={bannerImage}
                 alt="Profile banner"
                 className="w-full h-full object-cover rounded-t-lg"
               />
             )}
             <label className="absolute bottom-2 right-2 cursor-pointer">
               <input
                 type="file"
                 accept="image/*"
                 onChange={(e) => handleImageUpload(e, 'banner')}
                 className="hidden"
               />
               <Image className="w-6 h-6 text-white opacity-70 hover:opacity-100" />
             </label>
           </div>
           
           <div className="relative -mt-16 ml-6">
             <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-black">
               {profileImage && (
                 <img
                   src={profileImage}
                   alt="Profile"
                   className="w-full h-full rounded-full object-cover"
                 />
               )}
               <label className="absolute bottom-0 right-0 cursor-pointer">
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => handleImageUpload(e, 'profile')}
                   className="hidden"
                 />
                 <Image className="w-6 h-6 text-white opacity-70 hover:opacity-100" />
               </label>
             </div>
           </div>

           {/* Wallet Address */}
           <div className="mt-4 flex items-center gap-2">
             <span className="text-gray-400">Wallet:</span>
             <span>{shortenAddress(publicKey?.toString())}</span>
             <button
               onClick={copyToClipboard}
               className="ml-2 text-gray-400 hover:text-white"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
             </button>
           </div>
         </div>

         {/* Tab Navigation */}
         <div className="border-b border-gray-800 mb-8">
           <nav className="flex gap-8">
             <button
               className={`pb-4 ${
                 activeTab === 'verify'
                   ? 'text-white border-b-2 border-purple-500'
                   : 'text-gray-400'
               }`}
               onClick={() => setActiveTab('verify')}
             >
               Verify Email
             </button>
             <button
               className={`pb-4 ${
                 activeTab === 'edit'
                   ? 'text-white border-b-2 border-purple-500'
                   : 'text-gray-400'
               }`}
               onClick={() => setActiveTab('edit')}
               disabled={!isEmailVerified}
             >
               Edit Profile
             </button>
             <button
               className={`pb-4 ${
                 activeTab === 'job'
                   ? 'text-white border-b-2 border-purple-500'
                   : 'text-gray-400'
               }`}
               onClick={() => setActiveTab('job')}
               disabled={!isEmailVerified}
             >
               Job Profile
             </button>
           </nav>
         </div>

         {/* Tab Content */}
         <div className="mt-8">
           {activeTab === 'verify' && renderEmailVerificationTab()}
           {activeTab === 'edit' && renderEditProfileContent()}
           {activeTab === 'job' && renderJobProfileContent()}
         </div>

         {saveError && (
           <Alert className="mt-4 bg-red-900 border-red-600">
             <AlertDescription>{saveError}</AlertDescription>
           </Alert>
         )}
       </div>
     </main>

     {/* Email Verification Modal */}
     <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
       <DialogContent className="bg-gray-900 text-white">
         <DialogHeader>
           <DialogTitle>Enter Verification Code</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleVerificationCodeSubmit} className="space-y-4">
           <input
             type="text"
             value={verificationCode}
             onChange={(e) => setVerificationCode(e.target.value)}
             className="w-full bg-[#1C1C1E] rounded-md p-3 text-white"
             placeholder="Enter 6-digit code"
             required
           />
           {verificationError && (
             <p className="text-red-500 text-sm">{verificationError}</p>
           )}
           <button
             type="submit"
             className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-md text-white"
           >
             Verify
           </button>
         </form>
       </DialogContent>
     </Dialog>

     <Footer />
   </div>
 );
};

export default ProfilePage;