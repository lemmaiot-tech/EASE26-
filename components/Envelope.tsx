
import React, { useState } from 'react';

interface EnvelopeProps {
  onOpen: () => void;
}

const Envelope: React.FC<EnvelopeProps> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(onOpen, 2000); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002626] overflow-hidden">
      {/* Background Ambience - Dark luxurious surface */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#004d4d_0%,_#002626_100%)]"></div>
      
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

      <div 
        className={`relative w-[min(90vw,350px)] h-[min(65vh,500px)] transition-all duration-[1.5s] ease-in-out transform cursor-pointer group ${isOpening ? 'scale-[3] opacity-0 translate-y-32' : 'scale-100 hover:scale-[1.02]'}`}
        onClick={handleOpen}
      >
        {/* Envelope Body (Main Container) */}
        <div className="absolute inset-0 bg-[#004d4d] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-md overflow-hidden flex flex-col">
           {/* Paper Texture */}
           <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
           
           {/* Subtle gradient for depth */}
           <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
        </div>

        {/* The Flap - Triangle pointing down */}
        <div 
           className={`absolute top-0 left-0 w-full h-[55%] bg-[#006666] origin-top transition-all duration-[1.2s] ease-in-out z-20 shadow-lg ${isOpening ? 'rotate-x-180' : ''}`}
           style={{ 
             clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
             transformStyle: 'preserve-3d',
           }}
        >
           <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
           {/* Flap highlighting */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10"></div>
        </div>

        {/* Decorative Elements Group */}
        <div className={`absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-700 ${isOpening ? 'opacity-0 scale-90 blur-sm' : 'opacity-100'}`}>
           
           {/* Rose Gold Strings - Horizontal */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,350px)] h-32 flex flex-col justify-center gap-1.5 pointer-events-none">
              <div className="w-full h-[1px] bg-[#B76E79] shadow-[0_1px_2px_rgba(0,0,0,0.3)] opacity-90"></div>
              <div className="w-full h-[1px] bg-[#B76E79] shadow-[0_1px_2px_rgba(0,0,0,0.3)] opacity-90"></div>
              <div className="w-full h-[1px] bg-[#B76E79] shadow-[0_1px_2px_rgba(0,0,0,0.3)] opacity-90"></div>
           </div>

           {/* Dried Flowers SVG Illustration */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 -rotate-12 pointer-events-none" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Stems */}
                <path d="M100 100 Q 120 60 140 40" stroke="#8B5A2B" strokeWidth="1" fill="none" />
                <path d="M100 100 Q 80 50 60 40" stroke="#8B5A2B" strokeWidth="1" fill="none" />
                <path d="M100 100 Q 100 50 100 30" stroke="#8B5A2B" strokeWidth="1" fill="none" />
                
                {/* Bunny Tails */}
                <ellipse cx="140" cy="40" rx="6" ry="15" fill="#B76E79" transform="rotate(15 140 40)" opacity="0.8" />
                <ellipse cx="60" cy="40" rx="6" ry="15" fill="#B76E79" transform="rotate(-15 60 40)" opacity="0.8" />
                <ellipse cx="100" cy="30" rx="7" ry="18" fill="#B76E79" />

                {/* Baby's breath small dots */}
                <circle cx="80" cy="80" r="2" fill="#008080" />
                <circle cx="120" cy="85" r="2" fill="#008080" />
                <circle cx="90" cy="60" r="1.5" fill="#008080" />
              </svg>
           </div>

           {/* The Wax Seal */}
           <div className="relative w-24 h-24 shadow-2xl rounded-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              {/* Wax irregular shape - Rose Gold */}
              <div className="absolute inset-0 bg-[#B76E79] rounded-full" style={{ borderRadius: '45% 55% 48% 52% / 55% 45% 50% 50%', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.4), 0 5px 10px rgba(0,0,0,0.3)' }}></div>
              <div className="absolute inset-1 border-[3px] border-[#a05d68] rounded-full opacity-60" style={{ borderRadius: '48% 52% 55% 45% / 52% 48% 50% 50%' }}></div>
              
              {/* Seal Content */}
              <div className="relative z-10 text-center">
                 <div className="font-serif-elegant font-bold text-white text-xl leading-none tracking-tighter" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>EASE'26</div>
                 <div className="text-[6px] uppercase tracking-[0.2em] text-white/80 font-bold mt-1">Save the Date</div>
              </div>

              {/* Shine/Reflection */}
              <div className="absolute top-4 left-4 w-6 h-4 bg-white opacity-20 rounded-full rotate-45 blur-sm"></div>
           </div>
           
           <div className="mt-8 text-center animate-pulse">
              <p className="text-[#B76E79] font-light tracking-[0.3em] text-[10px] uppercase text-shadow">Tap to Open</p>
           </div>
        </div>

        {/* Content Preview (Inside the envelope) - Visible when flap opens */}
        <div className="absolute bottom-0 left-0 w-full h-[95%] bg-[#fdfaf5] z-10 transition-transform duration-1000" style={{ transform: isOpening ? 'translateY(-20px)' : 'translateY(0)' }}>
            <div className="p-8 text-center h-full flex flex-col items-center pt-24">
                <p className="font-script text-4xl text-stone-800 opacity-20">Esther & Emmanuel</p>
            </div>
        </div>

      </div>

      <style>{`
        .rotate-x-180 {
          transform: rotateX(180deg);
        }
        .text-shadow {
           text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default Envelope;
