import { Mail, MapPin, Phone, Zap, CreditCard, ShieldCheck, Users, BarChart3, Globe, ChevronRight, ClipboardCheck, UserCog } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import aboutImageUrl from '../assets/bg.jpg';
import logoUrl from '../assets/Expresslogo.png';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

const defaultSite = {
  brand_name: 'Expressnetbilling',
  headline: 'Internet billing built for hotspot businesses',
  subheadline: 'Sell packages, collect M-Pesa payments, and activate MikroTik users automatically.',
  about: 'We help hotspot operators manage customers, packages, payments, and access control from one secure platform.',
  phone: '+254 700 000 000',
  email: 'support@example.com',
  location: 'Nairobi, Kenya',
  address: 'Nairobi, Kenya',
  cta_label: 'Register your business',
  cta_url: '/register',
};

// --- ANIMATION COMPONENT ---
const RevealOnScroll = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Contact Item Component ---
const ContactItem = ({ icon: Icon, title, text }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0db5f7] text-xl shrink-0">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-slate-700 font-medium">{text}</p>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [site, setSite] = useState(defaultSite);
  const [publicStats, setPublicStats] = useState(null);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    publicApi.get('/public/site')
      .then(({ data }) => setSite(data))
      .catch(() => setSite(defaultSite));

    publicApi.get('/public/stats')
      .then(({ data }) => setPublicStats(data))
      .catch(() => setPublicStats(null));
  }, []);

  const heroSlides = [
    {
      heading: site?.headline || 'Internet billing built for hotspot businesses',
      subtext: site?.subheadline || 'Sell packages, collect M-Pesa payments, and activate MikroTik users automatically.',
    },
    {
      heading: 'Automate Your Hotspot, Grow Your Revenue',
      subtext: 'Seamless MikroTik integration with real-time user management and instant payment activation.',
    },
    {
      heading: 'One Platform for All Your Billing Needs',
      subtext: 'From package creation to payment collection and user control — everything in one place.',
    },
  ];

  // Hero Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTextVisible(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTextVisible(true);
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const features = [
    {
      title: 'Package Management',
      desc: 'Create and manage data packages with flexible pricing, durations, and bandwidth limits tailored to your customers.',
      icon: Zap,
    },
    {
      title: 'M-Pesa payments',
      desc: 'Accept secure payments via M-Pesa — mobile money, cards, and bank transfers — all seamlessly integrated.',
      icon: CreditCard,
    },
    {
      title: 'Customer Management',
      desc: 'Track customer activity, view purchase history, manage accounts, and monitor data usage in real time.',
      icon: Users,
    },
    {
      title: 'Analytics & Reports',
      desc: 'Get insights into revenue trends, peak usage hours, and customer growth with built-in dashboards.',
      icon: BarChart3,
    },
    {
      title: 'Task Management',
      desc: 'Assign, track, and close out day-to-day tasks — installations, maintenance, and support tickets — so nothing slips through the cracks.',
      icon: ClipboardCheck,
    },
    {
      title: 'Staff Management',
      desc: 'Onboard your team, set role-based permissions, and monitor staff activity across every location from one place.',
      icon: UserCog,
    },
  ];

  const formatStatValue = (value) => Number(value || 0).toLocaleString();
  const stats = [
    { value: formatStatValue(publicStats?.activeTenants), label: 'Active Hotspots' },
    { value: formatStatValue(publicStats?.totalCustomers), label: 'Customers Served' },
    { value: formatStatValue(publicStats?.activeCustomers), label: 'Active Customers' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="font-sans text-slate-600 bg-white selection:bg-[#0db5f7] selection:text-white">
      {/* --- CSS --- */}
      <style>
        {`
          html { scroll-behavior: smooth; scroll-padding-top: 100px; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(13, 181, 247, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(13, 181, 247, 0); }
            100% { box-shadow: 0 0 0 0 rgba(13, 181, 247, 0); }
          }
          .animate-pulse-glow:hover {
            animation: pulse-glow 1.5s infinite;
          }

          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20">
          <a href="#hero" className="flex items-center gap-3">
            
              <img src={logoUrl} alt={`${site.brand_name} logo`} className="h-14 w-36 object-contain object-left sm:h-16 sm:w-44" />
          
          </a>

          <div className="hidden md:flex items-center gap-4">
            <nav className="mr-6">
              <ul className="flex space-x-8">
                {['Home', 'About', 'Features', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-[#0db5f7] hover:text-slate-900 transition-colors font-medium text-sm uppercase tracking-wide relative group"
                    >
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              to={site.cta_url || '/register'}
              className="inline-flex items-center bg-[#0db5f7] hover:bg-[#0ba3e0] text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#0db5f7]/30 hover:shadow-[#0db5f7]/50 font-medium"
            >
              {site.cta_label || 'Register'}
            </Link>
          </div>

          <button
            className="md:hidden rounded-lg p-2 text-slate-800 transition hover:bg-slate-100 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-xl absolute w-full animate-fade-in-up">
            <ul className="space-y-4">
              {['Home', 'About', 'Features', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-600 hover:text-[#0db5f7] font-medium text-lg py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link to={site.cta_url || '/register'} className="block text-center bg-[#0db5f7] text-white py-3 rounded-xl font-bold shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                  {site.cta_label || 'Register'}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      <main className="pt-16 sm:pt-20">
        {/* --- HERO SECTION --- */}
        <section id="hero" className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden py-14 sm:min-h-[90vh] sm:py-20">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#061323] via-[#0b3150] to-[#07111f]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_28%,rgba(13,181,247,0.34),transparent_42%),radial-gradient(ellipse_at_84%_80%,rgba(37,99,235,0.28),transparent_38%),linear-gradient(125deg,#07111f_8%,#0d2946_58%,#07111f)]" />
            <img
              src={aboutImageUrl}
              alt=""
              className="relative h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[loaded=true]:opacity-100"
              onLoad={(event) => event.currentTarget.dataset.loaded = 'true'}
              aria-hidden="true"
            />
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/20 z-10"></div>
          </div>

          <div className="relative z-20 mx-auto w-full max-w-6xl px-5 text-left sm:px-6 lg:px-4">
            <div className="max-w-3xl">
              <div className={`transition-all duration-1000 transform ${isTextVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <p className="mb-4 inline-block border border-[#0db5f7]/30 bg-[#0db5f7]/20 px-3 py-1 text-xs font-bold tracking-wider text-[#0db5f7] sm:mb-6 sm:text-sm">
                  HOTSPOT BILLING PLATFORM
                </p>
                <h1
                  className="mb-5 text-4xl font-bold leading-[1.08] tracking-tight text-white [overflow-wrap:anywhere] sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  {heroSlides[currentSlide].heading}
                </h1>
                <p className="mb-7 max-w-2xl border-l-4 border-[#0db5f7] pl-4 text-base font-light leading-relaxed text-gray-300 sm:mb-10 sm:pl-6 sm:text-lg md:text-xl">
                  {heroSlides[currentSlide].subtext}
                </p>
              </div>

              {/* Slide Indicators */}
              <div className="mb-6 flex gap-2 sm:mb-8">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[#0db5f7] w-8' : 'bg-white/30 w-2'}`}
                    onClick={() => {
                      setIsTextVisible(false);
                      setTimeout(() => {
                        setCurrentSlide(idx);
                        setIsTextVisible(true);
                      }, 300);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  ></button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  to={site.cta_url || '/register'}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0db5f7] px-6 py-3 font-bold text-white transition-all hover:bg-[#0ba3e0] sm:px-8 sm:py-4"
                >
                  {site.cta_label || 'Register your business'}
                  <ChevronRight size={20} className="ml-2" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white bg-transparent px-6 py-3 font-bold text-white transition-all hover:bg-white hover:text-slate-900 sm:px-8 sm:py-4"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- ABOUT SECTION --- */}
        <RevealOnScroll>
          <section id="about" className="relative bg-white py-16 sm:py-24">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-10 hidden lg:block rounded-l-[100px]"></div>
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
                <div className="w-full lg:w-1/2 relative group">
                  <div className="absolute -inset-4 bg-[#0db5f7]/20 rounded-[2rem] rotate-3 transition-transform group-hover:rotate-6"></div>
                  <div className="relative z-10 h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 shadow-2xl sm:h-96 lg:h-[500px]">
                    <img
                      src={aboutImageUrl}
                      alt="Expressnetbilling platform preview"
                      className="block h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[loaded=true]:opacity-100"
                      onLoad={(event) => event.currentTarget.dataset.loaded = 'true'}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <RevealOnScroll delay={200}>
                    <h2 className="mb-5 text-3xl font-bold text-slate-900 sm:mb-6 sm:text-4xl">About Us</h2>
                    <div className="w-20 h-1.5 bg-[#0db5f7] mb-8 rounded-full"></div>
                    <p className="mb-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                      {site.about}
                    </p>
                    <p className="mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg">
                      Whether you run a single hotspot or manage dozens of locations, our platform scales with your business. Automate user activation, streamline payments, and keep your customers connected — all from one secure dashboard.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to={site.cta_url || '/register'}
                        className="inline-flex items-center bg-[#0db5f7] hover:bg-[#0ba3e0] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-[#0db5f7]/30 hover:shadow-[#0db5f7]/50"
                      >
                        Get Started <ChevronRight size={18} className="ml-2" />
                      </Link>
                    </div>
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* --- FEATURES SECTION --- */}
        <RevealOnScroll>
          <section id="features" className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="mx-auto max-w-6xl px-4 relative z-10">
              <RevealOnScroll delay={100}>
                <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
                  <span className="text-[#0db5f7] font-bold tracking-widest uppercase text-sm mb-2 block">Platform Features</span>
                  <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">Platform features to help you run and manage the hotspot</h2>
                  <p className="text-base text-slate-500 sm:text-lg">Powerful tools designed specifically for internet service providers and hotspot operators.</p>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <RevealOnScroll key={idx} delay={idx * 200 + 300}>
                      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-3xl sm:p-8 lg:p-10">
                        {/* Floating badge */}
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-[#0db5f7] transition-transform duration-300 group-hover:scale-105 sm:absolute sm:right-6 sm:top-6 sm:mb-0 sm:rounded-full sm:border-4 sm:border-slate-50 sm:bg-white">
                          <Icon size={22} />
                        </div>

                        <h3 className="mb-3 mt-1 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#0db5f7] sm:mt-2 sm:pr-12 sm:text-2xl">{feature.title}</h3>
                        <p className="text-slate-500 leading-relaxed mb-6 flex-grow">{feature.desc}</p>

                        <a href="#features" className="inline-flex items-center text-[#0db5f7] font-bold hover:gap-2 transition-all animate-pulse-glow rounded-full">
                          Learn More <ChevronRight size={16} className="ml-1" />
                        </a>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* --- HOW IT WORKS SECTION --- */}
        <RevealOnScroll>
          <section className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4">
              <RevealOnScroll delay={100}>
                <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
                  <span className="text-[#0db5f7] font-bold tracking-widest uppercase text-sm mb-2 block">How It Works</span>
                  <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">Get Started in 3 Simple Steps</h2>
                  <p className="text-base text-slate-500 sm:text-lg">From registration to activating your first customer — it only takes minutes.</p>
                </div>
              </RevealOnScroll>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
                {[
                  {
                    step: '01',
                    title: 'Register Your Business',
                    desc: 'Create your account and set up your hotspot business profile in seconds. No technical skills required.',
                  },
                  {
                    step: '02',
                    title: 'Connect Your MikroTik',
                    desc: 'Link your MikroTik router to our platform using the API. We handle the rest — from user management to access control.',
                  },
                  {
                    step: '03',
                    title: 'Start Earning',
                    desc: 'Create data packages, share your payment link, and watch your revenue grow. Payments are collected automatically via M-Pesa.',
                  },
                ].map((item, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 200 + 200}>
                    <div className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-7 text-center transition-all duration-300 hover:border-[#0db5f7] hover:bg-[#0db5f7] sm:rounded-3xl sm:p-10">
                      <span className="mb-4 inline-block text-5xl font-extrabold text-[#0db5f7] opacity-20 transition-colors group-hover:text-white sm:text-6xl">{item.step}</span>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3 transition-colors">{item.title}</h3>
                      <p className="text-slate-500 group-hover:text-white/80 leading-relaxed transition-colors">{item.desc}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>

              <RevealOnScroll delay={600}>
                <div className="text-center mt-16">
                  <Link
                    to={site.cta_url || '/register'}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0db5f7] px-7 py-3 text-base font-bold text-white transition-all hover:bg-[#0ba3e0] sm:px-10 sm:py-4 sm:text-lg"
                  >
                    {site.cta_label || 'Register your business'}
                    <ChevronRight size={22} className="ml-2" />
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </section>
        </RevealOnScroll>

        {/* --- STATS / SOCIAL PROOF BANNER --- */}
        {/* <RevealOnScroll>
          <section className="py-20 bg-gradient-to-r from-[#0f172a] to-[#0c4a6e] text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#0db5f7] rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2"></div>

            <div className="mx-auto max-w-6xl px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 100 + 100}>
                    <div>
                      <p className="text-4xl md:text-5xl font-extrabold text-[#0db5f7] mb-2">{stat.value}</p>
                      <p className="text-slate-300 font-medium text-sm uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>
        </RevealOnScroll> */}

        {/* --- CONTACT SECTION --- */}
        <RevealOnScroll>
          <section id="contact" className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

                {/* Info Column */}
                <div className="w-full space-y-8 lg:w-1/2 lg:space-y-12">
                  <RevealOnScroll delay={100}>
                    <div>
                      <span className="text-[#0db5f7] font-bold tracking-widest uppercase text-sm mb-2 block">Get In Touch</span>
                      <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h2>
                      <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
                        Have questions or need support? Reach out to us and our team will get back to you as soon as possible.
                      </p>
                    </div>
                  </RevealOnScroll>

                  <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xl sm:h-[300px] sm:rounded-3xl">
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                      <MapPin size={40} className="text-slate-300 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center z-10">
                      <div className="text-center">
                        <MapPin size={48} className="text-[#0db5f7] mx-auto mb-3" />
                        <p className="text-slate-600 font-bold text-lg">{site.location || site.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <ContactItem icon={Phone} title="Call Us" text={site.phone} />
                    <ContactItem icon={Mail} title="Email Us" text={site.email} />
                    <ContactItem icon={MapPin} title="Visit Us" text={site.location || site.address} />
                  </div>
                </div>

                {/* CTA Card Column */}
                <div className="w-full lg:w-1/2">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#0c4a6e] p-6 text-white shadow-2xl sm:rounded-3xl sm:p-8 lg:p-12">
                    {/* Decorative blurs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0db5f7] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                      <div className="mb-6 flex h-14 w-48 items-center overflow-hidden rounded-full bg-white px-4 shadow-lg shadow-black/20 sm:mb-8 sm:h-16 sm:w-56">
                        <img src={logoUrl} alt={`${site.brand_name} logo`} className="h-12 w-full object-contain object-left" />
                      </div>

                      <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Ready to Grow Your Hotspot Business?</h3>
                      <p className="mb-6 text-base leading-relaxed text-slate-300 sm:mb-8 sm:text-lg">
                        Join hundreds of hotspot operators who trust our platform to manage their billing, payments, and user activation. Get started in minutes.
                      </p>

                      <div className="mb-8 space-y-4 sm:mb-10">
                        {[
                          'Automated MikroTik user activation',
                          'Secure M-Pesa payment collection',
                          'Real-time analytics dashboard',
                          'Multi-location support',
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#0db5f7] flex items-center justify-center flex-shrink-0">
                              <ChevronRight size={14} className="text-white" />
                            </div>
                            <span className="text-slate-200">{item}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        to={site.cta_url || '/register'}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#0db5f7] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#0db5f7]/30 transition-all hover:bg-[#0ba3e0] sm:px-10 sm:py-4 sm:text-lg"
                      >
                        <span>{site.cta_label || 'Register your business'}</span>
                        <ChevronRight size={20} className="ml-2" />
                      </Link>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0f172a] pb-8 pt-14 font-sans text-slate-300 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-10 lg:mb-16 lg:grid-cols-4 lg:gap-12">
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-52 items-center overflow-hidden rounded-full bg-white px-3 shadow-sm">
                  <img src={logoUrl} alt={`${site.brand_name} logo`} className="h-10 w-full object-contain object-left" />
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                The all-in-one billing platform for hotspot operators. Manage customers, sell packages, collect payments, and control access from anywhere.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Company
                <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#0db5f7]"></span>
              </h4>
              <ul className="space-y-4">
                <li><a href="#hero" className="text-slate-400 hover:text-[#0db5f7] transition-colors">Home</a></li>
                <li><a href="#about" className="text-slate-400 hover:text-[#0db5f7] transition-colors">About</a></li>
                <li><a href="#features" className="text-slate-400 hover:text-[#0db5f7] transition-colors">Features</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-[#0db5f7] transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Features Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Features
                <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#0db5f7]"></span>
              </h4>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature.title}>
                    <a href="#features" className="text-slate-400 hover:text-[#0db5f7] transition-colors flex items-center gap-2 group">
                      {feature.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 relative inline-block">
                Contacts
                <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#0db5f7]"></span>
              </h4>

              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#0db5f7] flex-shrink-0" />
                  {site.location || site.address}
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[#0db5f7] flex-shrink-0" />
                  {site.phone}
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[#0db5f7] flex-shrink-0" />
                  {site.email}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-slate-500">
            <p>
              &copy; {new Date().getFullYear()}{' '}
              <span className="text-[#0db5f7] font-semibold">{site.brand_name}</span>. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* --- SCROLL TO TOP --- */}
      <a
        href="#hero"
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white text-xl text-[#0db5f7] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[#0db5f7]/30 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14 sm:text-2xl"
        style={{ display: 'var(--scroll-display, none)', opacity: 'var(--scroll-opacity, 0)' }}
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        ↑
      </a>
    </div>
  );
}
