
import React, { useState, useEffect, useRef } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MusicPlayerProps {
  url?: string;
  autoPlay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ url, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => console.log("Playback failed:", err));
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log("Autoplay blocked or error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!url) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex items-center gap-3">
      <audio 
        ref={audioRef} 
        src={url} 
        loop 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div 
        className="relative flex items-center"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-full ml-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-stone-100 flex items-center gap-4 whitespace-nowrap"
            >
              <button 
                onClick={toggleMute}
                className="text-[#008080] hover:text-[#B76E79] transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="h-4 w-px bg-stone-200"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#008080]">
                {isPlaying ? 'Now Playing' : 'Music Paused'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-2 ${
            isPlaying 
              ? 'bg-[#008080] border-[#008080] text-white animate-pulse' 
              : 'bg-white border-stone-100 text-[#008080] hover:border-[#B76E79] hover:text-[#B76E79]'
          }`}
        >
          {isPlaying ? (
            <Pause size={20} className="fill-current" />
          ) : (
            <Play size={20} className="fill-current ml-1" />
          )}
          
          {/* Animated rings when playing */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-[#008080] animate-ping opacity-20"></div>
              <div className="absolute -inset-2 rounded-full border border-[#008080] animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
