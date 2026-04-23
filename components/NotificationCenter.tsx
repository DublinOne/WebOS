import React from 'react';
import { Bell, Trash2, X, Info, CheckCircle, AlertTriangle, AlertCircle, Moon, Sun, Wifi, Volume2, Battery } from 'lucide-react';
import { Notification } from '../hooks/useNotifications';

interface NotificationCenterProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: any) => void;
}

const NotificationCenter = ({ 
  notifications, 
  onRemove, 
  onClearAll, 
  isOpen, 
  onClose,
  theme,
  setTheme
}: NotificationCenterProps) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[190]" 
          onClick={onClose}
        />
      )}
      
      <div className={`fixed top-0 right-0 bottom-12 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-[200] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-200">Notifications</h2>
            </div>
            <button 
              onClick={onClearAll}
              className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-slate-200 transition-colors"
              title="Clear all"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Quick Toggles */}
          <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-800">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-[10px] font-medium">Theme</span>
            </button>
            <div className="p-3 bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-slate-400">
              <Wifi size={18} />
              <span className="text-[10px] font-medium">Wi-Fi</span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-slate-400">
              <Volume2 size={18} />
              <span className="text-[10px] font-medium">Sound</span>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl flex flex-col items-center gap-1 text-slate-400">
              <Battery size={18} />
              <span className="text-[10px] font-medium">Battery</span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <Bell size={48} className="opacity-10" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 group relative">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-xs font-bold text-slate-200 truncate">{n.title}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(n.id)}
                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* System Info Footer */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-[10px] text-slate-600 flex justify-between">
            <span>WebOS v1.2.0-stable</span>
            <span>Uptime: 24m</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
