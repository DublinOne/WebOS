import React, { useState, useCallback } from 'react';
import { Shield, X, Plus, Lock, Key, EyeOff, Eye, Check, Copy, Trash2 } from 'lucide-react';
import { VaultItem } from '../types';

interface DevVaultProps {
  items: VaultItem[];
  setItems: React.Dispatch<React.SetStateAction<VaultItem[]>>;
}

const DevVault = ({ 
  items, 
  setItems 
}: DevVaultProps) => {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', value: '' });

  const toggleVisible = useCallback((id: string) => {
    setVisible(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const copyToClipboard = useCallback((id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const addItem = useCallback(() => {
    if (!newItem.title || !newItem.value) return;
    const id = Date.now().toString();
    setItems(prev => [...prev, { ...newItem, id, type: 'key', date: new Date().toLocaleDateString() }]);
    setNewItem({ title: '', value: '' });
    setIsAdding(false);
  }, [newItem, setItems]);

  const deleteItem = useCallback((id: string) => {
    if (confirm('Delete this secret?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  }, [setItems]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans">
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-400">
          <Shield size={20} />
          <span className="font-semibold tracking-wide">DevVault Secure Storage</span>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isAdding ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancel' : 'New Secret'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isAdding && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title / Key Name</label>
                <input 
                  type="text" 
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. AWS Production Key"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Secret Value</label>
                <input 
                  type="text" 
                  value={newItem.value}
                  onChange={e => setNewItem({...newItem, value: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. sk-..."
                />
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={addItem} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Save to Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Lock size={48} className="mb-4 opacity-20" />
            <p>Vault is empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-slate-500" />
                    <span className="font-medium text-slate-200">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">{item.date}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-950 rounded border border-slate-800 p-2">
                  <div className="flex-1 font-mono text-sm text-slate-300 truncate">
                    {visible[item.id] ? item.value : '••••••••••••••••••••••••'}
                  </div>
                  
                  <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                    <button 
                      onClick={() => toggleVisible(item.id)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                      title={visible[item.id] ? "Hide" : "Show"}
                      aria-label={visible[item.id] ? "Hide secret" : "Show secret"}
                    >
                      {visible[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(item.id, item.value)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Copy to clipboard"
                      aria-label="Copy to clipboard"
                    >
                      {copied === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                      aria-label="Delete secret"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevVault;
