import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Monitor as MonitorIcon, 
  Download, 
  Check, 
  Trash2 
} from 'lucide-react';
import { Theme, FileItem, VaultItem } from '../types';

interface SettingsAppProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  files: FileItem[];
  vaultItems: VaultItem[];
}

const SettingsApp = ({ 
  theme, 
  setTheme,
  files,
  vaultItems
}: SettingsAppProps) => {
  const [showExport, setShowExport] = useState(false);
  
  const exportData = () => {
    const data = {
      files,
      vaultItems,
      theme,
      exportDate: new Date().toISOString(),
      version: '1.2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webos-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(true);
    setTimeout(() => setShowExport(false), 2000);
  };
  
  const clearAllData = () => {
    if (confirm('Clear all data? This will delete all files, vault items, and settings. Page will reload.')) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  const totalStorage = useMemo(() => {
    const filesSize = files.length;
    const vaultSize = vaultItems.length;
    // Rough estimate in KB
    const storageUsed = Math.round((JSON.stringify(files).length + JSON.stringify(vaultItems).length) / 1024);
    return { filesSize, vaultSize, storageUsed };
  }, [files, vaultItems]);
  
  return (
    <div className="p-6 text-slate-200 h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Settings className="text-blue-400" />
        System Settings
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Palette size={18} className="text-blue-400" />
            Appearance
          </h3>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <label className="block text-sm text-slate-400 mb-2">Theme</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'dark' as const, icon: Moon, label: 'Dark' },
                { value: 'light' as const, icon: Sun, label: 'Light' },
                { value: 'auto' as const, icon: MonitorIcon, label: 'Auto' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    theme === value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Download size={18} className="text-green-400" />
            Data Management
          </h3>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Files stored:</span>
                <span className="font-mono">{totalStorage.filesSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vault items:</span>
                <span className="font-mono">{totalStorage.vaultSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Storage used:</span>
                <span className="font-mono">{totalStorage.storageUsed} KB</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-700 flex gap-2 flex-wrap">
              <button
                onClick={exportData}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
              >
                {showExport ? <Check size={16} /> : <Download size={16} />}
                {showExport ? 'Exported!' : 'Export Data'}
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-medium transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
            <p className="text-xs text-slate-500 italic">
              Export creates a backup JSON file. All data stored in browser localStorage.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">About Web O-S</h3>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Version:</span>
              <span>1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Build:</span>
              <span>2024.01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Platform:</span>
              <span>Web Browser</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage:</span>
              <span>localStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
