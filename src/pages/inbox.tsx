import React, { useState, useEffect } from 'react';
import { Send, ChevronLeft, InboxIcon } from 'lucide-react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import "../app/globals.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatMessage extends Message {
  sender: 'user' | 'other';
}

interface NavItem {
  title: string;
  href: string;
}

interface NavbarProps {
  navItems: NavItem[];
  title: string;
  description: string;
  className?: string;
}

const InboxComponent: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChatView, setShowChatView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (!isMobileView && !showChatView) {
        setShowChatView(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [connected, router]);

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

  const filteredMessages = messages.filter(message => {
    const searchLower = searchQuery.toLowerCase();
    return (
      message.sender.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower)
    );
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    if (isMobile) {
      setShowChatView(true);
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShowChatView(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="bg-[#1C1C1E] rounded-full p-4 mb-4">
        <InboxIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No messages yet</h3>
      <p className="text-gray-400 max-w-md">
        When you receive messages from other users, they'll appear here.
      </p>
    </div>
  );

  // Message List Component
  const MessageList = () => (
    <div className="flex flex-col h-full bg-[#111112] rounded-2xl overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Messages</h2>
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search messages"
            className="w-full bg-[#1C1C1E] text-white rounded-lg px-4 py-3 pl-10"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleChatSelect(message.id)}
                className="flex items-center p-4 rounded-xl bg-[#1C1C1E]/50 cursor-pointer hover:bg-[#1C1C1E]"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm">{message.sender}</h3>
                  <p className="text-gray-400 text-sm truncate">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400 ml-2">{message.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Chat View Component
  const ChatView = () => (
    <div className="flex flex-col h-full bg-[#111112] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={handleBackToList}
              className="mr-3 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <h2 className="ml-3 text-lg font-semibold text-white">
            {messages.find(m => m.id === selectedChat)?.sender || 'Chat'}
          </h2>
        </div>
      </div>
      <EmptyState />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0A0A0B] to-[#1C1C1E]">
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: 'url("/images/Ellipse-dash.png")',
          backgroundBlendMode: 'overlay'
        }}
      />
      <Navbar navItems={navItems} title="" description="" />

      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Inbox
            </h1>
          </div>
          
          <div className="flex gap-6 h-[calc(100vh-300px)]">
            {/* Mobile View */}
            {isMobile ? (
              <div className="w-full">
                {showChatView ? <ChatView /> : <MessageList />}
              </div>
            ) : (
              // Desktop View
              <>
                <div className="w-[400px]">
                  <MessageList />
                </div>
                <div className="flex-1">
                  <ChatView />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InboxComponent;