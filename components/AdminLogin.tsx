import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await resp.json();
      if (resp.ok && data.success) {
        onLogin();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
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
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Password</label>
            <input 
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#008080] outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#008080] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#006666] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div>
            ) : "Login"}
          </button>
          
          <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest">
            Authorized personnel only
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
