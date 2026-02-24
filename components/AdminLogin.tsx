import React, { useState, useEffect } from 'react';
import { Lock, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const HARDCODED_PASSWORD = '@Ease26';

    if (password === HARDCODED_PASSWORD) {
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002626]/95 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100 animate-slide-up">
        <div className="bg-[#008080] p-8 text-center relative">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-serif-elegant text-white">Admin Access</h2>
          <p className="text-white/60 text-sm mt-1">Enter password to manage wedding details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#008080] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-[#008080] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#006666] active:scale-95 transition-all shadow-lg"
          >
            Login
          </button>
          
          <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest">
            Click hashtag 5 times to return
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
