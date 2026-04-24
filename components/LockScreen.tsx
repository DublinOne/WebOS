import React, { useState } from 'react';
import { User, Lock, ArrowRight, Power } from 'lucide-react';

const LockScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === '') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center flex items-center justify-center z-[900]"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop')" 
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-sm p-8 flex flex-col items-center text-white text-center">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-2xl border-2 border-white/20">
          <User size={48} />
        </div>
        
        <h1 className="text-3xl font-bold mb-1">Guest User</h1>
        <p className="text-blue-300 text-sm mb-8">System Administrator</p>
        
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:bg-white/20 focus:border-blue-500/50 transition-all text-white placeholder:text-white/40 shadow-xl backdrop-blur-sm`}
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
          >
            LOGIN <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="mt-6 text-xs text-white/40 uppercase tracking-widest font-medium italic">
          Default password is blank or "admin"
        </p>
      </div>

      <div className="absolute bottom-10 left-10 flex gap-6 text-white/60">
        <div className="text-center">
          <div className="text-4xl font-light mb-1">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          <div className="text-sm font-medium opacity-80">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 flex gap-4">
        <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title="Power Options">
          <Power size={20} />
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
