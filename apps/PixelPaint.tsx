import React, { useState, useCallback } from 'react';
import { Check, Download } from 'lucide-react';
import { FileItem } from '../types';

interface PixelPaintProps {
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

const PixelPaintApp = ({ 
  setFiles 
}: PixelPaintProps) => {
  const [pixels, setPixels] = useState(Array(256).fill('#ffffff'));
  const [color, setColor] = useState('#000000');
  const [saved, setSaved] = useState(false);

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#78716c'
  ];

  const paint = useCallback((index: number) => {
    setPixels(prev => {
      const newPixels = [...prev];
      newPixels[index] = color;
      return newPixels;
    });
  }, [color]);

  const saveImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      pixels.forEach((p, i) => {
        const x = (i % 16) * 10;
        const y = Math.floor(i / 16) * 10;
        ctx.fillStyle = p;
        ctx.fillRect(x, y, 10, 10);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setFiles(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              name: `art-${Date.now()}.png`,
              type: 'file',
              mimeType: 'image/png',
              size: '1 KB',
              url: url,
              date: new Date().toLocaleDateString()
            }
          ]);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      });
    }
  }, [pixels, setFiles]);

  return (
    <div 
      className="h-full flex flex-col bg-slate-100 text-slate-900"
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/webos-file');
        if (data) {
          const file = JSON.parse(data);
          if (file.mimeType?.startsWith('image')) {
            alert(`Dropped image: ${file.name}. (Importing pixels coming soon!)`);
          }
        }
      }}
    >
      <div className="flex items-center justify-between p-2 bg-slate-200 border-b border-slate-300">
        <div className="flex gap-1" role="toolbar" aria-label="Color palette">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setPixels(Array(256).fill('#ffffff'))}
            className="px-3 py-1 bg-white hover:bg-slate-50 rounded text-slate-600 text-xs font-medium border border-slate-300 transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={saveImage}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-medium transition-colors"
          >
            {saved ? <Check size={14} /> : <Download size={14} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-slate-300 p-4 overflow-auto">
        <div 
          className="grid gap-0 bg-white shadow-xl border-4 border-slate-900" 
          style={{ 
            width: '320px', 
            height: '320px', 
            gridTemplateColumns: 'repeat(16, 1fr)' 
          }}
          role="img"
          aria-label="16x16 pixel canvas"
        >
          {pixels.map((p, i) => (
            <div 
              key={i} 
              onMouseDown={() => paint(i)}
              onMouseEnter={(e) => { if (e.buttons === 1) paint(i) }}
              className="w-full h-full cursor-crosshair hover:opacity-90"
              style={{ backgroundColor: p }}
              aria-label={`Pixel ${i}`}
            />
          ))}
        </div>
      </div>
      <div className="bg-slate-200 p-1 text-[10px] text-center text-slate-500">16x16 Grid - Draw and Save to Files</div>
    </div>
  );
};

export default PixelPaintApp;
