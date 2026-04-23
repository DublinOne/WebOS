import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Loader2 } from 'lucide-react';

const WebBrowser = () => {
  const [url, setUrl] = useState('https://www.wikipedia.org/');
  const [iframeSrc, setIframeSrc] = useState('https://www.wikipedia.org/');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>(['https://www.wikipedia.org/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const go = useCallback(() => {
    let target = url;
    if (!target.startsWith('http')) target = 'https://' + target;
    if (target !== iframeSrc) {
      setLoading(true);
      setIframeSrc(target);
      setUrl(target);
      
      // Update history
      const newHistory = [...history.slice(0, historyIndex + 1), target];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [url, iframeSrc, history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newUrl = history[newIndex];
      setUrl(newUrl);
      setIframeSrc(newUrl);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newUrl = history[newIndex];
      setUrl(newUrl);
      setIframeSrc(newUrl);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') go();
  }, [go]);

  return (
    <div className="flex flex-col h-full bg-slate-100 text-slate-800">
      <div className="flex items-center gap-2 p-2 bg-slate-200 border-b border-slate-300">
        <div className="flex gap-1">
          <button 
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1.5 hover:bg-slate-300 rounded text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go back"
          >
            <ArrowLeft size={16}/>
          </button>
          <button 
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-1.5 hover:bg-slate-300 rounded text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go forward"
          >
            <ArrowRight size={16}/>
          </label>
          <button 
            onClick={() => { setLoading(true); const s = iframeSrc; setIframeSrc(''); setTimeout(() => setIframeSrc(s), 10); }} 
            className="p-1.5 hover:bg-slate-300 rounded text-slate-600 transition-colors"
            aria-label="Reload page"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex-1 relative">
          <input 
            className="w-full bg-white border border-slate-300 rounded-full py-1.5 px-4 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 shadow-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="URL address bar"
          />
        </div>
      </div>
      
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="text-slate-400 text-sm">Loading website...</span>
            </div>
          </div>
        )}
        <iframe 
          src={iframeSrc} 
          className="w-full h-full border-none" 
          title="Browser View"
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default WebBrowser;
