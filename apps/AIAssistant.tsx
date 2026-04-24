import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Send } from 'lucide-react';
import { callAI } from '../utils/ai';
import { FileItem } from '../types';

interface AIAssistantProps {
  openApp?: (appKey: string, props?: any) => void;
  setTheme?: (theme: any) => void;
  setFiles?: React.Dispatch<React.SetStateAction<FileItem[]>>;
  addNotification?: (title: string, message: string, type?: any) => void;
  closeWindow?: (id: string) => void;
  minimizeWindow?: (id: string) => void;
  windows?: WindowInstance[];
  files?: FileItem[];
  setInstalledApps?: React.Dispatch<React.SetStateAction<string[]>>;
}

const AIAssistant = ({ 
  openApp, 
  setTheme, 
  setFiles, 
  addNotification, 
  closeWindow, 
  minimizeWindow,
  windows,
  files,
  setInstalledApps
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant'; text: string}[]>([
    { role: 'assistant', text: 'Hello! I am your AI assistant. I have Absolute Power over this OS. How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // Build context from files
    let systemContext = '';
    if (files) {
      const textFiles = files.filter(f => f.content && (f.mimeType === 'text/plain' || f.name.endsWith('.txt') || f.name.endsWith('.md')));
      if (textFiles.length > 0) {
        systemContext = "\n\nFILES CONTEXT:\n" + textFiles.map(f => `File: ${f.name}\nContent: ${f.content}`).join('\n---\n');
      }
    }

    const reply = await callAI(userText + systemContext);
    
    // Command Parser
    let cleanedReply = reply;
    const cmdRegex = /\[CMD: (.*?):(.*?)\]/g;
    let match;
    
    while ((match = cmdRegex.exec(reply)) !== null) {
      const [fullMatch, action, value] = match;
      cleanedReply = cleanedReply.replace(fullMatch, '').trim();
      
      try {
        switch (action) {
          case 'OPEN_APP':
            if (openApp) openApp(value.toUpperCase());
            break;
          case 'CLOSE_ALL':
            if (closeWindow && windows) {
              windows.forEach(win => closeWindow(win.id));
            }
            break;
          case 'MINIMIZE_ALL':
            if (minimizeWindow && windows) {
              windows.forEach(win => {
                if (!win.isMinimized) minimizeWindow(win.id);
              });
            }
            break;
          case 'SET_THEME':
            if (setTheme) setTheme(value.toLowerCase());
            break;
          case 'NOTIFY':
            if (addNotification) addNotification('AI Agent', value, 'info');
            break;
          case 'CREATE_FILE':
            if (setFiles) {
              const newFile: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: value,
                type: 'file',
                mimeType: 'text/plain',
                size: '0 B',
                url: '',
                date: new Date().toLocaleDateString(),
              };
              setFiles(prev => [...prev, newFile]);
              if (addNotification) addNotification('AI System', `Created file: ${value}`, 'info');
            }
            break;
          case 'GET_STATUS':
            // Read hardware stats
            let status = 'System Status: All systems nominal.';
            if ('getBattery' in navigator) {
              const battery: any = await (navigator as any).getBattery();
              status += ` Battery: ${Math.floor(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'}).`;
            }
            if ('connection' in navigator) {
              const conn: any = (navigator as any).connection;
              status += ` Network: ${conn.effectiveType} (${conn.downlink}Mbps).`;
            }
            cleanedReply += `\n\n[SYSTEM STATUS REPORT]\n${status}`;
            break;
          case 'PLAY_MEDIA':
            window.dispatchEvent(new CustomEvent('media-ai-control', { detail: { action: 'PLAY' } }));
            break;
          case 'PAUSE_MEDIA':
            window.dispatchEvent(new CustomEvent('media-ai-control', { detail: { action: 'PAUSE' } }));
            break;
          case 'NEXT_MEDIA':
            window.dispatchEvent(new CustomEvent('media-ai-control', { detail: { action: 'NEXT' } }));
            break;
          case 'INSTALL_APP':
            if (setInstalledApps) {
              const app = value.toLowerCase();
              setInstalledApps(prev => prev.includes(app) ? prev : [...prev, app]);
              if (addNotification) addNotification('AI Installer', `Automatically installed ${app}`, 'success');
            }
            break;
        }
      } catch (err) {
        console.error('AI Command Bridge Error:', err);
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', text: cleanedReply || 'Action executed.' }]);
    setLoading(false);
  }, [input, loading, openApp, setTheme, setFiles, addNotification, closeWindow, minimizeWindow, windows, setInstalledApps]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
