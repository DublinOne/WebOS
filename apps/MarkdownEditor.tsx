import React, { useState, useEffect } from 'react';
import { Save, Check, FileEdit, Eye } from 'lucide-react';
import { FileItem } from '../types';

interface MarkdownEditorProps {
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  initialContent?: string;
}

const MarkdownEditor = ({ 
  setFiles, 
  initialContent = '# Welcome to Markdown Editor\n\nType your markdown here...' 
}: MarkdownEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [filename, setFilename] = useState('document.md');
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    setFiles(prev => [
      ...prev, 
      {
        id: Date.now().toString(),
        name: filename.endsWith('.md') ? filename : `${filename}.md`,
        type: 'file',
        mimeType: 'text/markdown',
        size: `${(blob.size / 1024).toFixed(2)} KB`,
        url: url,
        date: new Date().toLocaleDateString()
      }
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Simple MD to HTML converter (very basic for demo)
  const renderMarkdown = (md: string) => {
    return md
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900">
      <div className="flex items-center justify-between p-2 bg-slate-200 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <input 
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-300 rounded p-0.5">
            <button 
              onClick={() => setView('edit')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FileEdit size={14} className="inline mr-1" /> Edit
            </button>
            <button 
              onClick={() => setView('preview')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Eye size={14} className="inline mr-1" /> Preview
            </button>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-medium transition-colors ml-2"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {view === 'edit' ? (
          <textarea 
            className="w-full h-full p-6 bg-white resize-none focus:outline-none font-mono text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write markdown here..."
          />
        ) : (
          <div 
            className="w-full h-full p-8 bg-white overflow-auto prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
