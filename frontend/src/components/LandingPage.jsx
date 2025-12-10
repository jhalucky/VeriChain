import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Link2, 
  PieChart, 
  ShieldCheck, 
  CloudUpload, 
  Search, 
  Rocket, 
  Coins,
  Menu,
  X,
  ArrowRight,
  Github,
  Twitter,
  Zap,
  LogOut
} from 'lucide-react';

// Utility function for animated counters
const useCounter = (end, duration = 2000, shouldStart = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};

// Format number with K/M suffix
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const LandingPage = ({ onLaunchApp, user, onSignOut }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.getElementById('stats-section');
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const assetsCount = useCounter(1247, 2000, statsVisible);
  const tvlCount = useCounter(45, 2000, statsVisible);
  const usersCount = useCounter(3890, 2000, statsVisible);
  const contractsCount = useCounter(892, 2000, statsVisible);

  return (
    <div className="min-h-screen bg-deep-space text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-subtle-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <img 
                src="https://pixabay.com/get/g83bf8d58a6453b04ff15ed5d02d1d4e623363eb644736cb0f50fcb84e81d798e8356b6f767f1d699dcf75bf1f4e012b6.svg"
                alt="RWA Platform Logo - OpenClipart-Vectors on Pixabay"
                className="w-7 h-7 sm:w-8 sm:h-8"
                style={{ filter: 'drop-shadow(0 0 8px rgba(209, 188, 0, 0.6))' }}
              />
              <span className="text-base sm:text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}><span className="text-neon-yellow">RWA</span> Platform</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">How it Works</a>
              <a href="#technology" className="text-sm text-white/70 hover:text-white transition-colors">Technology</a>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.photoURL && (
                      <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full" />
                    )}
                    <span className="text-xs text-white/70 hidden lg:block">{user.displayName}</span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="px-3 py-1.5 glass-card rounded-lg text-xs font-semibold hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              )}
              <button 
                onClick={onLaunchApp}
                className="px-4 py-1.5 bg-gradient-to-r from-neon-yellow/90 to-neon-yellow rounded-lg text-sm font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-neon-yellow/50 text-deep-space font-bold"
              >
                Launch App
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-subtle-border">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block body-base text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="block body-base text-white/70 hover:text-white transition-colors">How it Works</a>
              <a href="#technology" className="block body-base text-white/70 hover:text-white transition-colors">Technology</a>
              {user && (
                <>
                  <div className="flex items-center gap-2 py-2">
                    {user.photoURL && (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                    )}
                    <span className="body-sm text-white/70">{user.displayName}</span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="w-full px-4 py-2 glass-card rounded-lg body-sm font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              )}
              <button 
                onClick={onLaunchApp}
                className="w-full px-6 py-2 bg-gradient-to-r from-neon-yellow/90 to-neon-yellow rounded-lg body-base font-semibold text-deep-space font-bold"
              >
                Launch App
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-dark-surface to-deep-space">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-yellow rounded-full blur-[140px] animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-yellow/60 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            {/* Main Heading */}
            <h1 className="mb-6 px-4">
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
                Transform <span className="text-neon-yellow">Real-World</span>
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
                <span className="text-neon-yellow">Assets</span> into Digital Tokens
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-3xl mx-auto leading-relaxed px-4" style={{ fontFamily: "'Source Sans 3', sans-serif", fontWeight: 300 }}>
              Unlock <span className="text-neon-yellow">liquidity</span> through AI-powered asset scoring and blockchain tokenization. 
              <span className="block mt-1">Enable <span className="text-neon-yellow">fractional ownership</span> of high-value assets in minutes.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <button 
                onClick={onLaunchApp}
                className="px-8 py-4 bg-gradient-to-r from-neon-yellow/90 to-neon-yellow rounded-xl text-base font-bold hover:shadow-lg hover:shadow-neon-yellow/50 transition-all duration-300 flex items-center gap-2 group transform hover:scale-105 text-deep-space border-2 border-neon-yellow/30"
              >
                Launch App
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="mt-16 relative">
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <img 
                src="/hero-network.svg" 
                alt="Blockchain Network" 
                className="w-full h-auto opacity-80"
                style={{ filter: 'drop-shadow(0 0 40px rgba(209, 188, 0, 0.4))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3D Rotating Logo Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-surface/30 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-block perspective-1000">
              <img 
                src="https://pixabay.com/get/g83bf8d58a6453b04ff15ed5d02d1d4e623363eb644736cb0f50fcb84e81d798e8356b6f767f1d699dcf75bf1f4e012b6.svg"
                alt="RWA Platform 3D Logo - OpenClipart-Vectors on Pixabay"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 animate-3d-rotate"
                style={{ 
                  filter: 'drop-shadow(0 0 30px rgba(209, 188, 0, 0.6)) drop-shadow(0 0 60px rgba(209, 188, 0, 0.4))',
                  transformStyle: 'preserve-3d'
                }}
              />
            </div>
          </div>
          <h2 className="heading-lg mb-4"><span className="text-neon-yellow">Revolutionizing</span> Asset Ownership</h2>
          <p className="body-lg text-white/70 max-w-2xl mx-auto">
            We're building the infrastructure for the <span className="text-neon-yellow">future</span> of finance, where real-world assets meet blockchain technology to create unprecedented opportunities for investors worldwide.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="heading-lg mb-3"><span className="text-neon-yellow">Powerful</span> Features</h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Everything you need to tokenize and manage real-world assets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: <BrainCircuit size={28} className="text-neon-yellow" />,
                title: 'AI-Powered Scoring',
                description: 'Instant asset valuations using advanced ML algorithms'
              },
              {
                icon: <Link2 size={28} className="text-neon-yellow" />,
                title: 'Blockchain Tokenization',
                description: 'Secure smart contracts for fractional ownership'
              },
              {
                icon: <PieChart size={28} className="text-neon-yellow" />,
                title: 'Fractional Ownership',
                description: 'Enable multiple investors to own asset portions'
              },
              {
                icon: <ShieldCheck size={28} className="text-neon-yellow" />,
                title: 'Secure & Transparent',
                description: 'Immutable blockchain records ensure trust'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-4 sm:p-5 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="mb-3 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="heading-sm mb-2 text-white">{feature.title}</h3>
                <p className="body-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg mb-3">Why Choose <span className="text-neon-yellow">Our Platform</span></h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Experience the advantages of next-generation asset tokenization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                title: 'Instant Liquidity',
                description: 'Convert illiquid assets into tradeable tokens, enabling 24/7 global market access and instant settlement.',
                icon: <Zap size={32} className="text-neon-yellow" />
              },
              {
                title: 'Lower Barriers to Entry',
                description: 'Fractional ownership allows investors to participate in high-value assets with smaller capital requirements.',
                icon: <PieChart size={32} className="text-neon-yellow" />
              },
              {
                title: 'Global Accessibility',
                description: 'Reach investors worldwide without geographical restrictions or traditional banking intermediaries.',
                icon: <Link2 size={32} className="text-neon-yellow" />
              },
              {
                title: 'Automated Compliance',
                description: 'Smart contracts ensure regulatory compliance and automate distribution of dividends and voting rights.',
                icon: <ShieldCheck size={32} className="text-neon-yellow" />
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="glass-card p-6 sm:p-8 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 transform group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="heading-sm mb-2 text-white">{benefit.title}</h3>
                    <p className="body-sm text-white/70">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-transparent via-dark-surface/50 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="heading-lg mb-3">How <span className="text-neon-yellow">It Works</span></h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Four simple steps to tokenize your assets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                number: '01',
                icon: <CloudUpload size={32} className="text-neon-yellow" />,
                title: 'Upload Asset',
                description: 'Submit documents for analysis'
              },
              {
                number: '02',
                icon: <Search size={32} className="text-neon-yellow" />,
                title: 'AI Analysis',
                description: 'ML model scores your asset'
              },
              {
                number: '03',
                icon: <Rocket size={32} className="text-neon-yellow" />,
                title: 'Deploy Contract',
                description: 'One-click blockchain deployment'
              },
              {
                number: '04',
                icon: <Coins size={32} className="text-neon-yellow" />,
                title: 'Create Tokens',
                description: 'Mint fractional ownership tokens'
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-neon-yellow/50 to-transparent"></div>
                )}
                
                <div className="glass-card p-4 sm:p-5 text-center hover:bg-white/5 transition-all duration-300">
                  <div className="text-4xl sm:text-5xl font-bold text-white/5 mb-3">{step.number}</div>
                  <div className="flex justify-center mb-3">
                    {step.icon}
                  </div>
                  <h3 className="heading-sm mb-2 text-white">{step.title}</h3>
                  <p className="body-sm text-white/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg mb-3"><span className="text-neon-yellow">Real-World</span> Applications</h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Discover how tokenization transforms various asset classes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                title: 'Real Estate',
                description: 'Tokenize commercial and residential properties, enabling fractional ownership and easier property trading.',
                icon: '🏢',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              },
              {
                title: 'Fine Art & Collectibles',
                description: 'Make high-value art accessible to more investors while maintaining provenance and authenticity.',
                icon: '🎨',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              },
              {
                title: 'Commodities',
                description: 'Trade gold, silver, and other precious metals with blockchain-verified authenticity and ownership.',
                icon: '💎',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              },
              {
                title: 'Intellectual Property',
                description: 'Monetize patents, copyrights, and trademarks through fractional ownership and revenue sharing.',
                icon: '📚',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              },
              {
                title: 'Private Equity',
                description: 'Democratize access to startup investments and venture capital opportunities.',
                icon: '🚀',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              },
              {
                title: 'Luxury Assets',
                description: 'Tokenize high-end watches, cars, and other luxury items for shared ownership and investment.',
                icon: '⌚',
                color: 'from-neon-yellow/20 to-neon-yellow/10'
              }
            ].map((useCase, index) => (
              <div 
                key={index}
                className="glass-card p-5 sm:p-6 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${useCase.color} rounded-xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                  {useCase.icon}
                </div>
                <h3 className="heading-sm mb-2 text-white">{useCase.title}</h3>
                <p className="body-sm text-white/70">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-dark-surface/30 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="heading-lg">Trusted by <span className="text-neon-yellow">Innovators</span></h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: assetsCount, label: 'Assets Tokenized', suffix: '' },
              { value: tvlCount, label: 'Value Locked', suffix: 'M' },
              { value: usersCount, label: 'Active Users', suffix: '' },
              { value: contractsCount, label: 'Contracts', suffix: '' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-neon-yellow mb-1 sm:mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatNumber(stat.value)}{stat.suffix}
                </div>
                <div className="body-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg mb-3"><span className="text-neon-yellow">Enterprise-Grade</span> Security</h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Your assets are protected by industry-leading security measures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                title: 'Smart Contract Audits',
                description: 'All contracts are thoroughly audited by leading blockchain security firms before deployment.',
                icon: <ShieldCheck size={28} className="text-neon-yellow" />
              },
              {
                title: 'Multi-Signature Wallets',
                description: 'Critical operations require multiple approvals, preventing unauthorized access.',
                icon: <ShieldCheck size={28} className="text-neon-yellow" />
              },
              {
                title: 'Regulatory Compliance',
                description: 'Built-in KYC/AML procedures ensure compliance with global financial regulations.',
                icon: <ShieldCheck size={28} className="text-neon-yellow" />
              }
            ].map((security, index) => (
              <div 
                key={index}
                className="glass-card p-6 text-center hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  {security.icon}
                </div>
                <h3 className="heading-sm mb-2 text-white">{security.title}</h3>
                <p className="body-sm text-white/70">{security.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-transparent via-dark-surface/50 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="heading-lg mb-3">Built on <span className="text-neon-yellow">Cutting-Edge</span> Technology</h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Leveraging the best tools in blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                name: 'Mantle Network',
                description: 'Layer-2 scaling solution',
                icon: <Link2 size={22} />,
                color: 'text-neon-yellow'
              },
              {
                name: 'AI/ML Scoring',
                description: 'Advanced valuation algorithms',
                icon: <BrainCircuit size={22} />,
                color: 'text-neon-yellow'
              },
              {
                name: 'Smart Contracts',
                description: 'Audited contract templates',
                icon: <ShieldCheck size={22} />,
                color: 'text-neon-yellow'
              },
              {
                name: 'IPFS Storage',
                description: 'Decentralized metadata storage',
                icon: <Zap size={22} />,
                color: 'text-neon-yellow'
              }
            ].map((tech, index) => (
              <div 
                key={index}
                className="glass-card p-4 sm:p-5 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-neon-yellow/20 to-neon-yellow/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-neon-yellow/20">
                  <div className={tech.color}>{tech.icon}</div>
                </div>
                <h3 className="heading-sm mb-1.5 text-white">{tech.name}</h3>
                <p className="body-sm text-white/70">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg mb-3">Trusted by <span className="text-neon-yellow">Industry Leaders</span></h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              See what our users are saying about the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                quote: "This platform has revolutionized how we approach real estate investment. The fractional ownership model opened up opportunities we never thought possible.",
                author: "Sarah Chen",
                role: "Real Estate Investor",
                avatar: "https://i.pravatar.cc/100?u=sarah"
              },
              {
                quote: "The AI-powered scoring system gives us confidence in asset valuations. It's transparent, fast, and incredibly accurate.",
                author: "Michael Rodriguez",
                role: "Fund Manager",
                avatar: "https://i.pravatar.cc/100?u=michael"
              },
              {
                quote: "As an artist, tokenizing my work has allowed me to reach a global audience and maintain control over my intellectual property.",
                author: "Emma Thompson",
                role: "Digital Artist",
                avatar: "https://i.pravatar.cc/100?u=emma"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="glass-card p-6 hover:bg-white/5 transition-all duration-300"
              >
                <p className="body-sm text-white/80 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{testimonial.author}</div>
                    <div className="text-xs text-white/60">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-dark-surface/30 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="heading-lg mb-3"><span className="text-neon-yellow">Frequently Asked</span> Questions</h2>
            <p className="body-base text-white/70 max-w-2xl mx-auto px-2">
              Everything you need to know about asset tokenization
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "What is asset tokenization?",
                answer: "Asset tokenization is the process of converting ownership rights of a real-world asset into digital tokens on a blockchain. These tokens represent fractional ownership and can be traded, transferred, or held just like traditional securities."
              },
              {
                question: "How does the AI scoring system work?",
                answer: "Our AI analyzes multiple data points including market trends, asset condition, location data, and historical performance to generate an accurate valuation score. The system is continuously trained on new data to improve accuracy."
              },
              {
                question: "Is my investment secure?",
                answer: "Yes. All smart contracts are audited by leading security firms, and we implement multi-signature wallets and industry-standard security protocols. Your assets are stored on the blockchain, ensuring transparency and immutability."
              },
              {
                question: "What are the fees involved?",
                answer: "We charge a small platform fee for tokenization services and smart contract deployment. Transaction fees on the Mantle Network are minimal compared to traditional blockchain networks, making it cost-effective for all users."
              },
              {
                question: "Can I sell my tokens anytime?",
                answer: "Yes, tokens can be traded on supported exchanges or peer-to-peer. The blockchain ensures 24/7 liquidity and instant settlement, unlike traditional asset markets with limited trading hours."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="glass-card p-5 sm:p-6 hover:bg-white/5 transition-all duration-300"
              >
                <h3 className="heading-sm mb-2 text-white"><span className="text-neon-yellow">Q:</span> {faq.question}</h3>
                <p className="body-sm text-white/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden border border-neon-yellow/20">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/10 to-neon-yellow/5"></div>
            
            <div className="relative z-10">
              <h2 className="heading-lg mb-3 text-white">Ready to <span className="text-neon-yellow">Tokenize</span> Your Assets?</h2>
              <p className="body-base text-white/70 mb-6 max-w-xl mx-auto px-2">
                Join the <span className="text-neon-yellow">future</span> of asset ownership. Start tokenizing in minutes.
              </p>

              <div className="flex justify-center">
                <button 
                  onClick={onLaunchApp}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-neon-yellow/90 to-neon-yellow rounded-lg text-sm sm:text-base font-bold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-neon-yellow/50 flex items-center gap-2 justify-center group text-deep-space border-2 border-neon-yellow/30"
                >
                  Get Started Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle-border py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Product</h4>
              <ul className="space-y-1.5">
                <li><a href="#features" className="text-xs text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-xs text-white/70 hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Resources</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Community</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><Github size={14} /> GitHub</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><Twitter size={14} /> Twitter</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Telegram</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Legal</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-xs text-white/70 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-subtle-border pt-6 flex flex-col md:flex-row justify-center items-center gap-2">
            <div className="text-xs text-white/50">
              © 2024 RWA Tokenization Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;