import React, { useState, useEffect, useCallback } from 'react';
import { Save, Check } from 'lucide-react';
import { FileItem } from '../types';

interface NotepadAppProps {
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  initialContent?: string;
  addNotification?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const NotepadApp = ({ 
  setFiles, 
  initialContent = '',
  addNotification
}: NotepadAppProps) => {
  const [content, setContent] = useState(initialContent);
  const [filename, setFilename] = useState('untitled.txt');
  const [saved, setSaved] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('notepad_draft', JSON.stringify({ content, filename }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, filename]);

  const handleSave = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    setFiles(prev => [
      ...prev, 
      {
        id: Date.now().toString(),
        name: filename.endsWith('.txt') ? filename : `${filename}.txt`,
        type: 'file',
        mimeType: 'text/plain',
        size: `${blob.size} B`,
        url: url,
        date: new Date().toLocaleDateString()
      }
    ]);
    
    if (addNotification) {
      addNotification('File Saved', `Successfully saved ${filename}`, 'success');
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [content, filename, setFiles, addNotification]);

  return (
    <div 
      className="h-full flex flex-col bg-amber-50 text-slate-900"
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={async (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/webos-file');
        if (data) {
          try {
            const file = JSON.parse(data);
            if (file.mimeType?.startsWith('text') || file.name.endsWith('.txt')) {
              const response = await fetch(file.url);
              const text = await response.text();
              setContent(text);
              setFilename(file.name);
              if (addNotification) addNotification('File Loaded', `Loaded ${file.name}`, 'info');
            }
          } catch (err) {
            console.error('Failed to load dropped file', err);
          }
        }
      }}
    >
      <div className="flex items-center justify-between p-2 bg-amber-100 border-b border-amber-200">
        <input 
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="bg-transparent border-none focus:outline-none font-medium text-amber-900 w-48"
          aria-label="Filename"
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-700">{wordCount} words</span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-amber-900 text-xs font-medium transition-colors"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      <textarea 
        className="flex-1 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your notes here..."
        aria-label="Note content"
      />
    </div>
  );
};

export default NotepadApp;
