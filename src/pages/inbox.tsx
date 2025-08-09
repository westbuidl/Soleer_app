import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, InboxIcon, MessageCircle, User, Clock, CheckCheck } from 'lucide-react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import "../app/globals.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  walletAddress: string;
  username?: string;
  name?: string;
  profileImage?: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  image?: string;
  amount: number;
  userId: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    userId: string;
    user: User;
    lastReadAt?: string;
  }>;
  messages: Message[];
  lastMessage?: Message;
  updatedAt: string;
}

interface FreelancerWithGigs {
  id: string;
  walletAddress: string;
  username?: string;
  name?: string;
  profileImage?: string;
  gigs: Gig[];
}

interface NavItem {
  title: string;
  href: string;
}

const InboxComponent: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChatView, setShowChatView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'freelancers'>('freelancers');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerWithGigs[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navItems = [
    { title: 'DASHBOARD', href: '../dashboard' },
    { title: 'INBOX', href: '../inbox' },
    { title: 'PROFILE', href: '../profile' },
    { title: 'MARKETPLACE', href: '/' },
    { title: 'SOLEER HOME', href: 'https://www.soleer.xyz' },
    { title: 'FAQ', href: 'https://www.soleer.xyz/faq' },
  ];

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

  useEffect(() => {
    console.log('Wallet connected:', connected, 'Public key:', publicKey?.toString());
    if (!connected || !publicKey) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
      fetchUserData();
    }
  }, [connected, publicKey, router]);

  useEffect(() => {
    // Only scroll when a new message is added or chat is selected, not on every conversations update
    if (selectedChat) {
      const conversation = conversations.find(c => c.id === selectedChat);
      if (conversation && conversation.messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedChat]); // Remove conversations from dependency array

  // Separate effect for scrolling when new messages arrive
  const lastMessageCountRef = useRef(0);
  useEffect(() => {
    const conversation = conversations.find(c => c.id === selectedChat);
    if (conversation && conversation.messages.length > lastMessageCountRef.current) {
      lastMessageCountRef.current = conversation.messages.length;
      
      // Only scroll if we're near the bottom already (within 100px)
      setTimeout(() => {
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (messagesContainer) {
          const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
          
          if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 50);
    }
  }, [conversations, selectedChat]);

  useEffect(() => {
    const { freelancerId } = router.query;
    console.log('Router query freelancerId:', freelancerId);
    if (freelancerId && typeof freelancerId === 'string' && currentUser) {
      setActiveTab('conversations');
      startChatWithFreelancer(freelancerId);
    } else if (conversations.length === 0 && !loading && currentUser) {
      setActiveTab('freelancers');
    }
  }, [router.query, conversations, loading, currentUser]);

  const fetchUserData = async () => {
    if (!publicKey) {
      setErrorMessage('No wallet connected. Please connect your wallet.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const userResponse = await fetch(`/api/user/${publicKey.toString()}`);
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }
      const userData = await userResponse.json();
      console.log('Current user set:', userData);
      setCurrentUser(userData);

      const conversationsResponse = await fetch(`/api/conversations`, {
        headers: {
          'X-Wallet-Address': publicKey.toString(),
        },
      });
      if (!conversationsResponse.ok) {
        const errorData = await conversationsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
      const conversationsData = await conversationsResponse.json();
      setConversations(conversationsData);

      const freelancersResponse = await fetch('/api/freelancers-with-gigs');
      if (!freelancersResponse.ok) {
        const errorData = await freelancersResponse.json();
        throw new Error(errorData.error || 'Failed to fetch freelancers');
      }
      const freelancersData = await freelancersResponse.json();
      setFreelancers(freelancersData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setErrorMessage(error.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startChatWithFreelancer = async (freelancerId: string) => {
    if (!currentUser) {
      setErrorMessage('Please connect your wallet to start a chat.');
      return;
    }

    if (!publicKey) {
      setErrorMessage('Wallet not connected. Please connect your wallet.');
      return;
    }

    if (freelancerId === currentUser.id) {
      setErrorMessage('You cannot start a chat with yourself.');
      console.error('Self-messaging attempt blocked: freelancerId matches currentUser.id', freelancerId);
      return;
    }

    const freelancer = freelancers.find(f => f.id === freelancerId);
    if (!freelancer) {
      setErrorMessage('Freelancer not found.');
      console.error('Invalid freelancerId:', freelancerId);
      return;
    }

    setChatLoading(true);
    setErrorMessage(null);

    try {
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.userId === currentUser.id) &&
        conv.participants.some(p => p.userId === freelancerId)
      );

      if (existingConversation) {
        console.log('Selecting existing conversation:', existingConversation.id);
        setSelectedChat(existingConversation.id);
        setActiveTab('conversations');
        if (isMobile) {
          setShowChatView(true);
        }
        return;
      }

      console.log('Creating new conversation with:', { currentUser: currentUser.id, freelancerId });
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': publicKey.toString(),
        },
        body: JSON.stringify({
          participantIds: [currentUser.id, freelancerId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to start chat');
      }

      const newConversation = await response.json();
      console.log('New conversation created:', newConversation);
      setConversations(prev => [newConversation, ...prev]);
      setSelectedChat(newConversation.id);
      setActiveTab('conversations');
      if (isMobile) {
        setShowChatView(true);
      }
    } catch (error: any) {
      console.error('Error starting chat:', error);
      setErrorMessage(error.message || 'Failed to start chat. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser || !publicKey) return;

    const conversation = conversations.find(c => c.id === selectedChat);
    if (!conversation) return;

    const receiverId = conversation.participants.find(p => p.userId !== currentUser.id)?.userId;
    if (!receiverId) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': publicKey.toString(),
        },
        body: JSON.stringify({
          content: messageContent,
          senderId: currentUser.id,
          receiverId,
          conversationId: selectedChat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const message = await response.json();
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedChat) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      }));

      // Scroll to bottom after message is sent
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error: any) {
      console.error('Error sending message:', error);
      setErrorMessage(error.message || 'Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.userId !== currentUser?.id)?.user;
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = getOtherParticipant(conversation);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser?.name?.toLowerCase().includes(searchLower) ||
      otherUser?.username?.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower)
    );
  });

  const filteredFreelancers = freelancers.filter(freelancer => {
    if (freelancer.id === currentUser?.id) return false; // Exclude current user
    const searchLower = searchQuery.toLowerCase();
    return (
      freelancer.name?.toLowerCase().includes(searchLower) ||
      freelancer.username?.toLowerCase().includes(searchLower) ||
      freelancer.gigs.some(gig => 
        gig.title.toLowerCase().includes(searchLower) ||
        gig.description.toLowerCase().includes(searchLower)
      )
    );
  });

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

  const ConversationsEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-[#1C1C1E] rounded-full p-4 mb-4">
        <MessageCircle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No conversations yet</h3>
      <p className="text-gray-400 max-w-md mb-4">
        Start chatting with freelancers to see your conversations here.
      </p>
      <button
        onClick={() => setActiveTab('freelancers')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Browse Freelancers
      </button>
    </div>
  );

  const FreelancersEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-[#1C1C1E] rounded-full p-4 mb-4">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">No freelancers found</h3>
      <p className="text-gray-400 max-w-md">
        No other freelancers with active gigs are available at the moment.
      </p>
    </div>
  );

  const ChatEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="bg-[#1C1C1E] rounded-full p-4 mb-4">
        <InboxIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">Select a conversation</h3>
      <p className="text-gray-400 max-w-md">
        Choose a conversation or start a new one with a freelancer.
      </p>
    </div>
  );

  const MessageList = () => (
    <div className="flex flex-col bg-[#111112] rounded-2xl overflow-hidden" style={{ height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)' }}>
      <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1C1C1E] text-gray-400 hover:text-white'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('freelancers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'freelancers'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1C1C1E] text-gray-400 hover:text-white'
            }`}
          >
            Freelancers
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'conversations' ? "Search conversations" : "Search freelancers"}
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

      {errorMessage && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mx-4 mt-4 flex-shrink-0">
          <p className="text-white text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'conversations' ? (
          filteredConversations.length === 0 ? (
            <ConversationsEmptyState />
          ) : (
            <div className="space-y-2 pt-4">
              {filteredConversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                const unreadCount = conversation.messages.filter(
                  m => m.receiverId === currentUser?.id && !m.isRead
                ).length;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedChat(conversation.id);
                      if (isMobile) {
                        setShowChatView(true);
                      }
                    }}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                      selectedChat === conversation.id
                        ? 'bg-blue-600/20 border border-blue-600/30'
                        : 'bg-[#1C1C1E]/50 hover:bg-[#1C1C1E]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {otherUser?.profileImage ? (
                        <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium text-sm">
                          {otherUser?.name || otherUser?.username || 'Unknown User'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredFreelancers.length === 0 ? (
            <FreelancersEmptyState />
          ) : (
            <div className="space-y-2 pt-4">
              {filteredFreelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  onClick={() => startChatWithFreelancer(freelancer.id)}
                  className="p-4 rounded-xl bg-[#1C1C1E]/50 cursor-pointer hover:bg-[#1C1C1E] transition-colors border border-[#26272B]"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {freelancer.profileImage ? (
                        <img src={freelancer.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-white font-semibold text-base">
                        {freelancer.name || freelancer.username || 'Anonymous'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {freelancer.gigs.length} gig{freelancer.gigs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startChatWithFreelancer(freelancer.id);
                      }}
                      disabled={chatLoading}
                      className={`bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg transition-colors ${
                        chatLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {chatLoading ? 'Starting...' : 'Start Chat'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {freelancer.gigs.slice(0, 1).map((gig) => (
                      <div key={gig.id} className="bg-[#2C2C2E] rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          {gig.image && (
                            <img
                              src={gig.image}
                              alt={gig.title}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <h4 className="text-white font-medium text-sm">{gig.title}</h4>
                            <p className="text-gray-400 text-xs line-clamp-2">{gig.description}</p>
                            <span className="text-blue-400 text-xs font-medium">◎{gig.amount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {freelancer.gigs.length > 1 && (
                      <div className="text-xs text-gray-400">
                        +{freelancer.gigs.length - 1} more gig{freelancer.gigs.length - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );

  const ChatView = () => {
    const currentConversation = conversations.find(c => c.id === selectedChat);
    const otherUser = currentConversation ? getOtherParticipant(currentConversation) : null;

    if (!selectedChat || !currentConversation) {
      return (
        <div className="flex flex-col bg-[#111112] rounded-2xl overflow-hidden" style={{ height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)' }}>
          <ChatEmptyState />
        </div>
      );
    }

    return (
      <div className="flex flex-col bg-[#111112] rounded-2xl overflow-hidden" style={{ height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)' }}>
        <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
          <div className="flex items-center">
            {isMobile && (
              <button 
                onClick={() => setShowChatView(false)}
                className="mr-3 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {otherUser?.profileImage ? (
                <img src={otherUser.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h2 className="ml-3 text-lg font-semibold text-white">
              {otherUser?.name || otherUser?.username || 'Unknown User'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {currentConversation.messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl flex flex-col ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1C1C1E] text-white'
                  }`}
                >
                  <p className={`text-sm ${!isOwnMessage && !message.isRead ? 'font-medium' : ''}`}>
                    {message.content}
                  </p>
                  <div className={`flex items-center justify-end mt-1 text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(message.createdAt)}
                    {isOwnMessage && (
                      <CheckCheck
                        className={`w-3 h-3 ml-1 ${message.isRead ? 'text-blue-200' : 'text-gray-400'}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-[#1C1C1E] text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-full p-3 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
          
          <div className={`flex gap-6 ${isMobile ? 'flex-col' : ''}`}>
            {isMobile ? (
              <div className="w-full">
                {showChatView ? <ChatView /> : <MessageList />}
              </div>
            ) : (
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