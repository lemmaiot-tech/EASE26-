
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_IMAGES = [
  "https://picsum.photos/seed/wed1/1200/800",
  "https://picsum.photos/seed/wed2/1200/800",
  "https://picsum.photos/seed/wed3/1200/800",
  "https://picsum.photos/seed/wed4/1200/800",
  "https://picsum.photos/seed/wed5/1200/800"
];

const Gallery: React.FC = () => {
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Touch handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (supabase) {
      fetchGallery();
    }
  }, []);

  const fetchGallery = async () => {
    if (!supabase) return;
    
    const { data, error } = await supabase
      .from('EASE-gallery')
      .select('url')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery:', error);
    } else if (data && data.length > 0) {
      setImages(data.map(img => img.url));
    }
  };

  // Auto-play logic (stops when fullscreen)
  useEffect(() => {
    if (isFullscreen) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isFullscreen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="space-y-12">
      <div 
        className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[700px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border-4 border-white"
        onClick={() => setIsFullscreen(true)}
      >
        {/* Images */}
        {images.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          >
            <img src={img} alt={`Gallery slide ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
        ))}

        {/* Decorative Frame Elements */}
        <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/50 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/50 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/50 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/50 rounded-br-lg pointer-events-none"></div>

        {/* Overlay Icon for Fullscreen hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-[#008080]/80 backdrop-blur-md p-6 rounded-full border border-white/20 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </div>
        </div>

        {/* Navigation Arrows (Inline) */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#008080] text-white p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-[#008080] text-white p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10" onClick={(e) => e.stopPropagation()}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-[#B76E79] w-8 shadow-[0_0_10px_rgba(183,110,121,0.5)]' : 'bg-white/40 w-3 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
            className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-xl flex flex-col animate-fade-in touch-none" 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          
          {/* Controls - Floating for mobile aesthetic */}
          <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={() => setIsFullscreen(false)} 
                    className="bg-white/10 text-white p-4 rounded-full backdrop-blur-md border border-white/10 hover:bg-[#B76E79] transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
          </div>

          <div className="absolute top-6 left-8 z-50 text-white/90 font-serif-elegant tracking-[0.3em] text-xs bg-[#008080]/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 pointer-events-none uppercase font-bold">
             {currentIndex + 1} <span className="mx-2 text-white/30">|</span> {images.length}
          </div>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-4 md:p-12">
             <img 
               src={images[currentIndex]} 
               alt={`Full screen slide ${currentIndex + 1}`}
               className="max-w-full max-h-full object-contain select-none shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg"
               draggable={false}
             />

             {/* Arrows - Hidden on mobile/touch devices, shown on desktop */}
             <button 
               onClick={(e) => { e.stopPropagation(); prevSlide(); }}
               className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-6 transition-all hover:bg-white/5 rounded-full"
             >
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7"></path></svg>
             </button>

             <button 
               onClick={(e) => { e.stopPropagation(); nextSlide(); }}
               className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-6 transition-all hover:bg-white/5 rounded-full"
             >
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7"></path></svg>
             </button>
          </div>

          {/* Bottom Thumbnails - Hide on mobile to give more space to image */}
          <div className="hidden md:flex h-24 w-full justify-center items-center gap-3 pb-8 px-8 overflow-x-auto z-20">
             {images.map((img, index) => (
                <button 
                   key={index}
                   onClick={() => goToSlide(index)}
                   className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === currentIndex ? 'border-[#B76E79] opacity-100 scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/30'}`}
                >
                   <img src={img} className="w-full h-full object-cover" />
                </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
