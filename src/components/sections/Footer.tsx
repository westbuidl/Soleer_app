"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`bg-[#020202] text-white py-6 sm:py-8 md:py-12 lg:py-16 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-1 mb-8 sm:mb-0">
            <div className="mb-4 sm:mb-6">
            <a 
                href="../" 
                
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
              <Image
                src="/images/Soleer.png"
                alt="Soleer Logo"
                width={120}
                height={40}
                className="object-contain w-24 sm:w-28 md:w-32"
              />
              </a>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Soleer® is powered by Soleer Labs
            </p>
           
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4 mt-4">
              <a 
                href="https://twitter.com/soleerlabs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                  <Image
                    src="/images/socials/twitter.png"
                    alt="Twitter"
                    fill
                    className="object-cover"
                  />
                </div>
              </a>
              <a 
                href="https://t.me/+CjPcnbb0rR8zZTQ0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                  <Image
                    src="/images/socials/telegram.png"
                    alt="Telegram"
                    fill
                    className="object-cover"
                  />
                </div>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Navigation</h3>
            <ul className="space-y-2 sm:space-y-3">
           
              <li>
                <Link href="https://soleer.xyz/#about" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  About
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/#how-it-works" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/#why-soleer" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Why Soleer
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/#governance" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Governance
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/#roadmap" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Roadmap
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Crypto Jobs */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Useful Links</h3>
            <ul className="space-y-2 sm:space-y-3">
            <li>
                <Link href="https://docs.soleer.xyz" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Technical Documentation
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Soleer Home
                </Link>
              </li>
              <li>
                <Link href="https://app.soleer.xyz" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
              <Link href="https://soleer.xyz/faq" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/privacy-policy" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/terms-of-service" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/data-safety" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Data Safety
                </Link>
              </li>
              <li>
                <Link href="https://soleer.xyz/quality-guide" className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 transition-colors inline-block">
                  Quality Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div>
              <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} All rights reserved
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;