import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Github, 
  Music, 
  Key, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Settings,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: string;
  type: 'alza_gemini' | 'github' | 'soundcloud' | 'user_secret';
  metadata: any;
  updatedAt: string;
}

const IntegrationManager = ({ addNotification }: { addNotification?: (title: string, message: string, type?: any) => void }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Mock form states
  const [formData, setFormData] = useState<any>({});

  // Simulation of loading data
  useEffect(() => {
    const saved = localStorage.getItem('webos_integrations');
    if (saved) {
      setIntegrations(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (newIntegrations: Integration[]) => {
    localStorage.setItem('webos_integrations', JSON.stringify(newIntegrations));
    setIntegrations(newIntegrations);
  };

  const handleSave = (type: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newIntegration: Integration = {
        id: Math.random().toString(36).substr(2, 9),
        type: type as any,
        metadata: { ...formData },
        updatedAt: new Date().toISOString()
      };
      
      const filtered = integrations.filter(i => i.type !== type);
      const updated = [...filtered, newIntegration];
      saveToStorage(updated);
      
      setLoading(false);
      setActiveModal(null);
      setFormData({});
      
      if (addNotification) {
        addNotification('Integrations', `Successfully updated ${type.replace('_', ' ')} credentials`, 'success');
      }
    }, 800);
  };

  const handleRemove = (id: string, type: string) => {
    const updated = integrations.filter(i => i.id !== id);
    saveToStorage(updated);
    if (addNotification) {
      addNotification('Integrations', `Removed ${type.replace('_', ' ')} integration`, 'info');
    }
  };

  const IntegrationCard = ({ 
    type, 
    title, 
    icon: Icon, 
    description, 
    color 
  }: { 
    type: string, 
    title: string, 
    icon: any, 
    description: string, 
    color: string 
  }) => {
    const exists = integrations.find(i => i.type === type);
    
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 flex flex-col h-full hover:border-slate-600 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-90`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
          </div>
          {exists && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
              <ShieldCheck size={12} /> CONNECTED
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 flex-1">{description}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveModal(type)}
            className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            {exists ? 'Configure' : 'Setup'}
          </button>
          {exists && (
            <button 
              onClick={() => handleRemove(exists.id, type)}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Remove Integration"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const Modal = ({ type, title, children }: { type: string, title: string, children: React.ReactNode }) => {
    if (activeModal !== type) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {children}
          </div>
          
          <div className="p-6 bg-slate-950/50 flex gap-3">
            <button 
              onClick={() => setActiveModal(null)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSave(type)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={18} /> Save Credentials</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-950 p-6 overflow-auto text-slate-200">
      <header className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Settings className="text-blue-500" /> Integration Manager
        </h2>
        <p className="text-slate-400 mt-1">Securely manage your third-party API keys and service credentials.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <IntegrationCard 
          type="alza_gemini"
          title="Alza Gemini"
          icon={ShieldCheck}
          description="Power your AI assistant with your own Google Gemini API key for enhanced capabilities."
          color="bg-blue-500"
        />
        
        <IntegrationCard 
          type="github"
          title="GitHub"
          icon={Github}
          description="Connect your GitHub account using a Personal Access Token to manage repositories and Gists."
          color="bg-slate-100 text-slate-900"
        />
        
        <IntegrationCard 
          type="soundcloud"
          title="SoundCloud"
          icon={Music}
          description="Access your playlists and tracks by providing your Client ID and User ID."
          color="bg-orange-500"
        />
        
        <IntegrationCard 
          type="user_secret"
          title="User Secrets"
          icon={Key}
          description="Store generic environment variables or private keys for your custom Web O-S tools."
          color="bg-purple-500"
        />
      </div>

      {/* Modals */}
      <Modal type="alza_gemini" title="Alza Gemini Configuration">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Key</label>
          <input 
            type="password" 
            placeholder="Enter your Gemini API Key..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          />
        </div>
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-xs text-blue-300">
          <AlertCircle size={16} className="shrink-0" />
          <p>Your API key is stored locally and used only for requests from your browser to Google's API.</p>
        </div>
      </Modal>

      <Modal type="github" title="GitHub Connection">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Access Token</label>
            <input 
              type="password" 
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
            />
          </div>
          <a href="https://github.com/settings/tokens" target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            Generate a new token on GitHub <ExternalLink size={12} />
          </a>
        </div>
      </Modal>

      <Modal type="soundcloud" title="SoundCloud Setup">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client ID</label>
            <input 
              type="text" 
              placeholder="SoundCloud Client ID"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-white transition-all"
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</label>
            <input 
              type="text" 
              placeholder="SoundCloud User ID"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-white transition-all"
              onChange={(e) => setFormData({ ...formData, soundcloudUserId: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal type="user_secret" title="Generic User Secret">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secret Name / Label</label>
            <input 
              type="text" 
              placeholder="e.g. AWS_ACCESS_KEY"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all"
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secret Value</label>
            <textarea 
              rows={3}
              placeholder="Enter sensitive value here..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-white transition-all resize-none"
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IntegrationManager;
