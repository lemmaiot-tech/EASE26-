
import React, { useState, useEffect } from 'react';
import Envelope from './components/Envelope';
import Countdown from './components/Countdown';
import RSVPForm from './components/RSVPForm';
import Gallery from './components/Gallery';
import GuestBook from './components/GuestBook';
import { supabase, WeddingSettings, isSupabaseConfigured } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { AlertCircle } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

const DEFAULT_SETTINGS: WeddingSettings = {
  id: '',
  groom_name: 'Emmanuel',
  bride_name: 'Esther',
  wedding_date: '2026-07-11T10:00:00Z',
  engagement_time: '7:30 AM',
  church_service_time: '11:00 AM',
  venue_name: 'Miracles-Link Word Ministries Intl.',
  venue_address: 'Behinde Nepa\'s Quaters, Araromi, Oyo',
  reception_details: 'Location on Access Card',
  hashtag: '#EASE\'26',
  rsvp_deadline: 'June 25th, 2026',
  rsvp_phones: ['08023650289', '07018712196', '09039244218']
};

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<WeddingSettings>(DEFAULT_SETTINGS);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [footerClicks, setFooterClicks] = useState(0);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchSettings();
    }
  }, []);

  const fetchSettings = async () => {
    if (!supabase) return;
    
    const { data, error } = await supabase
      .from('EASE-settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings(data);
    }
  };

  const handleFooterClick = () => {
    const newClicks = footerClicks + 1;
    setFooterClicks(newClicks);
    if (newClicks >= 5) {
      setShowAdmin(true);
      setFooterClicks(0);
    }
  };

  if (showAdmin) {
    return (
      <ErrorBoundary>
        {!isAdminLoggedIn ? (
          <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} onCancel={() => setShowAdmin(false)} />
        ) : (
          <AdminDashboard onLogout={() => { setIsAdminLoggedIn(false); setShowAdmin(false); }} onUpdate={fetchSettings} />
        )}
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5] selection:bg-[#008080] selection:text-white" style={settings.background_image_url ? { backgroundImage: `url(${settings.background_image_url})`, backgroundAttachment: 'fixed', backgroundSize: 'cover' } : {}}>
      {!isOpen && <Envelope onOpen={() => setIsOpen(true)} />}

      <main className={`transition-all duration-1000 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 h-0 overflow-hidden'}`}>
        {/* Navigation / Header */}
        <nav className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex justify-between items-center transition-all duration-500">
          <div className="font-serif-elegant font-bold text-xl text-[#008080]">{settings.hashtag.toUpperCase()}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#B76E79]">
            {new Date(settings.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </nav>

        {!isSupabaseConfigured && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-xl flex items-start gap-3 animate-slide-up">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-amber-900 font-bold text-sm">Supabase Not Configured</h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                Please set <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your environment to enable the guest book and live updates.
              </p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 z-0">
             <img 
               src={settings.hero_image_url || "https://picsum.photos/seed/wedding-floral/1600/1200"} 
               alt="Background" 
               className="w-full h-full object-cover opacity-10"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#fdfaf5]/40 to-[#fdfaf5]"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
            <p className="text-[#008080] uppercase tracking-[0.4em] text-xs font-semibold mb-4 animate-slide-up">The Solemnization of Holy Matrimony of</p>
            <h1 className="text-6xl md:text-9xl font-serif-elegant text-[#B76E79] leading-tight drop-shadow-md">
              {settings.bride_name} <span className="font-script text-[#008080] block md:inline text-5xl md:text-7xl lowercase">&</span> {settings.groom_name}
            </h1>
            <div className="pt-10 animate-fade-in delay-700 flex flex-col items-center justify-center gap-4">
               <div className="flex items-center gap-4">
                 <span className="w-16 h-[1px] bg-[#008080]"></span>
                 <span className="text-[#008080] font-script text-4xl">{settings.hashtag}</span>
                 <span className="w-16 h-[1px] bg-[#008080]"></span>
               </div>
               <p className="text-stone-500 font-serif-elegant italic">
                 {new Date(settings.wedding_date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
               </p>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
        </section>

        {/* Families Section */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center bg-white/50 rounded-3xl my-12 shadow-sm border border-stone-100">
          <div className="space-y-12">
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#008080]">The Families of</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <p className="text-xl font-serif-elegant text-[#008080]">Pst. Isaiah & Dns. Mary Oloyede</p>
                </div>
                <div className="text-[#B76E79] font-script text-3xl">&</div>
                <div className="space-y-2">
                  <p className="text-xl font-serif-elegant text-[#008080]">Mr. Micheal & Late Mrs. Dorcas Gbolasire</p>
                </div>
              </div>
              <p className="text-stone-500 italic mt-6">request the honour of your presence</p>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="bg-[#f4f1ea] py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="relative group">
               <div className="absolute -inset-4 border border-[#008080] rounded-sm opacity-30 group-hover:rotate-2 transition-transform duration-500"></div>
               <div className="rounded-sm overflow-hidden shadow-2xl">
                 <img src="https://picsum.photos/seed/wedding-couple/800/1000" alt="Esther and Emmanuel" className="w-full h-full object-cover" />
               </div>
            </div>
            
            <div className="space-y-14 text-center md:text-left">
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#B76E79]">The Date</h3>
                <p className="text-4xl md:text-5xl font-serif-elegant text-[#008080]">
                  {new Date(settings.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-stone-500 italic font-serif-elegant text-lg">
                  {new Date(settings.wedding_date).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#B76E79]">Engagement</h3>
                  <p className="text-2xl font-serif-elegant text-[#008080]">{settings.engagement_time}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#B76E79]">Church Service</h3>
                  <p className="text-2xl font-serif-elegant text-[#008080]">{settings.church_service_time}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#B76E79]">The Venue</h3>
                <p className="text-2xl md:text-3xl font-serif-elegant text-[#008080]">{settings.venue_name}</p>
                <p className="text-stone-500">{settings.venue_address}</p>
                <a 
                  href={`https://www.google.com/maps/search/${encodeURIComponent(settings.venue_name + ' ' + settings.venue_address)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block mt-4 text-[#008080] border-b border-[#008080] pb-1 text-sm font-semibold hover:text-[#B76E79] hover:border-[#B76E79] transition-colors"
                >
                  Get Directions
                </a>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#B76E79]">Reception</h3>
                <p className="text-xl font-serif-elegant text-[#008080]">{settings.reception_details}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown */}
        <section className="py-24 px-6 bg-white border-y border-stone-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif-elegant text-[#008080]">The Countdown</h2>
            <p className="text-stone-400 mt-2 font-light uppercase tracking-widest text-xs">Until we say "I Do"</p>
          </div>
          <Countdown targetDate={settings.wedding_date} />
        </section>

        {/* Gallery Slideshow */}
        <section className="py-24 px-6 bg-[#fdfaf5]">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-serif-elegant text-[#008080]">Our Moments</h2>
             <div className="w-16 h-px bg-[#B76E79] mx-auto mt-4"></div>
          </div>
          <Gallery />
        </section>

        {/* Guest Book Section */}
        <section id="guestbook" className="py-24 px-6 bg-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif-elegant text-[#008080]">Guest Book</h2>
            <p className="text-stone-400 mt-2 font-light uppercase tracking-[0.2em] text-xs">Share your love and blessings</p>
          </div>
          <GuestBook />
        </section>

        {/* RSVP Section */}
        <section id="rsvp" className="relative py-24 px-6 bg-[#008080] text-white overflow-hidden">
           {/* Floral background decoration */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <div className="max-w-3xl mx-auto relative z-10">
              <RSVPForm deadline={settings.rsvp_deadline} />
           </div>
        </section>

        {/* Footer */}
        <footer 
          className="py-20 px-6 bg-[#004d4d] text-stone-300 text-center border-t border-white/5 cursor-default"
          onClick={handleFooterClick}
        >
          <h2 className="font-script text-5xl text-[#B76E79] mb-8">{settings.hashtag}</h2>
          <div className="space-y-6 max-w-md mx-auto">
             <p className="text-sm font-light leading-relaxed opacity-60">
               "For where your treasure is, there your heart will be also." 
               Thank you for being part of our journey.
             </p>
             <div className="pt-10 text-[10px] uppercase tracking-[0.3em] text-[#B76E79]">
               With Love, {settings.bride_name} & {settings.groom_name}
             </div>
             <div className="pt-4 text-[10px] text-stone-500">
               RSVP: {settings.rsvp_phones.join(' | ')}
             </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
};

export default App;
