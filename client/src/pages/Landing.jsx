import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Camera, Leaf, Recycle, RotateCcw, MapPin, Trophy, Target, BarChart3, History } from 'lucide-react';

// 3R Principles
const principles = [
  {
    prefix: 'Re',
    title: 'USE',
    icon: RotateCcw,
    description: 'Give items a second life before disposal',
  },
  {
    prefix: 'Re',
    title: 'DUCE',
    icon: Leaf,
    description: 'Minimize waste generation at source',
  },
  {
    prefix: 'Re',
    title: 'CYCLE',
    icon: Recycle,
    description: 'Transform waste into new resources',
  },
];

// Feature pills for Main Features section
const featurePills = [
  { name: 'AI-Powered Scanning', to: '/scan', position: 'top-[8%] right-[12%]', connector: 'left' },
  { name: 'Leaderboard', to: '/leaderboard', position: 'top-[32%] left-[5%] sm:left-[8%]', connector: 'right' },
  { name: 'Find Centers', to: '/find', position: 'top-[45%] right-[5%] sm:right-[8%]', connector: 'left' },
  { name: 'Challenges', to: '/challenges', position: 'bottom-[22%] left-[8%] sm:left-[12%]', connector: 'right' },
  { name: 'Gamification', to: '/stats', position: 'bottom-[18%] right-[8%] sm:right-[12%]', connector: 'left' },
];

// Hook for scroll animations
function useScrollAnimation() {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return ref;
}

// Typewriter hook
function useTypewriter(text, trigger, speed = 80) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, trigger, speed]);

  return { displayText, isComplete };
}

// Hook for staggered animations
function useStaggeredAnimation(itemCount, delay = 200) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            setTriggered(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (triggered) {
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
      }
    }
  }, [triggered, itemCount, delay]);

  return { ref, visibleItems, triggered };
}

export default function Landing() {
  const section1Ref = useScrollAnimation();
  const section2Ref = useScrollAnimation();
  const section3Ref = useScrollAnimation();
  const section4Ref = useScrollAnimation();

  // Staggered animations for cards
  const { ref: cardsRef, visibleItems: visibleCards, triggered: cardsTriggered } = useStaggeredAnimation(3, 300);
  
  // Staggered animations for feature pills
  const { ref: featuresRef, visibleItems: visibleFeatures, triggered: featuresTriggered } = useStaggeredAnimation(5, 250);
  
  // Typewriter for "Main Features" heading
  const { displayText: mainFeaturesText, isComplete: mainFeaturesComplete } = useTypewriter('Main Features', featuresTriggered, 100);
  
  // Typewriter for "3 steps. That's it." heading
  const [stepsTriggered, setStepsTriggered] = useState(false);
  const stepsHeadingRef = useRef(null);
  const { displayText: stepsText, isComplete: stepsComplete } = useTypewriter("3 steps. That's it.", stepsTriggered, 80);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStepsTriggered(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (stepsHeadingRef.current) {
      observer.observe(stepsHeadingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[100vh] min-h-[100dvh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source
              src="https://res.cloudinary.com/dlhf6g1t4/video/upload/v1770767837/VIDEO-2026-02-11-05-26-35_ynjp19.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f1a]/70 via-[#0a1f1a]/50 to-[#0a1f1a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-transparent" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 py-8 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9]">
              <span className="text-white">Know your</span>
              <br />
              <span className="text-emerald-400">waste.</span>
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl text-white/70 max-w-md mx-auto font-light">
              Snap a photo. Get instant classification. <br className="hidden sm:block" />
              Dispose responsibly.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/scan"
                className="group flex items-center gap-3 px-6 py-4 bg-emerald-500 rounded-full font-medium text-black hover:bg-emerald-400 transition-all duration-200 press-effect pulse-ring"
              >
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="pr-2">Scan Now</span>
              </Link>
              <Link
                to="/find"
                className="flex items-center gap-2 px-6 py-4 text-white/80 hover:text-white transition-colors font-medium press-effect"
              >
                <MapPin className="w-5 h-5" />
                Find drop-off points
              </Link>
            </div>

            <div className="mt-16 flex items-center justify-center gap-6 sm:gap-10 text-center">
              <div className="text-white text-base sm:text-lg font-semibold">AI Powered</div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="text-white text-base sm:text-lg font-semibold">Instant Results</div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="text-white text-base sm:text-lg font-semibold">100% Free</div>
            </div>
          </div>

        </div>
      </section>

      <section ref={section1Ref} className="relative py-20 border-t border-white/5 scroll-section">
        <div ref={cardsRef} className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              The <span className="text-emerald-400">3R</span> Approach
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
              Our core principles for sustainable waste management
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {principles.map((item, index) => (
              <div
                key={item.title}
                className={`group p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-emerald-500/20 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer card-animate ${visibleCards.includes(index) ? 'animate-visible' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  <span className="text-emerald-400">{item.prefix}</span>
                  <span className="text-white">{item.title}</span>
                </h3>

                <p className="text-white/50 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={section2Ref} className="relative py-24 scroll-section overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white inline-flex items-center gap-3">
            <span className="text-emerald-400 text-xl">✦</span>
            {mainFeaturesText}
            {!mainFeaturesComplete && <span className="typewriter-cursor bg-emerald-400" />}
          </h2>
        </div>

        <div ref={featuresRef} className="relative mx-auto max-w-4xl px-4 min-h-[480px] flex items-center justify-center">
          
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-72 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400 rounded-[60px] shadow-[0_0_80px_20px_rgba(52,211,153,0.4)] cross-glow" />
            
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-72 h-28 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-[60px] shadow-[0_0_80px_20px_rgba(52,211,153,0.3)] cross-glow" />
            
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400 rounded-full blur-2xl opacity-60" />
          </div>

          <span className="absolute top-[10%] right-[25%] text-emerald-400 text-lg">✦</span>
          <span className="absolute top-[40%] right-[15%] text-emerald-400 text-sm">✦</span>
          <span className="absolute bottom-[35%] left-[22%] text-emerald-400 text-xs">✦</span>
          <span className="absolute bottom-[25%] right-[28%] text-emerald-400 text-sm">✦</span>

          <div className={`absolute top-[8%] right-[12%] flex items-center feature-pill ${visibleFeatures.includes(0) ? 'animate-visible' : ''}`} style={{ animationDelay: '0ms' }}>
            <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-emerald-500/60 to-transparent mr-2" />
            <Link 
              to="/scan" 
              className="px-6 py-4 bg-[#1a3d2e] hover:bg-[#234d3a] rounded-full border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white/90 font-medium text-sm whitespace-nowrap">AI-Powered Scanning</span>
            </Link>
          </div>

          <div className={`absolute top-[32%] left-[5%] sm:left-[8%] flex items-center feature-pill ${visibleFeatures.includes(1) ? 'animate-visible' : ''}`} style={{ animationDelay: '100ms' }}>
            <Link 
              to="/leaderboard" 
              className="px-6 py-4 bg-[#1a3d2e] hover:bg-[#234d3a] rounded-full border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white/90 font-medium text-sm whitespace-nowrap">Leaderboard</span>
            </Link>
            <div className="hidden sm:block w-20 h-0.5 bg-gradient-to-l from-emerald-500/60 to-transparent ml-2" />
          </div>

          <div className={`absolute top-[45%] right-[5%] sm:right-[8%] flex items-center feature-pill ${visibleFeatures.includes(2) ? 'animate-visible' : ''}`} style={{ animationDelay: '200ms' }}>
            <div className="hidden sm:block w-20 h-0.5 bg-gradient-to-r from-emerald-500/60 to-transparent mr-2" />
            <Link 
              to="/find" 
              className="px-6 py-4 bg-[#1a3d2e] hover:bg-[#234d3a] rounded-full border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white/90 font-medium text-sm whitespace-nowrap">Find Centers</span>
            </Link>
          </div>

          <div className={`absolute bottom-[22%] left-[8%] sm:left-[12%] flex items-center feature-pill ${visibleFeatures.includes(3) ? 'animate-visible' : ''}`} style={{ animationDelay: '300ms' }}>
            <Link 
              to="/challenges" 
              className="px-6 py-4 bg-[#1a3d2e] hover:bg-[#234d3a] rounded-full border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white/90 font-medium text-sm whitespace-nowrap">Challenges</span>
            </Link>
            <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-l from-emerald-500/60 to-transparent ml-2" />
          </div>

          <div className={`absolute bottom-[18%] right-[8%] sm:right-[12%] flex items-center feature-pill ${visibleFeatures.includes(4) ? 'animate-visible' : ''}`} style={{ animationDelay: '400ms' }}>
            <div className="hidden sm:block w-16 h-0.5 bg-gradient-to-r from-emerald-500/60 to-transparent mr-2" />
            <Link 
              to="/stats" 
              className="px-6 py-4 bg-[#1a3d2e] hover:bg-[#234d3a] rounded-full border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white/90 font-medium text-sm whitespace-nowrap">Gamification</span>
            </Link>
          </div>

          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2">
            <div className="w-10 h-12 bg-[#4a6b5a] rounded-t-lg rounded-b-xl border-2 border-[#5a7b6a] flex items-center justify-center">
              <div className="w-6 h-1 bg-[#5a7b6a] rounded absolute top-1" />
            </div>
          </div>
          
        </div>
      </section>

      <section ref={section3Ref} className="relative py-20 scroll-section">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 ref={stepsHeadingRef} className="text-3xl sm:text-4xl font-bold text-white mb-16 text-center">
            {stepsText}
            {!stepsComplete && stepsTriggered && <span className="typewriter-cursor bg-white ml-1" />}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { num: '01', title: 'Scan', desc: 'Point your camera at any waste item' },
              { num: '02', title: 'Learn', desc: 'AI tells you wet, dry, or hazardous' },
              { num: '03', title: 'Act', desc: 'Find where to dispose it properly' },
            ].map((item, index) => (
              <div 
                key={item.num} 
                className={`text-center sm:text-left group cursor-pointer transition-all duration-300 hover:scale-105 p-4 rounded-xl hover:bg-white/[0.03] card-animate ${stepsTriggered ? 'animate-visible' : ''}`}
                style={{ animationDelay: `${index * 200 + 400}ms` }}
              >
                <div className="text-5xl sm:text-6xl font-bold text-emerald-500/20 mb-4 transition-colors duration-300 group-hover:text-emerald-500/40">{item.num}</div>
                <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={section4Ref} className="relative py-20 scroll-section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to make <br className="sm:hidden" />
            <span className="text-emerald-400">an impact</span>?
          </h2>
          <p className="text-white/60 max-w-md mx-auto mb-10">
            Start scanning your waste today and become part of the solution.
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-emerald-400 hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/30 press-effect"
          >
            <Camera className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="relative py-8 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Leaf className="h-4 w-4 text-emerald-500" />
            WasteSeg AI — Built for a sustainable future
          </div>
        </div>
      </footer>
    </div>
  );
}
