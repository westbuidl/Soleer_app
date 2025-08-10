// pages/gig/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ArrowLeft, ExternalLink, Share2 } from 'lucide-react';

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
  userId?: string;
}

interface GigPageProps {
  gig: Job | null;
  error?: string;
  debug?: any; // Add debug info for troubleshooting
}

const SocialShareButtons: React.FC<{ gig: Job }> = ({ gig }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareOnTwitter = () => {
    const text = `Check out this gig: ${gig.title} for ${gig.price} SOL`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={shareOnTwitter}
        className="bg-[#1DA1F2] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#1a91da] transition-colors"
      >
        Share on Twitter
      </button>
      <button 
        onClick={shareOnLinkedIn}
        className="bg-[#0077b5] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#005885] transition-colors"
      >
        Share on LinkedIn
      </button>
    </div>
  );
};

const GigPage: React.FC<GigPageProps> = ({ gig, error, debug }) => {
  const router = useRouter();
  const endpoint = clusterApiUrl('devnet');
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  // Debug logs
  useEffect(() => {
    console.log('GigPage Component Props:', { 
      gig: gig ? { ...gig, description: gig.description?.substring(0, 100) + '...' } : null, 
      error, 
      debug,
      routerId: router.query.id 
    });
  }, [gig, error, debug, router.query.id]);

  // Show loading state if router is not ready
  if (router.isFallback || (!gig && !error)) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-[#0A0A0B] text-white">
              <Navbar 
                navItems={[
                  { title: 'MARKETPLACE', href: '/' },
                  { title: 'DASHBOARD', href: '/dashboard' },
                  { title: 'PROFILE', href: '/profile' },
                ]} 
                title="" 
                description="" 
              />
              <main className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-4">
                    {error || 'Gig Not Found'}
                  </h1>
                  <p className="text-gray-400 mb-6">
                    The gig you're looking for doesn't exist or has been removed.
                  </p>
                  
                  {/* Debug info for development */}
                  {process.env.NODE_ENV === 'development' && debug && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                      <h3 className="text-red-400 font-semibold mb-2">Debug Info:</h3>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(debug, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.back()}
                      className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-all"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 px-6 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-[#0A0A0B] text-white">
            <Head>
              <title>{gig.title} - Soleer Marketplace</title>
              <meta name="description" content={gig.description} />
              <meta property="og:title" content={gig.title} />
              <meta property="og:description" content={gig.description} />
              <meta property="og:image" content={gig.image} />
              <meta property="og:type" content="website" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={gig.title} />
              <meta name="twitter:description" content={gig.description} />
              <meta name="twitter:image" content={gig.image} />
            </Head>

            <Navbar 
              navItems={[
                { title: 'MARKETPLACE', href: '/' },
                { title: 'DASHBOARD', href: '/dashboard' },
                { title: 'PROFILE', href: '/profile' },
              ]} 
              title="" 
              description="" 
            />

            <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image */}
                <div>
                  <div className="relative h-64 lg:h-96 overflow-hidden rounded-lg mb-6">
                    <img
                      src={gig.image}
                      alt={gig.title}
                      className="w-full h-full object-cover bg-[#1A1B1E]"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-gig.jpg';
                      }}
                    />
                  </div>

                  {/* Freelancer Info */}
                  <div className="bg-[#1A1B1E] rounded-lg p-6 border border-[#26272B]">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={gig.freelancer.avatar}
                        alt={gig.freelancer.name}
                        className="w-16 h-16 rounded-full border-2 border-[#8B5CF6] object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-avatar.png';
                        }}
                      />
                      <div>
                        <h3 className="text-white font-semibold text-lg">{gig.freelancer.name}</h3>
                        <div className="flex text-yellow-400 text-sm">{'★'.repeat(5)}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                      <button className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all font-medium">
                        HIRE NOW
                      </button>
                      <button className="bg-[#26272B] text-white py-3 px-4 rounded-lg hover:bg-[#333] transition-colors border border-gray-600">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Social Sharing */}
                    <div className="border-t border-[#26272B] pt-4">
                      <h4 className="text-white font-semibold mb-3 text-sm">Share This Gig</h4>
                      <SocialShareButtons gig={gig} />
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-white flex-1 mr-4">{gig.title}</h1>
                    <div className="flex items-center space-x-2 bg-[#1A1B1E] px-4 py-2 rounded-lg border border-[#26272B] shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">S</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{gig.price} SOL</span>
                    </div>
                  </div>

                  {/* Category */}
                  {gig.category && (
                    <div className="mb-6">
                      <span className="bg-[#8B5CF6] text-white px-4 py-2 rounded-full text-sm font-medium">
                        {gig.category}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-white font-semibold mb-4 text-xl">About This Gig</h3>
                    <div className="bg-[#1A1B1E] rounded-lg p-6 border border-[#26272B]">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">{gig.description}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {gig.tags && gig.tags.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-white font-semibold mb-4">Skills & Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {gig.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-[#26272B] text-[#8B5CF6] px-3 py-2 rounded-lg text-sm border border-[#333] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posted Date */}
                  {gig.createdAt && (
                    <div className="mb-8">
                      <h3 className="text-white font-semibold mb-2">Posted On</h3>
                      <p className="text-gray-400">
                        {new Date(gig.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Action Section */}
                  <div className="bg-[#1A1B1E] rounded-lg p-6 border border-[#26272B]">
                    <div className="flex flex-col gap-4">
                      <button className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-4 px-6 rounded-lg hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all font-medium text-lg">
                        HIRE {gig.freelancer.name.split(' ')[0].toUpperCase()}
                      </button>
                      <button className="w-full bg-[#26272B] text-white py-3 px-6 rounded-lg hover:bg-[#333] transition-colors border border-gray-600">
                        Contact Freelancer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const debugInfo: any = {
    gigId: id,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  };

  console.log('=== getServerSideProps START ===');
  console.log('Gig ID:', id);
  console.log('Request headers:', context.req.headers);

  try {
    // More robust base URL determination
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      const protocol = context.req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = context.req.headers.host;
      baseUrl = `${protocol}://${host}`;
    }
    
    // Fallback for development
    if (!baseUrl || baseUrl.includes('undefined')) {
      baseUrl = 'http://localhost:3000';
    }

    debugInfo.baseUrl = baseUrl;
    console.log('Using base URL:', baseUrl);

    const apiUrl = `${baseUrl}/api/gigs/${id}`;
    console.log('Fetching from API:', apiUrl);
    debugInfo.apiUrl = apiUrl;

    // Try direct database query first (bypassing API)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      console.log('Attempting direct database query...');
      
      const gig = await prisma.gig.findUnique({
        where: { 
          id: String(id),
        },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          amount: true,
          status: true,
          category: true,
          tags: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              name: true,
              profileImage: true,
              jobProfile: {
                select: { 
                  skills: true 
                },
              },
            },
          },
        },
      });

      await prisma.$disconnect();

      if (!gig) {
        console.log('Gig not found in database:', id);
        debugInfo.dbResult = 'not_found';
        return {
          props: {
            gig: null,
            error: 'Gig not found',
            debug: debugInfo
          }
        };
      }

      console.log('Found gig in database:', gig.id, gig.status);
      debugInfo.dbResult = 'found';
      debugInfo.gigStatus = gig.status;

      // Check if gig is active
      if (gig.status !== 'ACTIVE') {
        console.log('Gig is not active:', gig.status);
        debugInfo.error = 'gig_not_active';
        return {
          props: {
            gig: null,
            error: 'This gig is not currently available',
            debug: debugInfo
          }
        };
      }

      // Format the response
      const formattedGig = {
        id: gig.id,
        image: gig.image || '/images/default-gig.jpg',
        title: gig.title,
        description: gig.description,
        price: Number(gig.amount),
        category: gig.category,
        tags: gig.tags || [],
        createdAt: gig.createdAt?.toISOString(),
        userId: gig.userId,
        freelancer: {
          name: gig.user?.name || 'Anonymous',
          avatar: gig.user?.profileImage || '/images/default-avatar.png',
          skills: gig.user?.jobProfile?.skills || [],
        },
      };

      console.log('Successfully formatted gig data');
      debugInfo.success = true;

      return {
        props: {
          gig: formattedGig,
          debug: debugInfo
        }
      };

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      debugInfo.dbError = dbError instanceof Error ? dbError.message : 'Unknown db error';
      
      // Fallback to API call if direct DB query fails
      console.log('Falling back to API call...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        debugInfo.apiStatus = response.status;
        console.log('API Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          debugInfo.apiError = errorText;
          
          if (response.status === 404) {
            return {
              props: {
                gig: null,
                error: 'Gig not found',
                debug: debugInfo
              }
            };
          }
          
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const gig = await response.json();
        debugInfo.apiSuccess = true;
        console.log('Successfully fetched from API:', gig.id);

        return {
          props: {
            gig,
            debug: debugInfo
          }
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        debugInfo.fetchError = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
        throw fetchError;
      }
    }

  } catch (error) {
    console.error('=== getServerSideProps ERROR ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    debugInfo.finalError = error instanceof Error ? error.message : 'Unknown error';

    return {
      props: {
        gig: null,
        error: `Failed to load gig: ${error instanceof Error ? error.message : 'Unknown error'}`,
        debug: debugInfo
      }
    };
  } finally {
    console.log('=== getServerSideProps END ===');
  }
};

export default GigPage;