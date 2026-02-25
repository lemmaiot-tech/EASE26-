
import React, { useState, useEffect } from 'react';
import { RSVPData } from '../types';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Heart } from 'lucide-react';

interface RSVPFormProps {
  deadline: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ deadline }) => {
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    email: '',
    attending: 'yes',
    guests: 1,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const submitted = localStorage.getItem('ease_rsvp_submitted');
    if (submitted === 'true') {
      setHasSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('RSVP is currently unavailable. Please try again later.');
      return;
    }
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('EASE-rsvp')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          attending: formData.attending,
          guests: formData.guests,
          message: formData.message
        }
      ]);

    if (error) {
      console.error('Supabase RSVP Submission Error:', error);
      alert(`Failed to submit RSVP: ${error.message || 'Unknown error'}. Please check your database connection.`);
    } else {
      setShowSuccess(true);
      setHasSubmitted(true);
      localStorage.setItem('ease_rsvp_submitted', 'true');
      setFormData({
        name: '',
        email: '',
        attending: 'yes',
        guests: 1,
        message: '',
      });
      // We don't hide success immediately if we want them to see the thank you message
    }
    setIsSubmitting(false);
  };

  if (hasSubmitted && !showSuccess) {
    return (
      <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/20 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-[#B76E79]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B76E79]/30">
          <Heart className="text-[#B76E79] fill-[#B76E79]/20" size={40} />
        </div>
        <h2 className="text-4xl font-serif-elegant text-white">Thank You!</h2>
        <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
          Your RSVP has been received. We are so excited to celebrate our special day with you!
        </p>
        <div className="pt-8">
          <div className="inline-block px-6 py-2 rounded-full border border-[#B76E79] text-[#B76E79] text-xs uppercase tracking-widest font-bold">
            #EASE'26
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* The Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-sm shadow-2xl border border-white/10 space-y-6 relative overflow-hidden">
        {showSuccess && (
          <div className="absolute inset-0 z-20 bg-[#008080]/95 flex flex-col items-center justify-center animate-fade-in text-center p-6">
             <div className="w-16 h-16 border-2 border-[#B76E79] rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-[#B76E79]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h3 className="text-2xl font-serif-elegant text-white mb-2">Thank You!</h3>
             <p className="text-white/70">Your RSVP and message have been recorded.</p>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif-elegant text-white mb-2">Join Our Celebration</h2>
          <p className="text-[#B76E79] italic text-sm">Kindly respond by June 25th, 2026</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-white/50">Your Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] transition-all outline-none placeholder-white/20"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-white/50">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] transition-all outline-none placeholder-white/20"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-white/50">Will you attend?</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-[#B76E79] outline-none appearance-none"
                value={formData.attending}
                onChange={e => setFormData({...formData, attending: e.target.value as 'yes' | 'no'})}
              >
                <option value="yes" className="bg-[#008080] text-white">Yes, with pleasure</option>
                <option value="no" className="bg-[#008080] text-white">No, sadly I cannot</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-semibold text-white/50">Number of Guests</label>
            <input 
              type="number" 
              min="1" 
              max="5"
              className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-[#B76E79] outline-none placeholder-white/20"
              value={formData.guests}
              onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-semibold text-white/50">A Message for the Couple (Sign Guest Book)</label>
          <textarea 
            rows={3} 
            className="w-full px-4 py-3 rounded-none bg-white/5 border border-white/10 text-white focus:ring-1 focus:ring-[#B76E79] outline-none resize-none placeholder-white/20"
            placeholder="Share your wishes... (This will appear in our Guest Book)"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#B76E79] text-white py-4 rounded-sm font-bold tracking-widest uppercase hover:bg-[#a05d68] active:scale-95 transition-all shadow-lg"
        >
          {isSubmitting ? 'Sending...' : 'Send RSVP & Sign Guest Book'}
        </button>
      </form>
    </div>
  );
};

export default RSVPForm;
