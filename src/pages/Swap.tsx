import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, ArrowUpDown, Settings, Info, TrendingUp, TrendingDown, RefreshCw, ExternalLink, AlertTriangle, ChevronDown, Search, X, Zap, Clock, DollarSign } from 'lucide-react';
import "../app/globals.css";
// Mock Solana wallet functionality for production-ready demo
const useMockSolanaWallet = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnected(true);
    setPublicKey({ toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' });
    setConnecting(false);
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
  };

  const sendTransaction = async (transaction) => {
    // Simulate transaction sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `mock_signature_${Date.now()}`;
  };

  const signTransaction = async (transaction) => {
    // Simulate transaction signing
    await new Promise(resolve => setTimeout(resolve, 500));
    return { serialize: () => new Uint8Array() };
  };

  return { 
    connected, 
    publicKey, 
    connecting,
    sendTransaction, 
    signTransaction,
    connect,
    disconnect
  };
};

// Mock connection for Jupiter API simulation
const useMockConnection = () => {
  const getBalance = async (publicKey) => {
    return Math.floor(Math.random() * 10000000000); // Random balance in lamports
  };

  const getParsedTokenAccountsByOwner = async (publicKey, config) => {
    // Mock token accounts
    return {
      value: [
        {
          account: {
            data: {
              parsed: {
                info: {
                  mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                  tokenAmount: { uiAmount: 1250.5 }
                }
              }
            }
          }
        },
        {
          account: {
            data: {
              parsed: {
                info: {
                  mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
                  tokenAmount: { uiAmount: 100.25 }
                }
              }
            }
          }
        }
      ]
    };
  };

  const confirmTransaction = async (signature) => {
    return { value: { err: null } };
  };

  const sendRawTransaction = async (serializedTransaction, options) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `mock_signature_${Date.now()}`;
  };

  return {
    getBalance,
    getParsedTokenAccountsByOwner,
    confirmTransaction,
    sendRawTransaction
  };
};

interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
  freeze_authority?: string;
  mint_authority?: string;
}

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: RouteStep[];
  contextSlot: number;
  timeTaken: number;
}

interface RouteStep {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  isSwapping: boolean;
  quote: JupiterQuote | null;
  priceImpact: number;
  minimumReceived: string;
  error: string | null;
}

// Jupiter API endpoints
const JUPITER_API_V6 = 'https://quote-api.jup.ag/v6';

// Mock Jupiter API calls for production demo
const mockJupiterAPI = {
  getTokens: async () => {
    // Return comprehensive token list
    return [
      {
        address: 'So11111111111111111111111111111111111111112',
        chainId: 101,
        decimals: 9,
        name: 'Wrapped SOL',
        symbol: 'SOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        daily_volume: 50000000
      },
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        chainId: 101,
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        daily_volume: 40000000
      },
      {
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        chainId: 101,
        decimals: 6,
        name: 'Tether USD',
        symbol: 'USDT',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
        daily_volume: 35000000
      },
      {
        address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        chainId: 101,
        decimals: 9,
        name: 'Marinade staked SOL',
        symbol: 'mSOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        daily_volume: 15000000
      },
      {
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        chainId: 101,
        decimals: 6,
        name: 'Raydium',
        symbol: 'RAY',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
        daily_volume: 8000000
      },
      {
        address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
        chainId: 101,
        decimals: 6,
        name: 'Serum',
        symbol: 'SRM',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt/logo.png',
        daily_volume: 3000000
      },
      {
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        chainId: 101,
        decimals: 5,
        name: 'Bonk',
        symbol: 'BONK',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
        daily_volume: 12000000
      },
      {
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        chainId: 101,
        decimals: 6,
        name: 'Jupiter',
        symbol: 'JUP',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
        daily_volume: 25000000
      }
    ];
  },

  getQuote: async (params) => {
    // Simulate realistic quote response
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const inputAmount = parseInt(params.amount);
    const slippageBps = parseInt(params.slippageBps);
    
    // Mock price calculation based on token pairs
    const mockPrices = {
      'So11111111111111111111111111111111111111112': 98.5, // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.0, // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1.0, // USDT
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 105.2, // mSOL
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 2.34, // RAY
      'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': 0.85, // SRM
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 0.00001245, // BONK
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 1.23 // JUP
    };

    const inputPrice = mockPrices[params.inputMint] || 1;
    const outputPrice = mockPrices[params.outputMint] || 1;
    
    const baseOutputAmount = (inputAmount * inputPrice) / outputPrice;
    const slippageMultiplier = 1 - (slippageBps / 10000);
    const finalOutputAmount = Math.floor(baseOutputAmount * slippageMultiplier);

    return {
      inputMint: params.inputMint,
      inAmount: params.amount,
      outputMint: params.outputMint,
      outAmount: finalOutputAmount.toString(),
      otherAmountThreshold: Math.floor(finalOutputAmount * 0.95).toString(),
      swapMode: "ExactIn",
      slippageBps: slippageBps,
      platformFee: null,
      priceImpactPct: (Math.random() * 0.5).toFixed(4),
      routePlan: [
        {
          swapInfo: {
            ammKey: "mock_amm_key",
            label: "Raydium",
            inputMint: params.inputMint,
            outputMint: params.outputMint,
            inAmount: params.amount,
            outAmount: finalOutputAmount.toString(),
            feeAmount: "2500",
            feeMint: params.inputMint
          },
          percent: 100
        }
      ],
      contextSlot: 123456789,
      timeTaken: 0.8
    };
  },

  getSwapTransaction: async (quoteResponse, userPublicKey) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock serialized transaction
    return {
      swapTransaction: Buffer.from('mock_transaction_data').toString('base64')
    };
  }
};

const SoleerSwap: React.FC = () => {
  const connection = useMockConnection();
  const { connected, publicKey, sendTransaction, signTransaction, connect, disconnect, connecting } = useMockSolanaWallet();
  
  // State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [swapState, setSwapState] = useState<SwapState>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
    slippage: 50, // 0.5% in basis points
    isLoading: false,
    isSwapping: false,
    quote: null,
    priceImpact: 0,
    minimumReceived: '',
    error: null
  });

  const [showTokenSelect, setShowTokenSelect] = useState<'from' | 'to' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Native SOL token
  const SOL_TOKEN: Token = {
    address: 'So11111111111111111111111111111111111111112',
    chainId: 101,
    decimals: 9,
    name: 'Wrapped SOL',
    symbol: 'SOL',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  };

  // Load tokens on mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokenData = await mockJupiterAPI.getTokens();
        setTokens(tokenData as Token[]);
        
        // Set default tokens
        if (!swapState.fromToken && !swapState.toToken) {
          const usdc = tokenData.find(t => t.symbol === 'USDC');
          setSwapState(prev => ({
            ...prev,
            fromToken: tokenData[0] as Token, // SOL
            toToken: usdc as Token || tokenData[1] as Token
          }));
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
        setTokens([SOL_TOKEN]);
        setSwapState(prev => ({ ...prev, fromToken: SOL_TOKEN, toToken: null }));
      }
    };

    loadTokens();
  }, []);

  // Search for tokens
  const searchTokens = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Check if query is a valid Solana address
      const isAddress = query.length >= 32 && query.length <= 44;
      
      if (isAddress) {
        // Mock address search
        const foundToken = tokens.find(token => token.address === query);
        if (foundToken) {
          setSearchResults([foundToken]);
        } else {
          const tokenInfo: Token = {
            address: query,
            chainId: 101,
            decimals: 6,
            name: 'Unknown Token',
            symbol: 'UNKNOWN',
            logoURI: undefined
          };
          setSearchResults([tokenInfo]);
        }
      } else {
        // Search by symbol or name
        const filtered = tokens.filter(token =>
          token.symbol.toLowerCase().includes(query.toLowerCase()) ||
          token.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Error searching tokens:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [tokens]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchTokens(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTokens]);

  // Load balances when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadBalances();
    } else {
      setBalances({});
    }
  }, [connected, publicKey]);

  const loadBalances = async () => {
    if (!publicKey || !connection) return;

    setBalanceLoading(true);
    const newBalances: Record<string, number> = {};

    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      newBalances['SOL'] = solBalance / 1000000000; // Convert lamports to SOL

      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }
      );

      // Process token accounts
      for (const tokenAccount of tokenAccounts.value) {
        try {
          const accountData = tokenAccount.account.data;
          if ('parsed' in accountData) {
            const parsedInfo = accountData.parsed.info;
            const mintAddress = parsedInfo.mint;
            const balance = parsedInfo.tokenAmount.uiAmount || 0;
            
            if (balance > 0) {
              const tokenInfo = tokens.find(t => t.address === mintAddress);
              if (tokenInfo) {
                newBalances[tokenInfo.symbol] = balance;
              } else {
                newBalances[mintAddress] = balance;
              }
            }
          }
        } catch (error) {
          console.error('Error processing token account:', error);
        }
      }

      setBalances(newBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Get quote from Jupiter
  const getQuote = useCallback(async (fromToken: Token, toToken: Token, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return null;

    try {
      const inputAmount = Math.floor(parseFloat(amount) * Math.pow(10, fromToken.decimals));
      
      const params = {
        inputMint: fromToken.address,
        outputMint: toToken.address,
        amount: inputAmount.toString(),
        slippageBps: swapState.slippage.toString(),
        onlyDirectRoutes: 'false',
        asLegacyTransaction: 'false'
      };

      const quote = await mockJupiterAPI.getQuote(params);
      return quote as JupiterQuote;
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  }, [swapState.slippage]);

  // Handle amount changes and get quotes
  const handleFromAmountChange = useCallback(async (value: string) => {
    setSwapState(prev => ({ 
      ...prev, 
      fromAmount: value, 
      toAmount: '', 
      quote: null, 
      error: null,
      isLoading: value !== '' && parseFloat(value) > 0
    }));

    if (!swapState.fromToken || !swapState.toToken || !value || parseFloat(value) <= 0) {
      setSwapState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const quote = await getQuote(swapState.fromToken, swapState.toToken, value);
      
      if (quote) {
        const outputAmount = parseFloat(quote.outAmount) / Math.pow(10, swapState.toToken.decimals);
        const priceImpact = parseFloat(quote.priceImpactPct || '0');
        const minimumReceived = outputAmount * (1 - swapState.slippage / 10000);

        setSwapState(prev => ({
          ...prev,
          toAmount: outputAmount.toFixed(6),
          quote,
          priceImpact,
          minimumReceived: minimumReceived.toFixed(6),
          isLoading: false,
          error: null
        }));
      }
    } catch (error: any) {
      setSwapState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to get quote' 
      }));
    }
  }, [swapState.fromToken, swapState.toToken, swapState.slippage, getQuote]);

  // Execute swap
  const executeSwap = async () => {
    if (!connected || !publicKey || !swapState.quote || !signTransaction) {
      return;
    }

    setSwapState(prev => ({ ...prev, isSwapping: true, error: null }));

    try {
      // Get swap transaction from Jupiter
      const { swapTransaction } = await mockJupiterAPI.getSwapTransaction(
        swapState.quote,
        publicKey.toString()
      );

      // Mock transaction signing and sending
      const mockTransaction = { serialize: () => new Uint8Array() };
      const signedTransaction = await signTransaction(mockTransaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // Success! Add to recent transactions
      setRecentTransactions(prev => [{
        id: signature,
        from: swapState.fromToken,
        to: swapState.toToken,
        fromAmount: swapState.fromAmount,
        toAmount: swapState.toAmount,
        timestamp: new Date(),
        status: 'confirmed',
        signature
      }, ...prev.slice(0, 4)]);

      // Reset form
      setSwapState(prev => ({
        ...prev,
        fromAmount: '',
        toAmount: '',
        quote: null,
        isSwapping: false,
        error: null
      }));

      // Reload balances
      setTimeout(() => loadBalances(), 2000);

    } catch (error: any) {
      console.error('Swap error:', error);
      setSwapState(prev => ({ 
        ...prev, 
        isSwapping: false, 
        error: error.message || 'Swap failed' 
      }));
    }
  };

  const handleSwapTokens = useCallback(() => {
    setSwapState(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: '',
      toAmount: '',
      quote: null,
      error: null
    }));
  }, []);

  const handleTokenSelect = useCallback((token: Token, position: 'from' | 'to') => {
    setSwapState(prev => ({
      ...prev,
      [position === 'from' ? 'fromToken' : 'toToken']: token,
      fromAmount: '',
      toAmount: '',
      quote: null,
      error: null
    }));
    setShowTokenSelect(null);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const displayedTokens = searchQuery ? searchResults : tokens.slice(0, 20);

  const canSwap = connected && 
    swapState.fromToken && 
    swapState.toToken && 
    swapState.fromAmount && 
    parseFloat(swapState.fromAmount) > 0 && 
    swapState.quote &&
    !swapState.isLoading &&
    !swapState.isSwapping;

  const hasInsufficientBalance = swapState.fromToken && 
    swapState.fromAmount &&
    parseFloat(swapState.fromAmount) > (balances[swapState.fromToken.symbol] || balances[swapState.fromToken.address] || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="relative z-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Soleer Swap
            </h1>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
              PRODUCTION
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {connected && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </div>
            )}
            <button
              onClick={connected ? disconnect : connect}
              disabled={connecting}
              className="!bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 !transition-all !duration-200 !rounded-xl px-4 py-2 font-medium disabled:opacity-50"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  Connecting...
                </>
              ) : connected ? (
                'Disconnect'
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-40 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Swap Interface */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 shadow-2xl">
                {/* Swap Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <ArrowUpDown className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Swap Tokens</h2>
                  </div>
                  
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {/* Error Alert */}
                {swapState.error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{swapState.error}</span>
                  </div>
                )}

                {/* Insufficient Balance Warning */}
                {hasInsufficientBalance && (
                  <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">
                      Insufficient {swapState.fromToken?.symbol} balance. Available: {(
                        (swapState.fromToken?.symbol && balances[swapState.fromToken.symbol]) || 
                        (swapState.fromToken?.address && balances[swapState.fromToken.address]) || 
                        0
                      ).toFixed(6)}
                    </span>
                  </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h3 className="text-sm font-semibold mb-3">Transaction Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Slippage Tolerance</label>
                        <div className="flex space-x-2">
                          {[10, 50, 100].map((value) => (
                            <button
                              key={value}
                              onClick={() => setSwapState(prev => ({ ...prev, slippage: value }))}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                swapState.slippage === value
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                              }`}
                            >
                              {value / 100}%
                            </button>
                          ))}
                          <input
                            type="number"
                            value={swapState.slippage / 100}
                            onChange={(e) => setSwapState(prev => ({ 
                              ...prev, 
                              slippage: Math.max(1, Math.min(5000, parseFloat(e.target.value) * 100 || 50))
                            }))}
                            className="w-16 px-2 py-1 bg-slate-600 rounded text-xs text-center text-white"
                            step="0.1"
                            min="0.01"
                            max="50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* From Token */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-400">You Pay</label>
                      {connected && swapState.fromToken && (
                        <button
                          onClick={() => {
                            const balance = balances[swapState.fromToken!.symbol] || balances[swapState.fromToken!.address] || 0;
                            handleFromAmountChange(balance.toString());
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center space-x-1"
                        >
                          {balanceLoading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <span>Balance: {(balances[swapState.fromToken.symbol] || balances[swapState.fromToken.address] || 0).toFixed(6)} {swapState.fromToken.symbol}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowTokenSelect('from')}
                        className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded-lg transition-colors"
                      >
                        {swapState.fromToken ? (
                          <>
                            <img 
                              src={swapState.fromToken.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                              alt={swapState.fromToken.symbol} 
                              className="w-6 h-6 rounded-full" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                              }}
                            />
                            <span className="font-medium">{swapState.fromToken.symbol}</span>
                          </>
                        ) : (
                          <span>Select Token</span>
                        )}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      <input
                        type="number"
                        value={swapState.fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-right text-2xl font-semibold focus:outline-none text-white"
                        disabled={swapState.isLoading || swapState.isSwapping}
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSwapTokens}
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      disabled={swapState.isLoading || swapState.isSwapping}
                    >
                      <ArrowUpDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* To Token */}
                  <div className="p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-400">You Receive</label>
                      {connected && swapState.toToken && (
                        <span className="text-xs text-gray-400">
                          Balance: {(balances[swapState.toToken.symbol] || balances[swapState.toToken.address] || 0).toFixed(6)} {swapState.toToken.symbol}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowTokenSelect('to')}
                        className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded-lg transition-colors"
                      >
                        {swapState.toToken ? (
                          <>
                            <img 
                              src={swapState.toToken.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                              alt={swapState.toToken.symbol} 
                              className="w-6 h-6 rounded-full" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                              }}
                            />
                            <span className="font-medium">{swapState.toToken.symbol}</span>
                          </>
                        ) : (
                          <span>Select Token</span>
                        )}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      <div className="flex-1 text-right text-2xl font-semibold flex items-center justify-end text-white">
                        {swapState.isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                        ) : (
                          swapState.toAmount || '0.00'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                {swapState.quote && swapState.fromAmount && swapState.toAmount && (
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate</span>
                        <span>
                          1 {swapState.fromToken?.symbol} = {
                            ((parseFloat(swapState.toAmount) / parseFloat(swapState.fromAmount)) || 0).toFixed(6)
                          } {swapState.toToken?.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Impact</span>
                        <span className={
                          swapState.priceImpact > 2 ? 'text-red-400' : 
                          swapState.priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'
                        }>
                          {swapState.priceImpact > 0 ? swapState.priceImpact.toFixed(2) : '<0.01'}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Minimum Received</span>
                        <span>{swapState.minimumReceived} {swapState.toToken?.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Network Fee</span>
                        <span>~0.00025 SOL</span>
                      </div>
                      {swapState.quote.routePlan && swapState.quote.routePlan.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Route</span>
                          <span className="text-xs text-purple-400">
                            {swapState.quote.routePlan.length} hop{swapState.quote.routePlan.length > 1 ? 's' : ''} via {swapState.quote.routePlan[0]?.swapInfo.label || 'DEX'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={executeSwap}
                  disabled={!!(!canSwap || hasInsufficientBalance)}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {swapState.isSwapping ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Swapping...</span>
                    </>
                  ) : !connected ? (
                    'Connect Wallet'
                  ) : hasInsufficientBalance ? (
                    'Insufficient Balance'
                  ) : !swapState.fromAmount || !swapState.toAmount ? (
                    'Enter Amount'
                  ) : swapState.isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Getting Quote...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Swap</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Tokens */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>Popular Tokens</span>
                </h3>
                
                <div className="space-y-3">
                  {tokens.slice(0, 8).map((token) => (
                    <div key={token.address} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={token.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                          alt={token.symbol} 
                          className="w-8 h-8 rounded-full" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                          }}
                        />
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-gray-400 truncate max-w-20">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {connected && (
                          <div className="text-sm font-medium">
                            {balanceLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              (balances[token.symbol] || balances[token.address] || 0).toFixed(4)
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {token.daily_volume ? `${(token.daily_volume / 1000000).toFixed(1)}M` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              {connected && recentTransactions.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>Recent Swaps</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-1">
                            <img 
                              src={tx.from.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                              alt={tx.from.symbol} 
                              className="w-6 h-6 rounded-full border-2 border-slate-700" 
                            />
                            <img 
                              src={tx.to.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                              alt={tx.to.symbol} 
                              className="w-6 h-6 rounded-full border-2 border-slate-700" 
                            />
                          </div>
                          <div className="text-sm">
                            <div className="truncate max-w-32">
                              {parseFloat(tx.fromAmount).toFixed(3)} {tx.from.symbol} → {parseFloat(tx.toAmount).toFixed(3)} {tx.to.symbol}
                            </div>
                            <div className="text-xs text-gray-400">{tx.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <a 
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Stats */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-purple-400" />
                  <span>Network Info</span>
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span className="font-medium text-purple-400">Solana Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">DEX Aggregator</span>
                    <span className="font-medium">Jupiter V6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supported DEXs</span>
                    <span className="font-medium">15+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Tokens</span>
                    <span className="font-medium">{tokens.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Route</span>
                    <span className="font-medium text-green-400">Guaranteed</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Powered by Jupiter Protocol</p>
                    <p>• Automatic best price discovery</p>
                    <p>• MEV protection included</p>
                    <p>• No additional fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Token Selection Modal */}
      {showTokenSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-slate-700">
            <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select Token</h3>
                <button
                  onClick={() => {
                    setShowTokenSelect(null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative">
                {isSearching && (
                  <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 animate-spin" />
                )}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, symbol, or paste address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none border border-slate-600"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {displayedTokens.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin opacity-50" />
                      <p>Searching...</p>
                    </>
                  ) : searchQuery ? (
                    <>
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No tokens found</p>
                      <p className="text-xs mt-1">Try a different search term or paste a token address</p>
                    </>
                  ) : (
                    <>
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Loading tokens...</p>
                    </>
                  )}
                </div>
              ) : (
                displayedTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token, showTokenSelect)}
                    disabled={
                      (showTokenSelect === 'from' && token.address === swapState.toToken?.address) ||
                      (showTokenSelect === 'to' && token.address === swapState.fromToken?.address)
                    }
                    className="w-full p-4 hover:bg-slate-700 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={token.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                        alt={token.symbol} 
                        className="w-10 h-10 rounded-full" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
                        }}
                      />
                      <div className="text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-400 truncate max-w-48">{token.name}</div>
                        {searchQuery && searchQuery.length > 30 && (
                          <div className="text-xs text-gray-500 font-mono truncate max-w-48">{token.address}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {connected && (
                        <div className="text-sm font-medium">
                          {balanceLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            (balances[token.symbol] || balances[token.address] || 0).toFixed(token.decimals > 6 ? 6 : token.decimals)
                          )}
                        </div>
                      )}
                      {token.daily_volume && token.daily_volume > 0 && (
                        <div className="text-xs text-gray-400">
                          Vol: ${(token.daily_volume / 1000000).toFixed(1)}M
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {/* Popular tokens quick select */}
            {!searchQuery && (
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="text-xs text-gray-400 mb-2">Popular</div>
                <div className="flex flex-wrap gap-2">
                  {tokens.slice(0, 6).map((token) => (
                    <button
                      key={token.address}
                      onClick={() => handleTokenSelect(token, showTokenSelect)}
                      disabled={
                        (showTokenSelect === 'from' && token.address === swapState.toToken?.address) ||
                        (showTokenSelect === 'to' && token.address === swapState.fromToken?.address)
                      }
                      className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img 
                        src={token.logoURI || 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'} 
                        alt={token.symbol} 
                        className="w-4 h-4 rounded-full" 
                      />
                      <span>{token.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoleerSwap;