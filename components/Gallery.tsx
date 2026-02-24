
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
    <>
      <div 
        className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] rounded-sm overflow-hidden shadow-2xl group cursor-pointer"
        onClick={() => setIsFullscreen(true)}
      >
        {/* Images */}
        {images.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt={`Gallery slide ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          </div>
        ))}

        {/* Overlay Icon for Fullscreen hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-full border border-white/20 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </div>
        </div>

        {/* Navigation Arrows (Inline) */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10" onClick={(e) => e.stopPropagation()}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-[#B76E79] w-6' : 'bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
            className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in touch-none" 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          
          {/* Controls - Floating for mobile aesthetic */}
          <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={() => setIsFullscreen(false)} 
                    className="bg-black/50 text-white p-3 rounded-full backdrop-blur-md border border-white/10 active:bg-white/20 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
          </div>

          <div className="absolute top-4 left-6 z-50 text-white/80 font-serif-elegant tracking-widest text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
             {currentIndex + 1} / {images.length}
          </div>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative w-full h-full">
             <img 
               src={images[currentIndex]} 
               alt={`Full screen slide ${currentIndex + 1}`}
               className="max-w-full max-h-full object-contain select-none"
               draggable={false}
             />

             {/* Arrows - Hidden on mobile/touch devices, shown on desktop */}
             <button 
               onClick={(e) => { e.stopPropagation(); prevSlide(); }}
               className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 transition-colors hover:bg-white/10 rounded-full"
             >
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7"></path></svg>
             </button>

             <button 
               onClick={(e) => { e.stopPropagation(); nextSlide(); }}
               className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 transition-colors hover:bg-white/10 rounded-full"
             >
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7"></path></svg>
             </button>
          </div>

          {/* Bottom Thumbnails - Hide on mobile to give more space to image */}
          <div className="hidden md:flex h-20 w-full justify-center items-center gap-2 pb-4 px-4 overflow-x-auto z-20 bg-gradient-to-t from-black/80 to-transparent">
             {images.map((img, index) => (
                <button 
                   key={index}
                   onClick={() => goToSlide(index)}
                   className={`shrink-0 w-12 h-12 rounded-sm overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-[#B76E79] opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                   <img src={img} className="w-full h-full object-cover" />
                </button>
             ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
