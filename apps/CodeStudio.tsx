import React, { useState, useEffect, useCallback } from 'react';
import { Play } from 'lucide-react';

const CodeStudioApp = () => {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      background: linear-gradient(135deg, #1e293b, #0f172a); 
      color: white; 
      font-family: sans-serif; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0;
    }
    h1 { color: #60a5fa; text-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    button {
      padding: 10px 20px;
      background: #3b82f6;
      border: none;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    button:active { transform: scale(0.95); }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit this code to see live changes.</p>
  <button onclick="alert('It works!')">Click Me</button>
</body>
</html>`);
  const [previewUrl, setPreviewUrl] = useState('');
  const [autoRun, setAutoRun] = useState(false);

  const runCode = useCallback(() => {
    const blob = new Blob([code], { type: 'text/html' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  }, [code, previewUrl]);

  // Initial run
  useEffect(() => {
    runCode();
    // Cleanup on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  // Auto-run effect
  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(runCode, 1000);
    return () => clearTimeout(timer);
  }, [code, autoRun, runCode]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="text-xs font-mono text-slate-400">index.html</span>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoRun} 
              onChange={(e) => setAutoRun(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            Auto-run
          </label>
        </div>
        <button 
          onClick={runCode}
          className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-xs font-medium transition-colors"
        >
          <Play size={12} fill="currentColor" /> Run
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 h-full flex flex-col border-r border-slate-700">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-[#0d1117] text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
            placeholder="Type your HTML/CSS/JS here..."
          />
        </div>
        
        {/* Preview */}
        <div className="w-1/2 h-full bg-white relative">
          <div className="absolute top-0 left-0 px-2 py-1 bg-slate-100 text-[10px] text-slate-500 border-b border-r border-slate-200 rounded-br z-10 font-medium">
            Preview
          </div>
          <iframe 
            src={previewUrl} 
            className="w-full h-full border-none" 
            title="Preview"
            sandbox="allow-scripts allow-modals"
          />
        </div>
      </div>
      
      {/* Footer Status */}
      <div className="h-6 bg-blue-600 flex items-center px-3 text-[10px] text-blue-100 justify-between">
        <span>HTML5 Mode</span>
        <span className="font-mono">Ln {code.split('\n').length}, Col 1</span>
      </div>
    </div>
  );
};

export default CodeStudioApp;
