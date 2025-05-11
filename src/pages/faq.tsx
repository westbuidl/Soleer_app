"use client";
import React, { useState, useEffect } from 'react';
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/common/Navbar";
import "../app/globals.css";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [displayText, setDisplayText] = useState("");
  const fullText = "We're sure you have some questions...";
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const navItems = [
    { title: 'DASHBOARD', href: '../dashboard' },
    { title: 'INBOX', href: '../inbox' },
    { title: 'PROFILE', href: '../profile' },
    { title: 'MARKETPLACE', href: '/' },
    { title: 'SOLEER HOME', href: 'https://www.soleer.xyz' },
    { title: 'FAQ', href: 'https://www.soleer.xyz/faq' },
  ];

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    setIsTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const faqData: FAQItem[] = [
    {
      question: "What is Soleer?",
      answer: "Soleer is the first peer-to-peer (P2P) service marketplace built on the Solana blockchain. It connects freelancers and clients, enabling them to transact services in a fast, transparent, and cost-effective manner using blockchain technology"
    },
    {
      question: "How does Soleer work?",
      answer: "Soleer operates as a decentralized marketplace where Freelancers (Service Providers) offer services, create listings, and receive payments in cryptocurrency.<br /><br />Clients can browse, hire freelancers, and make payments using Soleer's escrow system, which ensures secure transactions.<br /><br />All interactions are secured via smart contracts, ensuring that payments are only released once both parties are satisfied."
    },
    {
      question: "What is the benefit of using Soleer over traditional platforms?",
      answer: "Low Fees: Transactions on Soleer incur significantly lower fees than traditional freelance platforms, thanks to Solana's low-cost blockchain.<br /><br />Speed: Solana processes up to 65,000 transactions per second, ensuring fast and efficient interactions.<br /><br />Transparency: All transactions and user reputations are stored on the blockchain, making them verifiable and immutable.<br /><br />Security: Smart contracts ensure payments are held in escrow until the work is completed, offering protection for both freelancers and clients.<br /><br />Decentralization: Soleer eliminates central authorities, reducing the risk of censorship or unfair practices."
    },
    {
      question: "How do payments work on Soleer?",
      answer: "All payments on Soleer are handled via cryptocurrency.<br /><br />When a client hires a freelancer, the agreed-upon payment is held in an escrow smart contract on the Solana blockchain. Once the freelancer delivers the work and the client approves it, the funds are released from escrow"
    },
    {
      question: "What currencies can I use on Soleer?",
      answer: "Soleer primarily uses Solana (SOL) for transactions, but additional cryptocurrency options may be supported as the platform evolves.<br /><br />You will need a compatible Solana wallet to engage in transactions."
    },
    {
      question: "How does the reputation system work?",
      answer: "Soleer's reputation system is based on user ratings and feedback, stored transparently on the blockchain.<br /><br />Freelancers are rated by clients based on the quality of work, communication, and adherence to deadlines.<br /><br />Similarly, clients are rated by freelancers for professionalism and timely payments.<br /><br />These ratings help users build trust and visibility on the platform."
    },
    {
      question: "How do I resolve disputes?",
      answer: "In case of a disagreement between a freelancer and a client, Soleer provides a dispute resolution mechanism:<br /><br />1. Direct Communication: Users are encouraged to resolve issues through direct dialogue.<br /><br />2. Escalation to Arbitration: If no agreement is reached, the dispute can be escalated, and smart contracts will enforce the agreed terms. Neutral third-party arbiters may be used to make a final decision.<br /><br />3. Smart Contracts: Payments held in escrow will only be released based on the resolution of the dispute."
    },
    {
      question: "How do I create a profile on Soleer?",
      answer: "To create a profile:<br /><br />1. Sign up on Soleer using your email address and link your Solana wallet.<br /><br />2. Complete your profile by providing relevant personal information, your skills, and portfolio if you are a freelancer.<br /><br />3. You're ready to start offering services or hiring talent on the platform!"
    },
    {
      question: "How do I hire a freelancer on Soleer?",
      answer: "1. Browse available freelancers or services through the platform's search functionality.<br /><br />2. Review their profile, past work, and ratings.<br /><br />3. Contact the freelancer to discuss your project details and agree on terms.<br /><br />4. Once agreed, deposit the payment into the escrow smart contract.<br /><br />5. Upon satisfactory completion, release the payment to the freelancer."
    },
    {
      question: "How do I offer services as a freelancer on Soleer?",
      answer: "1. Complete your profile and clearly define the services you offer.<br /><br />2. List your services with detailed descriptions, prices, and timelines.<br /><br />3. Respond to client inquiries and negotiate terms as needed.<br /><br />4. Once hired, deliver the agreed-upon services and receive payment upon the client's approval."
    },
    {
      question: "What is escrow, and how does it work?",
      answer: "Escrow is a secure payment mechanism where funds are held by a third-party (in this case, a smart contract on the blockchain) until both parties fulfill their agreement.<br /><br />On Soleer, client payments are held in escrow until the freelancer delivers the work and the client approves it."
    },
    {
      question: "Can I cancel a project after hiring a freelancer?",
      answer: "Yes, but only if both parties agree to cancel the project.<br /><br />If a freelancer has already started work, cancellation terms and refunds will depend on the terms agreed upon during the project's negotiation phase.<br /><br />In case of disputes, Soleer's dispute resolution process can be used."
    },
    {
      question: "How do I protect myself from scams or low-quality work?",
      answer: "Soleer's escrow system ensures that payments are not released until the work is completed and approved by the client.<br /><br />The platform's transparent reputation system also helps users assess the credibility and reliability of freelancers and clients before starting a project."
    },
    {
      question: "How do I withdraw earnings as a freelancer?",
      answer: "Once your client approves the work, the payment held in escrow will be released to your Solana wallet.<br /><br />From there, you can transfer your earnings to any supported cryptocurrency wallet or exchange."
    },
    {
      question: "Is Soleer available worldwide?",
      answer: "Yes, Soleer is a global platform. By using blockchain technology and cryptocurrency payments, freelancers and clients from anywhere in the world can transact without traditional banking limitations."
    },
    {
      question: "How does Soleer ensure security?",
      answer: "Blockchain Security: Transactions are secured on the Solana blockchain, ensuring transparency and immutability.<br /><br />Smart Contracts: All payments are managed by smart contracts, reducing the risk of fraud or payment disputes.<br /><br />Reputation System: The transparent, immutable reputation system helps identify trustworthy freelancers and clients."
    },
    {
      question: "Can I use Soleer on mobile?",
      answer: "Yes, Soleer can be accessed via mobile-friendly web interfaces.<br /><br />The platform will offer mobile apps as well for a better user experience on smartphones and tablets."
    },
    {
      question: "How can I contact Soleer support?",
      answer: "If you need assistance, you can reach out to our customer support team by emailing us at founder@soleer.xyz or through the help section on the platform."
    }
];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen relative">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-90"
        style={{
          backgroundImage: 'url("/images/Ellipse-token.png")',
          backgroundBlendMode: 'overlay'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A] opacity-90" />

      {/* Content */}
      <div className="relative z-10">
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-90"
          style={{
            backgroundImage: 'url("/images/Ellipse-token.png")',
            backgroundBlendMode: 'overlay'
          }}
        />
        <Navbar 
          navItems={navItems} 
          title="Soleer Frequently Asked Questions" 
          description="Find and hire top freelancers on the blockchain"
        />
        
        <div className="max-w-4xl mx-auto py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-yellow-500 text-lg mb-2">FREQUENTLY ASKED QUESTIONS</h2>
            <h1 className="text-white text-4xl sm:text-5xl font-bold min-h-[60px]">
              {displayText}
              {!isTypingComplete && <span className="animate-pulse">|</span>}
            </h1>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-[#111111]/80 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 border border-gray-800"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-[#1a1a1a] transition-colors"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <span className="text-white w-6 h-6 flex items-center justify-center">
                    {openIndex === index ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </button>
                <div
                  className={`px-6 transition-all duration-300 overflow-hidden ${
                    openIndex === index ? 'max-h-[1000px] py-4' : 'max-h-0'
                  }`}
                >
                  <div 
                    className="text-gray-400"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default FAQSection;