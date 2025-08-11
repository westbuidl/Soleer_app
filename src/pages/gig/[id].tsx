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
import { ArrowLeft, ExternalLink, Share2, Calendar, MapPin, Verified, Star, Heart, Bookmark } from 'lucide-react';

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
  debug?: any;
}

// Solana Logo Component
const SolanaLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 646 646" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <path 
      d="M102.6 474.4C106.4 470.6 111.5 468.5 117 468.5H607.6C618.9 468.5 625.6 481.4 619.8 491.2L543.4 608.8C539.6 614.1 534.5 616.9 529 616.9H38.4C27.1 616.9 20.4 604 26.2 594.2L102.6 474.4Z" 
      fill="url(#solana-gradient)"
    />
    <path 
      d="M102.6 37.2C106.8 33.4 111.9 31.3 117.4 31.3H608C619.3 31.3 626 44.2 620.2 54L543.8 171.6C540 176.9 534.9 179.7 529.4 179.7H38.8C27.5 179.7 20.8 166.8 26.6 157L102.6 37.2Z" 
      fill="url(#solana-gradient)"
    />
    <path 
      d="M543.4 254.4C539.6 250.6 534.5 248.5 529 248.5H38.4C27.1 248.5 20.4 261.4 26.2 271.2L102.6 388.8C106.4 394.1 111.5 396.9 117 396.9H607.6C618.9 396.9 625.6 384 619.8 374.2L543.4 254.4Z" 
      fill="url(#solana-gradient)"
    />
  </svg>
);

const SocialShareButtons: React.FC<{ gig: Job }> = ({ gig }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareOnTwitter = () => {
    const text = `Check out this amazing gig: ${gig.title} for ${gig.price} SOL on Soleer! 💜`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={shareOnTwitter}
        className="flex items-center gap-2 bg-[#1DA1F2] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1a91da] transition-all duration-200 hover:scale-105 shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        Twitter
      </button>
      <button 
        onClick={shareOnLinkedIn}
        className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#005885] transition-all duration-200 hover:scale-105 shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        LinkedIn
      </button>
      <button 
        onClick={copyToClipboard}
        className="bg-[#26272B] text-white p-2.5 rounded-xl hover:bg-[#333] transition-all duration-200 hover:scale-105 shadow-lg border border-gray-600"
        title="Copy link"
      >
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
};

const GigPage: React.FC<GigPageProps> = ({ gig, error, debug }) => {
  const router = useRouter();
  const endpoint = clusterApiUrl('devnet');
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    console.log('GigPage Component Props:', { 
      gig: gig ? { ...gig, description: gig.description?.substring(0, 100) + '...' } : null, 
      error, 
      debug,
      routerId: router.query.id 
    });
  }, [gig, error, debug, router.query.id]);

  if (router.isFallback || (!gig && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0B] via-[#0F0F10] to-[#1A0B2E] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] mx-auto mb-6" style={{
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))'
            }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SolanaLogo className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-400 text-lg">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-[#0A0A0B] via-[#0F0F10] to-[#1A0B2E] text-white">
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
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {error || 'Gig Not Found'}
                  </h1>
                  <p className="text-gray-400 mb-8 text-lg">
                    The gig you're looking for doesn't exist or has been removed.
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && debug && (
                    <div className="bg-red-900/20 border border-red-500 rounded-2xl p-6 mb-8 text-left max-w-2xl mx-auto backdrop-blur-sm">
                      <h3 className="text-red-400 font-semibold mb-3">Debug Info:</h3>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(debug, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.back()}
                      className="bg-[#26272B] text-white py-3 px-8 rounded-xl hover:bg-[#333] transition-all duration-200 font-medium shadow-lg border border-gray-600"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] text-black py-3 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-200 font-medium"
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
          <div className="min-h-screen bg-gradient-to-br from-[#0A0A0B] via-[#0F0F10] to-[#1A0B2E] text-white">
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

            <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-200 mb-8 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Marketplace</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Image & Gallery */}
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <div className="relative h-80 lg:h-[500px] overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-[#1A1B1E] to-[#26272B] shadow-2xl">
                      <img
                        src={gig.image}
                        alt={gig.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-gig.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Action buttons overlay */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => setIsLiked(!isLiked)}
                          className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 ${
                            isLiked 
                              ? 'bg-red-500/80 text-white' 
                              : 'bg-black/40 text-white hover:bg-red-500/80'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className={`p-3 rounded-full backdrop-blur-md transition-all duration-200 ${
                            isBookmarked 
                              ? 'bg-yellow-500/80 text-white' 
                              : 'bg-black/40 text-white hover:bg-yellow-500/80'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {gig.category && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {gig.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description Section */}
                  <div className="bg-gradient-to-br from-[#1A1B1E]/80 to-[#26272B]/60 backdrop-blur-xl rounded-2xl p-8 border border-[#333]/50 shadow-2xl">
                    <h2 className="text-white font-bold mb-6 text-2xl flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-[#00FFA3] to-[#DC1FFF] rounded-full"></div>
                      About This Gig
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                      {gig.description}
                    </p>
                  </div>

                  {/* Tags Section */}
                  {gig.tags && gig.tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-white font-bold mb-4 text-xl">Skills & Technologies</h3>
                      <div className="flex flex-wrap gap-3">
                        {gig.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-[#26272B] to-[#333] text-[#00FFA3] px-4 py-2 rounded-xl text-sm border border-[#444] font-medium hover:border-[#00FFA3] transition-all duration-200 cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Price Card */}
                  <div className="bg-gradient-to-br from-[#1A1B1E]/90 to-[#26272B]/70 backdrop-blur-xl rounded-2xl p-6 border border-[#333]/50 shadow-2xl sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-gray-400 text-lg">Price</span>
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-[#00FFA3]/20 to-[#DC1FFF]/20 px-4 py-2 rounded-xl border border-[#00FFA3]/30">
                        <SolanaLogo className="w-8 h-8" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] bg-clip-text text-transparent">
                          {gig.price}
                        </span>
                        <span className="text-lg font-semibold text-gray-300">SOL</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button 
                      onClick={() => router.push(`https://app.soleer.xyz`)}
                      className="w-full bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] text-black py-4 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 font-bold text-lg hover:scale-105">
                        HIRE NOW
                      </button>
                      <button 
                        onClick={() => router.push(`/inbox?freelancerId=${gig.userId}`)}
                      className="w-full bg-[#26272B] text-white py-3 rounded-xl hover:bg-[#333] transition-all duration-200 border border-gray-600 font-medium">
                        Contact Freelancer
                      </button>
                    </div>

                    {/* Posted Date */}
                    {gig.createdAt && (
                      <div className="mt-6 pt-6 border-t border-[#333]/50">
                        <div className="flex items-center gap-3 text-gray-400">
                          <Calendar className="w-5 h-5" />
                          <div>
                            <p className="text-sm">Posted on</p>
                            <p className="text-white font-medium">
                              {new Date(gig.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Freelancer Card */}
                  <div className="bg-gradient-to-br from-[#1A1B1E]/90 to-[#26272B]/70 backdrop-blur-xl rounded-2xl p-6 border border-[#333]/50 shadow-2xl">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="relative">
                        <img
                          src={gig.freelancer.avatar}
                          alt={gig.freelancer.name}
                          className="w-16 h-16 rounded-full border-2 border-[#00FFA3] object-cover shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-avatar.png';
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#00FFA3] rounded-full p-1">
                          <Verified className="w-4 h-4 text-black" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">{gig.freelancer.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-gray-400 text-sm ml-1">(4.9)</span>
                        </div>
                        <p className="text-gray-400 text-sm">Verified Freelancer</p>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-3 rounded-xl hover:from-[#7C3AED] hover:to-[#6B2CF5] transition-all duration-200 font-medium shadow-lg hover:scale-105">
                      View Profile
                    </button>
                  </div>

                  {/* Share Card */}
                  <div className="bg-gradient-to-br from-[#1A1B1E]/90 to-[#26272B]/70 backdrop-blur-xl rounded-2xl p-6 border border-[#333]/50 shadow-2xl">
                    <h4 className="text-white font-bold mb-4 text-lg flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share This Gig
                    </h4>
                    <SocialShareButtons gig={gig} />
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div className="mt-12 mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {gig.title}
                </h1>
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
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      const protocol = context.req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = context.req.headers.host;
      baseUrl = `${protocol}://${host}`;
    }
    
    if (!baseUrl || baseUrl.includes('undefined')) {
      baseUrl = 'http://localhost:3000';
    }

    debugInfo.baseUrl = baseUrl;
    console.log('Using base URL:', baseUrl);

    const apiUrl = `${baseUrl}/api/gigs/${id}`;
    console.log('Fetching from API:', apiUrl);
    debugInfo.apiUrl = apiUrl;

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
      
      console.log('Falling back to API call...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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