"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SkillCategory = 
  | 'Smart Contract Development'
  | 'DeFi Engineering'
  | 'Blockchain Architecture'
  | 'NFT Development'
  | 'Token Engineering'
  | 'Web3 Security'
  | 'Solidity Programming'
  | 'Crypto Trading Bots'
  | 'dApp Development'
  | 'Zero Knowledge Proofs'
  | 'Layer 2 Solutions'
  | 'DAO Development'
  | 'Tokenomics Design'
  | 'Cross-chain Development'
  | 'Wallet Integration'
  | 'Web, Mobile & Software Dev'
  | 'IT & Networking'
  | 'Data Science & Analytics'
  | 'Accounting & Consulting'
  | 'Legal'
  | 'Translation'
  | 'Design & Creative'
  | 'Engineering & Architecture'
  | 'Writing'
  | 'Admin Support'
  | 'Customer Service'
  | 'Sales & Marketing'
  | 'Gaming';

const SkillsSection: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentSkillIndex, setCurrentSkillIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const skillCategories: SkillCategory[] = [
    'Smart Contract Development',
    'DeFi Engineering',
    'Blockchain Architecture',
    'NFT Development',
    'Token Engineering',
    'Web3 Security',
    'Solidity Programming',
    'Crypto Trading Bots',
    'dApp Development',
    'Zero Knowledge Proofs',
    'Layer 2 Solutions',
    'DAO Development',
    'Tokenomics Design',
    'Cross-chain Development',
    'Wallet Integration',
    'Web, Mobile & Software Dev',
    'IT & Networking',
    'Data Science & Analytics',
    'Accounting & Consulting',
    'Legal',
    'Translation',
    'Design & Creative',
    'Engineering & Architecture',
    'Writing',
    'Admin Support',
    'Customer Service',
    'Sales & Marketing',
    'Gaming'
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && currentSkillIndex < skillCategories.length) {
      const timer = setTimeout(() => {
        setCurrentSkillIndex(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible, currentSkillIndex, skillCategories.length]);

  const handleSkillClick = async (skill: SkillCategory): Promise<void> => {
    try {
      setIsLoading(true);
      const encodedSkill = encodeURIComponent(skill);
      router.push(`https://app.soleer.xyz?skill=${encodedSkill}`);
    } catch (error) {
      console.error('Error querying marketplace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={sectionRef} className="relative bg-[#020202] text-white py-16 px-4 md:px-16 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 left-0 w-full h-[655px] pointer-events-none">
        <div className="relative w-full h-full max-w-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[504px] md:w-full h-full">
            <Image
              src="/images/Ellipse1.png"
              alt="Background glow"
              fill
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center top'
              }}
              quality={100}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center sm:text-left">Popular Skills</h2>
          </div>
          <p className="text-lg mb-6 text-center sm:text-left">
            Connect and transact in the global digital marketplace.
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center sm:justify-start">
            {skillCategories.slice(0, isVisible ? currentSkillIndex : 0).map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillClick(skill)}
                disabled={isLoading}
                className={`
                  bg-white bg-opacity-10 hover:bg-opacity-20 
                  px-3 md:px-4 py-2 rounded-full text-sm 
                  transition-all transform hover:scale-105 
                  animate-fadeIn cursor-pointer
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;