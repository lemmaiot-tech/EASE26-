
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Sparkles, Heart } from 'lucide-react';
import { generateBlessing } from '../services/geminiService';
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence initial={false}>
              {wishes.map((wish, index) => (
                <motion.div 
                  key={wish.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative group hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#fdfaf5] rounded-full flex items-center justify-center border border-stone-100 text-[#B76E79]">
                    <MessageSquare size={14} />
                  </div>
                  <p className="text-stone-600 italic leading-relaxed mb-6 font-serif-elegant text-lg flex-grow">
                    "{wish.message}"
                  </p>
                  <div className="flex justify-between items-center border-t border-stone-50 pt-4 mt-auto">
                    <span className="text-sm font-bold text-[#008080] uppercase tracking-wider">{wish.name}</span>
                    <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
                      {new Date(wish.created_at).toLocaleDateString()}
                    </span>
                  </div>
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
