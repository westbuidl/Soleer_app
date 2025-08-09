


import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import "../app/globals.css";



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




const FreelancerProfileModal: React.FC<FreelancerProfileModalProps> = ({ isOpen, onClose, freelancer }) => {
  if (!isOpen || !freelancer) return null;

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
      <div className="bg-[#1A1B1E] rounded-lg w-full max-w-md relative">
        {/* Close button */}
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
  <div className="bg-[#1A1B1E] rounded-lg overflow-hidden border border-[#26272B]">
    <div className="relative h-[200px]">
      <img 
        src={job.image} 
        alt={job.title} 
        className="w-full h-full object-cover"
      />
      <button className="absolute top-3 right-3 p-1.5 bg-[#26272B] rounded">
        <img src="/images/bookmark.png" alt="Bookmark" className="w-4 h-4" />
      </button>
    </div>
    <div className="p-4">
      <div 
        className="flex items-center space-x-2 mb-2 cursor-pointer"
        onClick={() => onProfileClick(job.freelancer)}
      >
        <img 
          src={job.freelancer.avatar} 
          alt={job.freelancer.name} 
          className="w-6 h-6 rounded-full"
        />
        <span className="text-white text-sm">{job.freelancer.name}</span>
      </div>
      <h3 className="text-white font-bold mb-2">{job.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>
      <div className="flex justify-between items-center">
        <button className="bg-[#1E1E1E] text-white px-4 py-1.5 rounded text-sm hover:bg-[#2A2A2A]">
          HIRE
        </button>
        <div className="flex items-center space-x-1.5">
          <img src="/images/sol-logo.png" alt="SOL" className="w-4 h-4" />
          <span className="text-white text-sm">{job.price} Sol</span>
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


const MarketplaceSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state


  useEffect(() => {
    // Short delay to ensure modal appears after page load
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);


    
  const navItems = [
    { title: 'ABOUT', href: '../#about' },
    { title: 'HOW IT WORKS', href: '../#how-it-works' },
    { title: 'WHY SOLEER', href: '../#why-soleer' },
    { title: 'GOVERNANCE', href: '../#governance' },
    { title: 'ROADMAP', href: '../#roadmap' },
    { title: 'FAQ', href: 'faq' },
    { title: 'MARKETPLACE EXPERIENCE', href: '../#marketplace' }
  ];
  
  
  const jobs = [
    {
      id: '1',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      //{ image: '/images/ads/ad2.png', title: 'Web3 UI/UX Design', price: '3.5 Sol', user: 'Soleer', userUrl: '/user/soleer', description: 'I will Create digital arts, collectibles, and content to be sold as NFTs...', descriptionUrl: '/gig/web3-ui-ux-design' },

      id: '2',
      image: '../images/ads/ad2.png',
      title: 'Web3 UI/UX Design',
      description: 'I will Create digital arts, collectibles, and content to be sold as NFTs...',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      //{ image: '/images/ads/ad3.png', title: 'Content Creation', price: '4 Sol', user: 'Soleer', userUrl: '/user/soleer', description: 'I Write articles, tutorials, and educational contents on everything blockchain..', descriptionUrl: '/gig/content-creation' },
      id: '3',
      image: '../images/ads/ad3.png',
      title: 'Content Creation',
      description: 'I Write articles, tutorials, and educational contents on everything blockchain...',
      price: 2.5,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      //{ image: '/images/ads/ad4.png', title: 'Security Auditing', price: '5 Sol', user: 'Soleer', userUrl: '/user/soleer', description: 'I Conduct security audits for smart contracts, blockchain protocols, and Web3 applications...', descriptionUrl: '/gig/security-auditing' },
      id: '4',
      image: '../images/ads/ad4.png',
      title: 'Security Auditing',
      description: 'I Conduct security audits for smart contracts, blockchain protocols, and Web3 applications...',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      //{ image: '/images/ads/ad5.png', title: 'Tokenomics Consulting', price: '2 Sol', user: 'Soleer', userUrl: '/user/soleer', description: 'I will Designing and optimizing the economic model for your blockchain-based projects..', descriptionUrl: '/gig/tokenomics-consulting' },
      id: '5',
      image: '../images/ads/ad5.png',
      title: 'Tokenomics Consulting',
      description: 'I will Designing and optimizing the economic model for your blockchain-based projects..',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    // Repeat the first 5 jobs to fill out the grid
    {
      id: '6',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      id: '7',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      id: '8',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      id: '9',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    {
      //{ image: '/images/ads/ad1.png', title: 'Smart Contract Dev', price: '4 Sol', user: 'Soleer', userUrl: 'marketplace', description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....', descriptionUrl: '/gig/smart-contract-dev' },
      id: '10',
      image: '../images/ads/ad1.png',
      title: 'Smart Contract Dev',
      description: 'I will Write and audit smart contracts for platforms like Ethereum, Solana, and Polkadot....',
      price: 8,
      freelancer: {
        name: 'Freexyz',
        avatar: '../images/user.png'
      }
    },
    // Add more jobs as needed to fill out the grid
  ];


  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);

  const handleProfileClick = (freelancer: Freelancer): void => {
    setSelectedFreelancer(() => freelancer); // Fixed TypeScript error by using callback form
  };

  const filteredJobs = useCallback(() => {
    if (!searchQuery.trim()) return jobs;
    
    const searchTerms = searchQuery.toLowerCase().split(' ');
    return jobs.filter(job => {
      const searchableText = `${job.title} ${job.description} ${job.freelancer.name}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [searchQuery]);

  const paginatedJobs = filteredJobs().slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  


  return (
    <div className="min-h-screen bg-[#0D0D0D] z-80">

      
      <Navbar 
        navItems={navItems}
        title="Soleer Marketplace"
        description="Find and hire top freelancers on the blockchain"
      />
      
      {/* Added pt-20 to create space below navbar */}
      <main className="container mx-auto px-4 pt-20">
        {/* Added z-10 to ensure search bar doesn't block navbar dropdown */}
        <div className="relaive mb-6 z-05">
          <input
            type="text"
            placeholder="Search for jobs to hire"
            className="w-full bg-[#1A1B1E] p-3 pl-10 rounded-lg text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
        </div>

        {/* Added z-10 to ensure filters don't block navbar dropdown */}
        <div className="flex space-x-6 mb-6 z-10 relative">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === 'trending' ? 'text-[#8B5CF6]' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('trending')}
          >
            <span className="text-lg">⚡</span>
            <span>Trending</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === 'popular' ? 'text-[#8B5CF6]' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('popular')}
          >
            <span className="text-lg">⭐</span>
            <span>Popular</span>
          </button>
        </div>

        {/* Added z-0 to ensure grid stays below navbar dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-0">
          {paginatedJobs.map(job => (
            <JobCard 
              key={job.id}
              job={job}
              onProfileClick={handleProfileClick}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#1A1B1E] text-gray-400 hover:bg-[#26272B]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      <FreelancerProfileModal 
        isOpen={!!selectedFreelancer}
        onClose={() => setSelectedFreelancer(null)}
        freelancer={selectedFreelancer}
      />
      
      
      
      <Footer />
      


     
    </div>
  );
};

const styles = `
@keyframes text-slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-text-slide-up {
  animation: text-slide-up 0.6s ease-out;
}
`;

export default MarketplaceSection;

//function setIsModalOpen(arg0: boolean) {
  //throw new Error('Function not implemented.');
//}
