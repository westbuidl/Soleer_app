import React, { useState, useEffect } from 'react';

// Add CountdownTimer interface and component
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  endDate: Date;
}

const CountdownTimer: React.FC<CountdownProps> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex justify-center gap-4">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="font-mono bg-gray-800 rounded px-2 py-1 min-w-[40px]">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs mt-1 text-gray-400 capitalize">{key}</div>
        </div>
      ))}
    </div>
  );
};

interface PublicSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicSaleModal: React.FC<PublicSaleModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Set the end date for the public sale (adjust this date as needed)
  const saleEndDate = new Date('2024-12-31T23:00:00');
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className={`relative bg-gray-900 rounded-lg p-6 max-w-md w-full transform ${
          isOpen ? 'scale-100' : 'scale-95'
        } transition-transform duration-300`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 opacity-50 blur-xl animate-pulse" />
        
        {/* Content container */}
        <div className="relative bg-gray-900 rounded-lg p-6 border border-purple-500">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
          
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400">
            Soleer Public Sale is Live!
          </h2>
          
          <p className="text-gray-300 mb-6">
            Be part of the future of decentralized freelancing.
            
          </p>
          
          <a 
            href="https://sale.soleer.xyz" 
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:opacity-90 transform hover:scale-105 transition-all duration-300"
          >
            Join Public Sale
          </a>
          
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400 mb-2">Sale starts in:</div>
            <CountdownTimer endDate={saleEndDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSaleModal;