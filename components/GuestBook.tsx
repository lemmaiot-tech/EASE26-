
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const GuestBook: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('EASE-rsvp')
        .select('id, name, message, created_at')
        .not('message', 'is', null)
        .neq('message', '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setWishes(data);
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif-elegant text-[#008080]">Wishes & Blessings</h3>
          <div className="bg-[#B76E79]/10 text-[#B76E79] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {wishes.length} {wishes.length === 1 ? 'Wish' : 'Wishes'}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-300">
            <div className="w-8 h-8 border-2 border-[#008080] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs uppercase tracking-widest font-bold">Loading wishes...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            <Heart size={40} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 italic">Be the first to share a blessing via the RSVP form!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence initial={false}>
              {wishes.map((wish, index) => (
                <motion.div 
                  key={wish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-stone-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#B76E79]/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-[#B76E79]/10"></div>
                  
                  <div className="mb-6 relative">
                    <div className="w-12 h-12 bg-[#008080]/10 rounded-full flex items-center justify-center text-[#008080] mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare size={20} />
                    </div>
                    <div className="absolute top-0 right-0 text-4xl text-[#B76E79]/20 font-serif-elegant">"</div>
                  </div>

                  <p className="text-stone-700 italic leading-relaxed mb-8 font-serif-elegant text-lg flex-grow relative z-10">
                    {wish.message}
                  </p>

                  <div className="flex flex-col border-t border-stone-100 pt-6 mt-auto">
                    <span className="text-base font-bold text-[#008080] uppercase tracking-widest mb-1">{wish.name}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
                        {new Date(wish.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <Heart size={12} className="text-[#B76E79] fill-[#B76E79]/20" />
                    </div>
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#008080] to-[#B76E79] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdfaf5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #008080;
        }
      `}</style>
    </div>
  );
};

export default GuestBook;
