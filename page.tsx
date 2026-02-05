'use client';

import React, { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';
import { 
  Monitor, 
  Folder, 
  Music, 
  Video, 
  FileText, 
  Settings, 
  X, 
  Minus, 
  Maximize2, 
  Grid, 
  Cpu, 
  Battery, 
  Wifi, 
  Volume2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Upload,
  Trash2,
  ImageIcon,
  Terminal,
  Search,
  Sparkles,
  Bot,
  Send,
  Loader2,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Shield,
  Calculator,
  StickyNote,
  Palette,
  Save,
  Download,
  Edit3,
  FolderPlus,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  Code // Added Code icon import
} from 'lucide-react';

// --- Types ---
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: string;
  url?: string;
  date: string;
  parentId?: string;
}

interface VaultItem {
  id: string;
  title: string;
  value: string;
  type: string;
  date: string;
}

interface WindowInstance {
  id: number;
  appId: string;
  title: string;
  icon: React.ElementType;
  component: React.ElementType;
  props?: any;
  isMinimized: boolean;
  isMaximized: boolean;
  isClosing?: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

interface AppDefinition {
// ... windowReducer ...

  title: string;
  icon: React.ElementType;
  component: React.ElementType;
  defaultWidth?: number;
  defaultHeight?: number;
}

type Theme = 'dark' | 'light' | 'auto';

// Window actions
type WindowAction =
  | { type: 'OPEN'; app: AppDefinition; props?: any }
  | { type: 'CLOSE'; id: number }
  | { type: 'MINIMIZE'; id: number }
  | { type: 'MAXIMIZE'; id: number }
  | { type: 'FOCUS'; id: number }
  | { type: 'UPDATE_POSITION'; id: number; x: number; y: number }
  | { type: 'UPDATE_SIZE'; id: number; w: number; h: number }
  | { type: 'START_CLOSING'; id: number }
  | { type: 'CYCLE_WINDOWS' };

// --- Window Manager Reducer ---
const windowReducer = (state: { windows: WindowInstance[]; activeId: number | null; nextZIndex: number }, action: WindowAction) => {
  switch (action.type) {
    case 'OPEN': {
      const existing = state.windows.find(w => w.appId === action.app.id);
      if (existing) {
        return {
          ...state,
          windows: state.windows.map(w => 
            w.id === existing.id 
              ? { ...w, isMinimized: false, zIndex: state.nextZIndex } 
              : w
          ),
          activeId: existing.id,
          nextZIndex: state.nextZIndex + 1
        };
      }

      const offset = state.windows.length * 30;
      const newWindow: WindowInstance = {
        id: Date.now(),
        appId: action.app.id,
        title: action.app.title,
        icon: action.app.icon,
        component: action.app.component,
        props: action.props || {},
        isMinimized: false,
        isMaximized: false,
        isClosing: false,
        x: 50 + offset,
        y: 50 + offset,
        w: action.app.defaultWidth || 800,
        h: action.app.defaultHeight || 500,
        zIndex: state.nextZIndex
      };

      return {
        windows: [...state.windows, newWindow],
        activeId: newWindow.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'START_CLOSING': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isClosing: true } : w
        )
      };
    }

    case 'CLOSE': {
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.id),
        activeId: state.activeId === action.id ? null : state.activeId
      };
    }

    case 'MINIMIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isMinimized: !w.isMinimized } : w
        ),
        activeId: state.activeId === action.id ? null : state.activeId
      };
    }

    case 'MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, isMaximized: !w.isMaximized, zIndex: state.nextZIndex } : w
        ),
        activeId: action.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'FOCUS': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        activeId: action.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case 'UPDATE_POSITION': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w
        )
      };
    }

    case 'UPDATE_SIZE': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id ? { ...w, w: action.w, h: action.h } : w
        )
      };
    }

    case 'CYCLE_WINDOWS': {
      if (state.windows.length === 0) return state;
      
      const visibleWindows = state.windows.filter(w => !w.isMinimized);
      if (visibleWindows.length === 0) return state;

      const currentIndex = visibleWindows.findIndex(w => w.id === state.activeId);
      const nextIndex = (currentIndex + 1) % visibleWindows.length;
      const nextWindow = visibleWindows[nextIndex];

      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === nextWindow.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        activeId: nextWindow.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    default:
      return state;
  }
};

// --- API Helper ---
const callAI = async (prompt: string): Promise<string> => {
  try {
    const apiKey = ""; // API key injected by environment
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  } catch (error) {
    console.error('[WebOS] AI API Error:', error);
    return 'Error: Unable to connect to AI service. Please try again later.';
  }
};

// --- Components ---

// Desktop Icon
const DesktopIcon = React.memo(({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "text-blue-500" 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick: () => void; 
  color?: string;
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 rounded hover:bg-white/10 transition-colors group w-24 mb-2 focus:outline-none focus:bg-white/20"
    aria-label={`Open ${label}`}
    tabIndex={0}
  >
    <div className={`w-12 h-12 ${color} bg-gray-100/90 rounded-xl shadow-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
      <Icon size={28} />
    </div>
    <span className="text-white text-xs font-medium drop-shadow-md text-center line-clamp-2">{label}</span>
  </button>
));

DesktopIcon.displayName = 'DesktopIcon';

// Window Frame
const WindowFrame = ({ 
  app, 
  onClose, 
  onMinimize, 
  children, 
  isActive, 
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  onToggleMaximize
}: {
  app: WindowInstance;
  onClose: (id: number) => void;
  onMinimize: (id: number) => void;
  children: React.ReactNode;
  isActive: boolean;
  onFocus: () => void;
  onUpdatePosition: (id: number, x: number, y: number) => void;
  onUpdateSize: (id: number, w: number, h: number) => void;
  onToggleMaximize: (id: number) => void;
}) => {
  const Icon = app.icon;
  const windowRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if (app.isMaximized) return;
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - app.x, y: e.clientY - app.y });
    onFocus();
  }, [app.isMaximized, app.x, app.y, onFocus]);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: app.w,
      h: app.h,
    });
    onFocus();
  }, [app.w, app.h, onFocus]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));
        onUpdatePosition(app.id, newX, newY);
      } else if (resizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newW = Math.max(300, Math.min(window.innerWidth, resizeStart.w + deltaX));
        const newH = Math.max(200, Math.min(window.innerHeight - 48, resizeStart.h + deltaY));
        onUpdateSize(app.id, newW, newH);
      }
    };

    const onMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };

    if (dragging || resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, resizing, dragStart, resizeStart, app.id, onUpdatePosition, onUpdateSize]);

  // Focus on mount if active
  useEffect(() => {
    if (isActive && windowRef.current) {
      windowRef.current.focus();
    }
  }, [isActive]);

  return (
    <div 
      ref={windowRef}
      role="dialog"
      aria-label={app.title}
      tabIndex={-1}
      className={`absolute flex flex-col bg-slate-900 rounded-lg shadow-2xl border border-slate-700 overflow-hidden transition-all duration-200 ${
        app.isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      } ${isActive ? 'ring-1 ring-blue-500/50' : ''}`}
      style={{
        top: app.isMaximized ? 0 : app.y,
        left: app.isMaximized ? 0 : app.x,
        width: app.isMaximized ? '100%' : app.w,
        height: app.isMaximized ? 'calc(100% - 48px)',
        display: app.isMinimized ? 'none' : 'flex',
        zIndex: app.zIndex,
        userSelect: dragging || resizing ? 'none' : 'auto'
      }}
      onClick={onFocus}
    >
      <div 
        className={`h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 select-none ${app.isMaximized ? '' : 'cursor-move'}`}
        onMouseDown={onDragMouseDown}
        onDoubleClick={(e) => { e.stopPropagation(); onToggleMaximize(app.id); }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-blue-400" />}
          <span className="text-slate-200 text-sm font-medium">{app.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(app.id); }} 
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            aria-label="Minimize window"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleMaximize(app.id); }}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white hidden sm:block transition-colors"
            aria-label={app.isMaximized ? "Restore window" : "Maximize window"}
          >
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(app.id); }} 
            className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
            aria-label="Close window"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-900/95 relative">
        {children}
      </div>

      {!app.isMaximized && (
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-50 hover:opacity-100 z-50 transition-opacity"
          title="Resize window"
          aria-label="Resize window"
        >
          <div className="w-0 h-0 border-b-[6px] border-r-[6px] border-l-transparent border-t-transparent border-b-slate-400 border-r-slate-400 mb-1 mr-1"></div>
        </div>
      )}
    </div>
  );
};

// Taskbar Item
const TaskbarItem = React.memo(({ 
  app, 
  onClick 
}: { 
  app: WindowInstance; 
  onClick: () => void;
}) => {
  const Icon = app.icon;
  const isActive = app.isMinimized === false && !app.isClosing;
  
  return (
    <button 
      onClick={onClick}
      className={`h-full px-4 flex items-center gap-2 transition-all border-b-2 ${
        isActive 
          ? 'border-blue-500 bg-white/10' 
          : 'border-transparent opacity-70 hover:opacity-100 hover:bg-white/5'
      }`}
      aria-label={`${app.title}${isActive ? ' (active)' : ''}`}
    >
      <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
      <span className="text-slate-200 text-sm hidden md:block max-w-[100px] truncate">{app.title}</span>
    </button>
  );
});

TaskbarItem.displayName = 'TaskbarItem';

// Context Menu
const ContextMenu = ({ 
  x, 
  y, 
  onClose, 
  items 
}: { 
  x: number; 
  y: number; 
  onClose: () => void;
  items: { label: string; icon: React.ElementType; onClick: () => void }[];
}) => {
  useEffect(() => {
    const handleClick = () => onClose();
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-[200] min-w-[180px]"
      style={{ top: y, left: x }}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
              onClose();
            }}
            className="w-full px-3 py-2 hover:bg-white/10 text-slate-200 text-sm flex items-center gap-3 transition-colors"
          >
            <Icon size={16} className="text-slate-400" />
            {item.label}
          </button>
        );
      })}
    </div>
// ... TaskbarItem ...
// ... ContextMenu ...

// --- App Contents ---

// Calculator App
const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [isDone, setIsDone] = useState(false);

  const handlePress = useCallback((val: string) => {
    if (isDone && !isNaN(Number(val))) {
      setDisplay(val);
      setIsDone(false);
      return;
    }

    if (val === 'C') {
      setDisplay('0');
      setIsDone(false);
    } else if (val === '=') {
      try {
        const result = new Function('return ' + display.replace(/x/g, '*').replace(/÷/g, '/'))();
        setDisplay(String(result));
        setIsDone(true);
      } catch (e) {
        setDisplay('Error');
      }
    } else {
      if (display === '0' || display === 'Error' || isDone) {
        setDisplay(val);
        setIsDone(false);
      } else {
        setDisplay(display + val);
      }
    }
  }, [display, isDone]);

  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', 'x',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-2">
      <div className="flex-1 bg-slate-800 rounded mb-2 flex items-end justify-end p-4 text-3xl font-mono truncate border border-slate-700">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 h-4/5">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={() => handlePress(btn)}
            className={`rounded font-bold text-lg hover:bg-opacity-80 active:scale-95 transition-all
              ${btn === '=' ? 'col-span-2 bg-blue-600' : 
                ['C', '(', ')', '÷', 'x', '-', '+'].includes(btn) ? 'bg-slate-700 text-blue-300' : 'bg-slate-800'}
            `}
            aria-label={`Button ${btn}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

// Notepad App
const NotepadApp = ({ 
  setFiles, 
  initialContent = '' 
}: { 
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>; 
  initialContent?: string;
}) => {
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [content, filename, setFiles]);

  return (
    <div className="h-full flex flex-col bg-amber-50 text-slate-900">
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

// PixelPaint App
const PixelPaintApp = ({ 
  setFiles 
}: { 
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}) => {
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
    <div className="h-full flex flex-col bg-slate-100 text-slate-900">
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

// DevVault App
const DevVault = ({ 
  items, 
  setItems 
}: { 
  items: VaultItem[]; 
  setItems: React.Dispatch<React.SetStateAction<VaultItem[]>>;
}) => {
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

// Web Browser
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
          </button>
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
      <div className="bg-amber-50 px-3 py-1 text-[11px] text-amber-800 text-center border-t border-amber-200">
        <b>Tip:</b> Some sites block iframes. Try wikipedia.org or bing.com
      </div>
    </div>
  );
};

// AI Chat Assistant
const AIAssistant = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant'; text: string}[]>([
    { role: 'assistant', text: 'Hello! I am your AI assistant. How can I help you today?' }
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

    const reply = await callAI(`You are a helpful AI assistant running inside a WebOS simulation. Keep responses concise and helpful. User: ${userText}`);
    
    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  }, [input, loading]);

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

// File Explorer with Folders
const FileExplorer = ({ 
  files, 
  setFiles, 
  openMedia 
}: { 
  files: FileItem[]; 
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>; 
  openMedia: (file: FileItem) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const currentFiles = useMemo(() => {
    return files.filter(f => f.parentId === currentFolder);
  }, [files, currentFolder]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []).map(file => {
      const size = file.size < 1024 ? `${file.size} B` :
                     file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(2)} KB` :
                     `${(file.size / 1024 / 1024).toFixed(2)} MB`;
                     
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'file' as const,
        mimeType: file.type || 'application/octet-stream',
        size,
        url: URL.createObjectURL(file),
        date: new Date().toLocaleDateString(),
        parentId: currentFolder
      };
    });
    setFiles(prev => [...prev, ...uploadedFiles]);
    
    // Reset input to allow re-uploading same file
    e.target.value = '';
  }, [currentFolder, setFiles]);

  const createFolder = useCallback(() => {
    const name = prompt('Folder name:');
    if (!name) return;
    
    setFiles(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'folder',
      size: '-',
      date: new Date().toLocaleDateString(),
      parentId: currentFolder
    }]);
  }, [currentFolder, setFiles]);

  const deleteFile = useCallback((id: string, isFolder: boolean) => {
    if (isFolder) {
      // Delete folder and all its contents
      const deleteRecursive = (folderId: string) => {
        const children = files.filter(f => f.parentId === folderId);
        children.forEach(child => {
          if (child.type === 'folder') deleteRecursive(child.id);
        });
        setFiles(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
      };
      if (confirm('Delete this folder and all its contents?')) {
        deleteRecursive(id);
      }
    } else {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  }, [files, setFiles]);

  const startRename = useCallback((file: FileItem) => {
    setRenamingId(file.id);
    setNewName(file.name);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId && newName.trim()) {
      setFiles(prev => prev.map(f => f.id === renamingId ? { ...f, name: newName.trim() } : f));
    }
    setRenamingId(null);
    setNewName('');
  }, [renamingId, newName, setFiles]);

  const analyzeStorage = useCallback(async () => {
    if (files.length === 0) {
      alert("No files to analyze!");
      return;
    }
    setAnalyzing(true);
    const fileList = files.filter(f => f.type === 'file').map(f => `${f.name} (${f.mimeType})`).join(', ');
    const prompt = `I have the following files: ${fileList}. Give a 1-sentence summary and 2 suggestions.`;
    
    const analysis = await callAI(prompt);
    alert(analysis);
    setAnalyzing(false);
  }, [files]);

  const getIcon = (file: FileItem) => {
    if (file.type === 'folder') return Folder;
    if (file.mimeType?.startsWith('image')) return ImageIcon;
    if (file.mimeType?.startsWith('audio')) return Music;
    if (file.mimeType?.startsWith('video')) return Video;
    if (file.mimeType?.startsWith('text')) return StickyNote;
    return FileText;
  };

  const breadcrumb = useMemo(() => {
    const path: FileItem[] = [];
    let current = currentFolder;
    while (current) {
      const folder = files.find(f => f.id === current);
      if (folder) {
        path.unshift(folder);
        current = folder.parentId;
      } else break;
    }
    return path;
  }, [currentFolder, files]);

  return (
    <div className="p-4 h-full text-slate-200 flex flex-col">
      <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button 
            onClick={() => setCurrentFolder(undefined)}
            className="hover:text-slate-200 transition-colors"
          >
            Home
          </button>
          {breadcrumb.map((folder) => (
            <React.Fragment key={folder.id}>
              <span>/</span>
              <button 
                onClick={() => setCurrentFolder(folder.id)}
                className="hover:text-slate-200 transition-colors"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
          <Upload size={16} /> Upload Files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          multiple 
          accept="image/*,video/*,audio/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.json,.xml,.csv,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.md"
          title="Supported: Images, Videos, Audio, Documents, Code files"
        />
            
            <button 
              onClick={createFolder}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FolderPlus size={16} /> New Folder
            </button>
            
            <button 
              onClick={analyzeStorage} 
              disabled={analyzing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
              Analyze
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 rounded-md px-3 py-2 border border-slate-700">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:outline-none text-sm w-32 md:w-48 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {currentFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
          <Folder size={64} className="mb-4 opacity-20" />
          <p>No files or folders. Upload or create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-auto">
          {currentFiles.map(file => {
            const Icon = getIcon(file);
            const isRenaming = renamingId === file.id;
            
            return (
              <div 
                key={file.id} 
                className="group relative bg-slate-800/50 hover:bg-slate-800 p-4 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all flex flex-col items-center text-center cursor-pointer"
                onDoubleClick={() => {
                  if (file.type === 'folder') {
                    setCurrentFolder(file.id);
                  } else {
                    openMedia(file);
                  }
                }}
              >
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                
                {isRenaming ? (
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={finishRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRename();
                      if (e.key === 'Escape') { setRenamingId(null); setNewName(''); }
                    }}
                    className="text-sm font-medium w-full bg-slate-900 border border-blue-500 rounded px-1 text-center"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium truncate w-full mb-1">{file.name}</span>
                )}
                
                <span className="text-xs text-slate-500">{file.size}</span>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); startRename(file); }}
                    className="p-1.5 bg-slate-900 rounded-full text-slate-400 hover:text-blue-400"
                    aria-label="Rename"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFile(file.id, file.type === 'folder'); }}
                    className="p-1.5 bg-slate-900 rounded-full text-slate-400 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Media Player
const MediaPlayer = ({ file }: { file?: FileItem }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  useEffect(() => {
    setIsPlaying(false);
  }, [file]);

  if (!file) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <Music size={48} className="mb-4 opacity-20" />
      <p>Select a media file to play</p>
    </div>
  );

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) mediaRef.current.pause();
      else mediaRef.current.play();
      setIsPlaying(!isPlaying);
    }
// ... NotepadApp ...
// ... PixelPaintApp ...
// ... DevVault ...
// ... WebBrowser ...
// ... AIAssistant ...
// ... FileExplorer ...
// ... MediaPlayer ...
// ... TaskManager ...

// Code Editor App (Live IDE)
const CodeEditorApp = () => {
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

// Terminal
const TerminalApp = ({ 
  files, 
  windows, 
  onClose,
  setFiles
}: { 
  files: FileItem[]; 
  windows: WindowInstance[]; 
  onClose?: () => void;
  setFiles?: React.Dispatch<React.SetStateAction<FileItem[]>>;
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{type: 'input' | 'output'; content: string}[]>([
    { type: 'output', content: 'WebOS Terminal v3.0.0 initialized...' },
    { type: 'output', content: 'Type "help" for available commands.' }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('~');
  const [startTime] = useState(Date.now());
  const [npmPackages, setNpmPackages] = useState<string[]>(['react', 'next', 'typescript']);
  const [gitBranch, setGitBranch] = useState('main');
  const [serverRunning, setServerRunning] = useState(false);
  const [serverPort, setServerPort] = useState(3000);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;

      setHistory(prev => [...prev, { type: 'input', content: cmd }]);
      setCommandHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
      setInput('');
      
      const args = cmd.split(' ');
      const command = args[0].toLowerCase();
      
      let response = '';
      
      switch (command) {
        case 'help':
          response = `Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 File System:
  ls              - List files
  cat <file>      - View file contents
  tree            - Show file tree structure
  pwd             - Print working directory
  touch <file>    - Create new file
  mkdir <dir>     - Create new folder
  rm <file>       - Delete file/folder
  mv <src> <dst>  - Move/rename file
  cp <src> <dst>  - Copy file
  grep <pat> <f>  - Search in file
  find <pattern>  - Find files by name
  
⚙️  System:
  ps              - Show running processes
  top             - System resource monitor
  uname           - System information
  uptime          - Show system uptime
  neofetch        - Display system info (fancy)
  kill <pid>      - Close window by PID
  
🔧 Utilities:
  whoami          - Current user
  date            - Current date and time
  echo <msg>      - Print message
  history         - Command history
  calc <exp>      - Calculator (e.g., calc 2+2)
  clear           - Clear terminal
  base64 <text>   - Encode to base64
  uuid            - Generate UUID
  password <len>  - Generate password
  hash <text>     - Generate hash
  
🤖 AI Commands:
  ask <question>  - Ask AI assistant
  explain <cmd>   - Explain what command does
  suggest <task>  - Get command suggestions
  translate <txt> - Translate text
  code <desc>     - Generate code snippet
  
💻 Developer Tools:
  npm install <p> - Install npm package
  npm list        - List packages
  npm run <cmd>   - Run npm script
  git status      - Git repository status
  git log         - Show commit history
  git branch      - List branches
  prettier <file> - Format code
  
🌐 Server Management:
  axs server      - Start AXS development server
  axs stop        - Stop AXS server
  axs status      - Check server status
  serve [port]    - Start HTTP server
  python -m http  - Python HTTP server
  php -S          - PHP development server
  
🎮 Fun:
  cowsay <msg>    - Cow says message
  fortune         - Random fortune
  joke            - Random joke
  quote           - Inspirational quote
  
💡 Other:
  exit            - Close terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
          break;
          
        case 'clear':
          setHistory([]);
          return;
          
        case 'ls':
          if (files.length === 0) {
            response = 'total 0';
          } else {
            const fileList = files.filter(f => f.type === 'file');
            const folderList = files.filter(f => f.type === 'folder');
            response = `total ${files.length}\n`;
            if (folderList.length > 0) {
              response += folderList.map(f => `📁 ${f.name}/`).join('\n') + '\n';
            }
            if (fileList.length > 0) {
              response += fileList.map(f => `📄 ${f.name.padEnd(30)} ${f.size.padStart(10)}  ${f.date}`).join('\n');
            }
          }
          break;
          
        case 'cat':
          if (!args[1]) {
            response = 'Usage: cat <filename>';
          } else {
            const file = files.find(f => f.name === args[1]);
            if (!file) {
              response = `cat: ${args[1]}: No such file`;
            } else if (file.type === 'folder') {
              response = `cat: ${args[1]}: Is a directory`;
            } else {
              response = `Contents of ${file.name}:\n${'─'.repeat(50)}\n(File contents not available in demo)\n${'─'.repeat(50)}`;
            }
          }
          break;
          
        case 'tree':
          response = '.\n';
          files.forEach((f, i) => {
            const isLast = i === files.length - 1;
            const prefix = isLast ? '└── ' : '├── ';
            const icon = f.type === 'folder' ? '📁' : '📄';
            response += `${prefix}${icon} ${f.name}\n`;
          });
          break;
          
        case 'pwd':
          response = `/home/guest${currentDir === '~' ? '' : currentDir}`;
          break;
          
        case 'ps':
          response = 'PID    NAME              STATUS    MEM      CPU\n' + '─'.repeat(50) + '\n';
          response += windows.map(w => 
            `${w.id.toString().substr(-4).padEnd(6)}${w.title.padEnd(17)}${(w.isMinimized ? 'Sleep' : 'Active').padEnd(10)}${Math.floor(Math.random() * 100)}MB    ${Math.floor(Math.random() * 30)}%`
          ).join('\n');
          break;
          
        case 'top':
          response = `System Resources:
CPU Usage:  ${Math.floor(Math.random() * 50 + 20)}%
Memory:     ${Math.floor(Math.random() * 30 + 40)}%
Processes:  ${windows.length} running
Files:      ${files.length} total
Uptime:     ${Math.floor((Date.now() - startTime) / 60000)} minutes`;
          break;
          
        case 'uname':
          const flags = args[1];
          if (flags === '-a') {
            response = 'WebOS 1.2.0 webos-kernel x86_64 GNU/Linux';
          } else {
            response = 'WebOS';
          }
          break;
          
        case 'uptime':
          const uptime = Math.floor((Date.now() - startTime) / 1000);
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = uptime % 60;
          response = `up ${hours}h ${minutes}m ${seconds}s, ${windows.length} windows`;
          break;
          
        case 'neofetch':
          response = `
    ╭───────────────╮     guest@webos
    │    ████████   │     ───────────
    │    ████████   │     OS: WebOS 1.2.0
    │    ▀▀▀▀▀▀▀▀   │     Kernel: webos-kernel
    │               │     Uptime: ${Math.floor((Date.now() - startTime) / 60000)} mins
    │    ▄▄▄▄▄▄▄▄   │     Packages: ${windows.length} apps
    │    ████████   │     Shell: wsh
    │    ████████   │     Resolution: ${window.innerWidth}x${window.innerHeight}
    ╰───────────────╯     Terminal: WebOS Terminal
                          CPU: Virtual CPU
                          Memory: ${Math.floor(Math.random() * 2048 + 1024)}MB / 8192MB`;
          break;
          
        case 'whoami':
          response = 'guest_user';
          break;
          
        case 'date':
          response = new Date().toString();
          break;
          
        case 'echo':
          response = args.slice(1).join(' ');
          break;
          
        case 'history':
          if (commandHistory.length === 0) {
            response = 'No commands in history';
          } else {
            response = commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(3)} ${cmd}`).join('\n');
          }
          break;
          
        case 'calc':
          const expression = args.slice(1).join('');
          if (!expression) {
            response = 'Usage: calc <expression>\nExample: calc 2+2*5';
          } else {
            try {
              const result = new Function('return ' + expression.replace(/[^0-9+\-*/().]/g, ''))();
              response = `${expression} = ${result}`;
            } catch (e) {
              response = 'Error: Invalid expression';
            }
          }
          break;
          
        case 'cowsay':
          const message = args.slice(1).join(' ') || 'Hello!';
          const msgLen = message.length;
          response = `
 ${'_'.repeat(msgLen + 2)}
< ${message} >
 ${'-'.repeat(msgLen + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
          break;
          
        case 'fortune':
          const fortunes = [
            'You will write great code today.',
            'A bug is just a feature in disguise.',
            'The best code is no code at all.',
            'Always commit before you break everything.',
            'Coffee: the developer fuel.',
            'Debugging is like being a detective in a crime movie where you are also the murderer.',
            'There are only 10 types of people: those who understand binary and those who don\'t.',
            'It works on my machine. ¯\\_(ツ)_/¯',
            'Code never lies, comments sometimes do.',
            'A good programmer looks both ways before crossing a one-way street.'
          ];
          response = fortunes[Math.floor(Math.random() * fortunes.length)];
          break;
          
        // File operations
        case 'touch':
          if (!args[1]) {
            response = 'Usage: touch <filename>';
          } else if (setFiles) {
            const exists = files.find(f => f.name === args[1]);
            if (exists) {
              response = `touch: ${args[1]}: File exists`;
            } else {
              const newFile: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: args[1],
                type: 'file',
                mimeType: 'text/plain',
                size: '0 B',
                url: '',
                date: new Date().toLocaleDateString(),
                parentId: null
              };
              setFiles(prev => [...prev, newFile]);
              response = `Created: ${args[1]}`;
            }
          } else {
            response = 'touch: operation not supported';
          }
          break;
          
        case 'mkdir':
          if (!args[1]) {
            response = 'Usage: mkdir <dirname>';
          } else if (setFiles) {
            const exists = files.find(f => f.name === args[1]);
            if (exists) {
              response = `mkdir: ${args[1]}: File exists`;
            } else {
              const newFolder: FileItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: args[1],
                type: 'folder',
                mimeType: '',
                size: '-',
                url: '',
                date: new Date().toLocaleDateString(),
                parentId: null
              };
              setFiles(prev => [...prev, newFolder]);
              response = `Created directory: ${args[1]}`;
            }
          } else {
            response = 'mkdir: operation not supported';
          }
          break;
          
        case 'rm':
          if (!args[1]) {
            response = 'Usage: rm <filename>';
          } else if (setFiles) {
            const fileToDelete = files.find(f => f.name === args[1]);
            if (!fileToDelete) {
              response = `rm: ${args[1]}: No such file or directory`;
            } else {
              setFiles(prev => prev.filter(f => f.name !== args[1]));
              response = `Removed: ${args[1]}`;
            }
          } else {
            response = 'rm: operation not supported';
          }
          break;
          
        case 'mv':
          if (!args[1] || !args[2]) {
            response = 'Usage: mv <source> <destination>';
          } else if (setFiles) {
            const fileToMove = files.find(f => f.name === args[1]);
            if (!fileToMove) {
              response = `mv: ${args[1]}: No such file or directory`;
            } else {
              setFiles(prev => prev.map(f => 
                f.name === args[1] ? { ...f, name: args[2] } : f
              ));
              response = `Renamed: ${args[1]} -> ${args[2]}`;
            }
          } else {
            response = 'mv: operation not supported';
          }
          break;
          
        case 'cp':
          if (!args[1] || !args[2]) {
            response = 'Usage: cp <source> <destination>';
          } else if (setFiles) {
            const fileToCopy = files.find(f => f.name === args[1]);
            if (!fileToCopy) {
              response = `cp: ${args[1]}: No such file or directory`;
            } else {
              const newFile = {
                ...fileToCopy,
                id: Math.random().toString(36).substr(2, 9),
                name: args[2],
                date: new Date().toLocaleDateString()
              };
              setFiles(prev => [...prev, newFile]);
              response = `Copied: ${args[1]} -> ${args[2]}`;
            }
          } else {
            response = 'cp: operation not supported';
          }
          break;
          
        case 'grep':
          if (!args[1] || !args[2]) {
            response = 'Usage: grep <pattern> <filename>';
          } else {
            const file = files.find(f => f.name === args[2]);
            if (!file) {
              response = `grep: ${args[2]}: No such file`;
            } else {
              response = `Searching for "${args[1]}" in ${args[2]}...\n(File content search not available in demo)`;
            }
          }
          break;
          
        case 'find':
          if (!args[1]) {
            response = 'Usage: find <pattern>';
          } else {
            const pattern = args[1].toLowerCase();
            const matches = files.filter(f => f.name.toLowerCase().includes(pattern));
            if (matches.length === 0) {
              response = `No files matching "${args[1]}"`;
            } else {
              response = `Found ${matches.length} file(s):\n${matches.map(f => `  ${f.type === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n')}`;
            }
          }
          break;
          
        case 'kill':
          if (!args[1]) {
            response = 'Usage: kill <pid>';
          } else {
            const pid = args[1];
            const windowToKill = windows.find(w => w.id.toString().includes(pid));
            if (windowToKill) {
              response = `Killed process ${pid} (${windowToKill.title})`;
            } else {
              response = `kill: (${pid}): No such process`;
            }
          }
          break;
        
        // Utilities
        case 'base64':
          const text = args.slice(1).join(' ');
          if (!text) {
            response = 'Usage: base64 <text>';
          } else {
            try {
              response = btoa(text);
            } catch (e) {
              response = 'Error: Invalid text for encoding';
            }
          }
          break;
          
        case 'uuid':
          response = crypto.randomUUID();
          break;
          
        case 'password':
          const length = parseInt(args[1]) || 16;
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
          let password = '';
          for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          response = `Generated password (${length} chars):\n${password}`;
          break;
          
        case 'hash':
          const hashText = args.slice(1).join(' ');
          if (!hashText) {
            response = 'Usage: hash <text>';
          } else {
            let hash = 0;
            for (let i = 0; i < hashText.length; i++) {
              const char = hashText.charCodeAt(i);
              hash = ((hash << 5) - hash) + char;
              hash = hash & hash;
            }
            response = `Hash: ${Math.abs(hash).toString(16)}`;
          }
          break;
        
        // AI Commands
        case 'ask':
          const query = args.slice(1).join(' ');
          if (!query) {
            response = "Usage: ask <question>";
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Thinking...' }]);
            const aiReply = await callAI(`Terminal query: ${query}. Give a concise, helpful answer.`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Thinking...');
              return [...filtered, { type: 'output', content: `🤖 ${aiReply}` }];
            });
            return;
          }
          break;
          
        case 'explain':
          const cmdToExplain = args.slice(1).join(' ');
          if (!cmdToExplain) {
            response = 'Usage: explain <command>';
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Analyzing...' }]);
            const explanation = await callAI(`Explain this terminal command in 2-3 sentences: ${cmdToExplain}`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Analyzing...');
              return [...filtered, { type: 'output', content: `🤖 ${explanation}` }];
            });
            return;
          }
          break;
          
        case 'suggest':
          const task = args.slice(1).join(' ');
          if (!task) {
            response = 'Usage: suggest <task description>';
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Thinking...' }]);
            const suggestions = await callAI(`Suggest 3 terminal commands to: ${task}. Format as a numbered list.`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Thinking...');
              return [...filtered, { type: 'output', content: `🤖 ${suggestions}` }];
            });
            return;
          }
          break;
          
        case 'translate':
          const translateText = args.slice(1).join(' ');
          if (!translateText) {
            response = 'Usage: translate <text>';
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Translating...' }]);
            const translation = await callAI(`Translate this to English: ${translateText}`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Translating...');
              return [...filtered, { type: 'output', content: `🤖 ${translation}` }];
            });
            return;
          }
          break;
          
        case 'code':
          const codeDesc = args.slice(1).join(' ');
          if (!codeDesc) {
            response = 'Usage: code <description>';
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '🤖 Generating code...' }]);
            const codeSnippet = await callAI(`Generate a code snippet for: ${codeDesc}. Include the code in a code block.`);
            setHistory(prev => {
              const filtered = prev.filter(p => p.content !== '🤖 Generating code...');
              return [...filtered, { type: 'output', content: `🤖 ${codeSnippet}` }];
            });
            return;
          }
          break;
        
        // Developer Tools - NPM
        case 'npm':
          const npmCmd = args[1];
          if (!npmCmd) {
            response = 'Usage: npm <install|list|run> [package]';
          } else if (npmCmd === 'install') {
            const pkg = args[2];
            if (!pkg) {
              response = 'Usage: npm install <package>';
            } else if (npmPackages.includes(pkg)) {
              response = `Package ${pkg} is already installed`;
            } else {
              setNpmPackages(prev => [...prev, pkg]);
              response = `+ ${pkg}@latest\nadded 1 package in 2.3s`;
            }
          } else if (npmCmd === 'list') {
            response = `Installed packages:\n${npmPackages.map(p => `  - ${p}@latest`).join('\n')}`;
          } else if (npmCmd === 'run') {
            const script = args[2] || 'dev';
            response = `Running script: ${script}\n> webos@1.0.0 ${script}\n> next dev\n\nReady on http://localhost:3000`;
          } else {
            response = `npm: unknown command "${npmCmd}"`;
          }
          break;
        
        // Developer Tools - Git
        case 'git':
          const gitCmd = args[1];
          if (!gitCmd) {
            response = 'Usage: git <status|log|branch>';
          } else if (gitCmd === 'status') {
            response = `On branch ${gitBranch}\nYour branch is up to date with 'origin/${gitBranch}'.\n\nnothing to commit, working tree clean`;
          } else if (gitCmd === 'log') {
            response = `commit a7f3c2e (HEAD -> ${gitBranch})\nAuthor: Guest User <guest@webos.local>\nDate:   ${new Date().toDateString()}\n\n    feat: enhanced terminal with new commands\n\ncommit b9e4d1a\nAuthor: Guest User <guest@webos.local>\nDate:   ${new Date(Date.now() - 86400000).toDateString()}\n\n    feat: added file system operations`;
          } else if (gitCmd === 'branch') {
            response = `* ${gitBranch}\n  develop\n  feature/new-ui`;
          } else {
            response = `git: '${gitCmd}' is not a git command`;
          }
          break;
          
        case 'prettier':
          const fileToFormat = args[1];
          if (!fileToFormat) {
            response = 'Usage: prettier <filename>';
          } else {
            const file = files.find(f => f.name === fileToFormat);
            if (!file) {
              response = `prettier: ${fileToFormat}: No such file`;
            } else {
              response = `Formatting ${fileToFormat}...\n${fileToFormat} formatted successfully`;
            }
          }
          break;
        
        // Fun commands
        case 'joke':
          const jokes = [
            'Why do programmers prefer dark mode? Because light attracts bugs!',
            'How many programmers does it take to change a light bulb? None, that\'s a hardware problem.',
            'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
            'Why do Java developers wear glasses? Because they don\'t C#.',
            'There are only two hard things in Computer Science: cache invalidation and naming things.',
            'I would tell you a UDP joke, but you might not get it.',
            'Why did the programmer quit his job? Because he didn\'t get arrays.',
            'What\'s a programmer\'s favorite hangout place? Foo Bar.'
          ];
          response = jokes[Math.floor(Math.random() * jokes.length)];
          break;
          
        case 'quote':
          const quotes = [
            '"First, solve the problem. Then, write the code." - John Johnson',
            '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
            '"The best error message is the one that never shows up." - Thomas Fuchs',
            '"Simplicity is the soul of efficiency." - Austin Freeman',
            '"Make it work, make it right, make it fast." - Kent Beck',
            '"Clean code always looks like it was written by someone who cares." - Robert C. Martin',
            '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler'
          ];
          response = quotes[Math.floor(Math.random() * quotes.length)];
          break;
        
        // Server Management - Termux style
        case 'axs':
          const axsCmd = args[1];
          if (!axsCmd) {
            response = 'Usage: axs <server|stop|status>';
          } else if (axsCmd === 'server') {
            if (serverRunning) {
              response = `AXS server is already running on port ${serverPort}`;
            } else {
              setServerRunning(true);
              const port = parseInt(args[2]) || 3000;
              setServerPort(port);
              response = `
┌─────────────────────────────────────────┐
│  AXS Development Server                 │
└─────────────────────────────────────────┘

Starting server...
✓ Server initialized
✓ Routes loaded
✓ Middleware configured

Server running at:
  → Local:    http://localhost:${port}
  → Network: http://192.168.1.100:${port}

Ready to accept connections!
Press Ctrl+C or run 'axs stop' to stop`;
            }
          } else if (axsCmd === 'stop') {
            if (!serverRunning) {
              response = 'No server is running';
            } else {
              setServerRunning(false);
              response = `
Shutting down AXS server...
✓ Closing connections
✓ Cleaning up resources
✓ Server stopped

Goodbye!`;
            }
          } else if (axsCmd === 'status') {
            if (serverRunning) {
              response = `
AXS Server Status:
  Status:    RUNNING
  Port:      ${serverPort}
  Uptime:    ${Math.floor((Date.now() - startTime) / 1000)}s
  PID:       ${Math.floor(Math.random() * 90000) + 10000}
  URL:       http://localhost:${serverPort}`;
            } else {
              response = `
AXS Server Status:
  Status:    STOPPED
  
Run 'axs server' to start`;
            }
          } else {
            response = `axs: unknown command "${axsCmd}"`;
          }
          break;
        
        case 'serve':
          if (serverRunning) {
            response = `A server is already running on port ${serverPort}`;
          } else {
            setServerRunning(true);
            const port = parseInt(args[1]) || 8000;
            setServerPort(port);
            response = `
Starting HTTP server...

Serving files at http://localhost:${port}
Press Ctrl+C or run 'axs stop' to stop

Available at:
  http://localhost:${port}
  http://127.0.0.1:${port}`;
          }
          break;
        
        case 'python':
          if (args[1] === '-m' && args[2] === 'http.server') {
            if (serverRunning) {
              response = `A server is already running on port ${serverPort}`;
            } else {
              setServerRunning(true);
              const port = parseInt(args[3]) || 8000;
              setServerPort(port);
              response = `Serving HTTP on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/) ...`;
            }
          } else {
            response = 'Python 3.11.0\nUsage: python -m http.server [port]';
          }
          break;
        
        case 'php':
          if (args[1] === '-S') {
            if (serverRunning) {
              response = `A server is already running on port ${serverPort}`;
            } else {
              setServerRunning(true);
              const addr = args[2] || 'localhost:8080';
              const port = parseInt(addr.split(':')[1]) || 8080;
              setServerPort(port);
              response = `[${new Date().toLocaleTimeString()}] PHP ${Math.floor(Math.random() * 3) + 7}.${Math.floor(Math.random() * 5)} Development Server (http://${addr}) started`;
            }
          } else {
            response = 'PHP 8.2.0\nUsage: php -S <addr:port>';
          }
          break;
          
        case 'exit':
          if (onClose) onClose();
          response = 'Goodbye!';
          break;
          
        default:
          response = `bash: ${command}: command not found\nType 'help' for available commands`;
      }

      if (response) {
        setHistory(prev => [...prev, { type: 'output', content: response }]);
      }
    }
  }, [input, files, windows, onClose, commandHistory, historyIndex, currentDir, startTime]);

  return (
    <div 
      className="h-full bg-slate-950 p-4 font-mono text-sm overflow-auto text-slate-200" 
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-1">
        {history.map((line, i) => (
          <div key={i} className={`${line.type === 'input' ? 'text-blue-400 mt-2' : 'text-slate-300 whitespace-pre-wrap'}`}>
            {line.type === 'input' && <span className="mr-2 text-green-500">➜ ~</span>}
            {line.content}
          </div>
        ))}
      </div>
      
      <div className="flex items-center mt-2 text-blue-400">
        <span className="mr-2 text-green-500">➜ ~</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent border-none focus:outline-none text-slate-100"
          aria-label="Terminal command input"
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

// Settings App
const SettingsApp = ({ 
  theme, 
  setTheme,
  files,
  vaultItems
}: { 
  theme: Theme; 
  setTheme: (theme: Theme) => void;
  files: FileItem[];
  vaultItems: VaultItem[];
}) => {
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
    const storageUsed = (JSON.stringify({ files, vaultItems }).length / 1024).toFixed(2);
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
          <h3 className="font-semibold mb-3">About WebOS</h3>
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
// ... SettingsApp ...

// --- Main WebOS Component ---

export default function WebOS() {
  // Load persisted data from localStorage
  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos_files');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos_vault');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: '1', title: 'AWS Production Key', value: 'AKIAIOSFODNN7EXAMPLE', type: 'key', date: '2023-10-01' },
      { id: '2', title: 'Master DB Password', value: 'sUp3r_s3cr3t_P4ssw0rd!', type: 'password', date: '2023-11-15' }
    ];
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('webos_theme');
      return (saved as Theme) || 'dark';
    }
    return 'dark';
  });
  
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number; y: number} | null>(null);
  
  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem('webos_files', JSON.stringify(files));
  }, [files]);
  
  // Persist vault items to localStorage
  useEffect(() => {
    localStorage.setItem('webos_vault', JSON.stringify(vaultItems));
  }, [vaultItems]);
  
  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('webos_theme', theme);
  }, [theme]);
  
  const [windowState, dispatch] = useReducer(windowReducer, {
    windows: [],
    activeId: null,
    nextZIndex: 100
  });

  // App Definitions
  const APPS: Record<string, AppDefinition> = useMemo(() => ({
    BROWSER: { id: 'browser', title: 'Web Browser', icon: Globe, component: WebBrowser, defaultWidth: 900, defaultHeight: 600 },
    EXPLORER: { id: 'explorer', title: 'File Manager', icon: Folder, component: FileExplorer, defaultWidth: 850, defaultHeight: 550 },
    IDE: { id: 'ide', title: 'Code Studio', icon: Code, component: CodeEditorApp, defaultWidth: 900, defaultHeight: 600 }, // Added IDE
    NOTEPAD: { id: 'notepad', title: 'Notepad', icon: StickyNote, component: NotepadApp, defaultWidth: 700, defaultHeight: 500 },
    PAINT: { id: 'paint', title: 'PixelPaint', icon: Palette, component: PixelPaintApp, defaultWidth: 500, defaultHeight: 600 },
    CALCULATOR: { id: 'calculator', title: 'Calculator', icon: Calculator, component: CalculatorApp, defaultWidth: 300, defaultHeight: 450 },
    AI_ASSISTANT: { id: 'ai_assistant', title: 'AI Chat', icon: Bot, component: AIAssistant, defaultWidth: 500, defaultHeight: 600 },
    VAULT: { id: 'vault', title: 'DevVault', icon: Lock, component: DevVault, defaultWidth: 600, defaultHeight: 500 },
    PLAYER: { id: 'player', title: 'Media Player', icon: Video, component: MediaPlayer, defaultWidth: 700, defaultHeight: 500 },
    SERVICES: { id: 'services', title: 'Task Manager', icon: Monitor, component: TaskManager, defaultWidth: 750, defaultHeight: 550 },
    TERMINAL: { id: 'terminal', title: 'Terminal', icon: Terminal, component: TerminalApp, defaultWidth: 700, defaultHeight: 450 },
    SETTINGS: { id: 'settings', title: 'Settings', icon: Settings, component: SettingsApp, defaultWidth: 600, defaultHeight: 500 }
  }), []);

  // Window Management
  const openApp = useCallback((appKey: string, props = {}) => {
    const appDef = APPS[appKey];
    if (!appDef) return;
    dispatch({ type: 'OPEN', app: appDef, props });
    setStartMenuOpen(false);
  }, [APPS]);

  const closeWindow = useCallback((id: number) => {
    dispatch({ type: 'START_CLOSING', id });
    setTimeout(() => dispatch({ type: 'CLOSE', id }), 200);
  }, []);

  const handleToggleMinimize = useCallback((id: number) => {
    dispatch({ type: 'MINIMIZE', id });
  }, []);

  const handleToggleMaximize = useCallback((id: number) => {
    dispatch({ type: 'MAXIMIZE', id });
  }, []);

  const handleFocus = useCallback((id: number) => {
    dispatch({ type: 'FOCUS', id });
  }, []);

  const handleUpdatePosition = useCallback((id: number, x: number, y: number) => {
    dispatch({ type: 'UPDATE_POSITION', id, x, y });
  }, []);

  const handleUpdateSize = useCallback((id: number, w: number, h: number) => {
    dispatch({ type: 'UPDATE_SIZE', id, w, h });
  }, []);

  const openMedia = useCallback((file: FileItem) => {
    if (file.mimeType?.startsWith('text')) {
      openApp('NOTEPAD', { initialContent: '' });
      return;
    }

    const playerWindow = windowState.windows.find(w => w.appId === APPS.PLAYER.id);
    if (playerWindow) {
      dispatch({ type: 'OPEN', app: APPS.PLAYER, props: { file } });
    } else {
      openApp('PLAYER', { file });
    }
  }, [windowState.windows, APPS, openApp]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab: Cycle windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        dispatch({ type: 'CYCLE_WINDOWS' });
      }
      // Alt+F4: Close active window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (windowState.activeId) closeWindow(windowState.activeId);
      }
      // Escape: Close start menu or context menu
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowState.activeId, closeWindow]);

  // Context Menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const contextMenuItems = useMemo(() => [
    { label: 'New Folder', icon: FolderPlus, onClick: () => {} },
// ... keyboard shortcuts ...
// ... context menu ...

  // Render window content
  const renderWindowContent = useCallback((win: WindowInstance) => {
    const Component = win.component;
    
    if (win.appId === 'explorer') return <Component files={files} setFiles={setFiles} openMedia={openMedia} />;
    if (win.appId === 'services') return <Component files={files} windows={windowState.windows} />;
    if (win.appId === 'terminal') return <Component files={files} windows={windowState.windows} onClose={() => closeWindow(win.id)} setFiles={setFiles} />;
    if (win.appId === 'vault') return <Component items={vaultItems} setItems={setVaultItems} />;
    if (win.appId === 'notepad') return <Component setFiles={setFiles} {...win.props} />;
    if (win.appId === 'paint') return <Component setFiles={setFiles} {...win.props} />;
    if (win.appId === 'settings') return <Component theme={theme} setTheme={setTheme} files={files} vaultItems={vaultItems} />;
    return <Component {...win.props} />;
  }, [files, windowState.windows, vaultItems, theme, openMedia, closeWindow]);

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center overflow-hidden select-none font-sans"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop')" 
      }}
      onContextMenu={handleContextMenu}
      role="application"
      aria-label="WebOS Desktop"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      {/* Desktop Icons */}
      <div className="relative z-0 p-6 flex flex-col items-start h-[calc(100%-48px)] flex-wrap content-start gap-4">
        <DesktopIcon icon={Folder} label="My Files" color="text-yellow-400" onClick={() => openApp('EXPLORER')} />
        <DesktopIcon icon={Globe} label="Browser" color="text-blue-400" onClick={() => openApp('BROWSER')} />
        <DesktopIcon icon={Code} label="Code Studio" color="text-orange-500" onClick={() => openApp('IDE')} />
        <DesktopIcon icon={Bot} label="AI Chat" color="text-purple-400" onClick={() => openApp('AI_ASSISTANT')} />
        <DesktopIcon icon={StickyNote} label="Notepad" color="text-amber-400" onClick={() => openApp('NOTEPAD')} />
        <DesktopIcon icon={Palette} label="PixelPaint" color="text-pink-400" onClick={() => openApp('PAINT')} />
        <DesktopIcon icon={Calculator} label="Calculator" color="text-slate-200" onClick={() => openApp('CALCULATOR')} />
        <DesktopIcon icon={Lock} label="DevVault" color="text-emerald-500" onClick={() => openApp('VAULT')} />
        <DesktopIcon icon={Video} label="Media Player" color="text-pink-500" onClick={() => openApp('PLAYER')} />
        <DesktopIcon icon={Monitor} label="Task Mgr" color="text-green-500" onClick={() => openApp('SERVICES')} />
        <DesktopIcon icon={Terminal} label="Terminal" color="text-slate-700" onClick={() => openApp('TERMINAL')} />
      </div>

      {/* Windows */}
      {windowState.windows.map(win => (
        <WindowFrame 
          key={win.id} 
          app={win} 
          onClose={closeWindow} 
          onMinimize={handleToggleMinimize}
          isActive={windowState.activeId === win.id}
          onFocus={() => handleFocus(win.id)}
          onUpdatePosition={handleUpdatePosition}
          onUpdateSize={handleUpdateSize}
          onToggleMaximize={handleToggleMaximize}
        >
          {renderWindowContent(win)}
        </WindowFrame>
      ))}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          items={contextMenuItems}
        />
      )}

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="absolute bottom-12 left-2 w-64 bg-slate-800 rounded-t-lg shadow-2xl border border-slate-700 overflow-hidden z-[60] animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
            <div>
              <div className="text-white font-medium">Guest User</div>
              <div className="text-xs text-slate-400">Local Session</div>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {Object.keys(APPS).map(key => {
              const AppIcon = APPS[key].icon;
              return (
                <button 
                  key={key} 
                  onClick={() => openApp(key)} 
                  className="w-full flex items-center gap-3 p-2 hover:bg-white/10 rounded text-slate-200 text-sm transition-colors"
                >
                  <span className="p-1.5 bg-slate-700 rounded"><AppIcon size={14} /></span>
                  {APPS[key].title}
                </button>
              );
            })}
          </div>
          <div className="p-3 bg-slate-900 border-t border-slate-700 flex justify-between">
            <button 
              onClick={() => openApp('SETTINGS')}
              className="p-2 hover:bg-white/10 rounded text-slate-400 transition-colors"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 text-xs font-bold transition-colors"
            >
              RESTART
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 flex items-center px-2 z-[100] gap-2"
        role="toolbar"
        aria-label="Taskbar"
      >
        <button 
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          className={`p-2 rounded hover:bg-white/10 transition-colors ${startMenuOpen ? 'bg-white/20' : ''}`}
          aria-label="Start menu"
          aria-expanded={startMenuOpen}
        >
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-sm"></div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-1"></div>

        <div className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar">
          {windowState.windows.map(win => (
            <TaskbarItem 
              key={win.id} 
              app={win} 
              onClick={() => {
                if (win.isMinimized || windowState.activeId !== win.id) {
                  dispatch({ type: 'MINIMIZE', id: win.id });
                  handleFocus(win.id);
                } else {
                  handleToggleMinimize(win.id);
                }
              }} 
            />
          ))}
        </div>

        <div className="flex items-center gap-3 px-3 border-l border-slate-700 h-full">
          <div className="flex gap-2 text-slate-400">
            <Wifi size={16} />
            <Volume2 size={16} />
            <Battery size={16} />
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-200 font-medium">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}