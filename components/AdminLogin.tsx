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
  const [envStatus, setEnvStatus] = useState<'checking' | 'missing' | 'ready'>('checking');

  useEffect(() => {
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!adminPass) {
      setEnvStatus('missing');
    } else {
      setEnvStatus('ready');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (!adminPass) {
      setError('Configuration Error: VITE_ADMIN_PASSWORD is not set in your environment variables.');
      return;
    }

    if (password === adminPass) {
      onLogin();
    } else {
      setError('Incorrect password. Please verify the value of VITE_ADMIN_PASSWORD in your settings.');
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
          {envStatus === 'missing' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-1">Environment Variable Missing</p>
                <p>Please add <code className="bg-amber-100 px-1 rounded">VITE_ADMIN_PASSWORD</code> to your environment variables and restart the dev server.</p>
              </div>
            </div>
          )}

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
            className="w-full bg-[#008080] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#006666] active:scale-95 transition-all shadow-lg disabled:opacity-50"
            disabled={envStatus === 'missing'}
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
