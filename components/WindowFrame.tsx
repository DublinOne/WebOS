import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Minus, Maximize2, X } from 'lucide-react';
import { WindowInstance } from '../types';

interface WindowFrameProps {
  app: WindowInstance;
  onClose: (id: number) => void;
  onMinimize: (id: number) => void;
  children: React.ReactNode;
  isActive: boolean;
  onFocus: () => void;
  onUpdatePosition: (id: number, x: number, y: number) => void;
  onUpdateSize: (id: number, w: number, h: number) => void;
  onToggleMaximize: (id: number) => void;
}

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
}: WindowFrameProps) => {
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
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        const threshold = 15;
        const w = window.innerWidth;
        const h = window.innerHeight - 48; // Taskbar height

        // Quadrant & Edge Snapping
        if (e.clientY < threshold) {
          if (e.clientX < threshold) {
            // Top-Left
            onUpdatePosition(app.id, 0, 0);
            onUpdateSize(app.id, w / 2, h / 2);
            setDragging(false);
          } else if (e.clientX > w - threshold) {
            // Top-Right
            onUpdatePosition(app.id, w / 2, 0);
            onUpdateSize(app.id, w / 2, h / 2);
            setDragging(false);
          } else {
            // Top (Maximize)
            onToggleMaximize(app.id);
            setDragging(false);
          }
        } else if (e.clientY > h - threshold) {
          if (e.clientX < threshold) {
            // Bottom-Left
            onUpdatePosition(app.id, 0, h / 2);
            onUpdateSize(app.id, w / 2, h / 2);
            setDragging(false);
          } else if (e.clientX > w - threshold) {
            // Bottom-Right
            onUpdatePosition(app.id, w / 2, h / 2);
            onUpdateSize(app.id, w / 2, h / 2);
            setDragging(false);
          }
        } else if (e.clientX < threshold) {
          // Left snap
          onUpdatePosition(app.id, 0, 0);
          onUpdateSize(app.id, w / 2, h);
          setDragging(false);
        } else if (e.clientX > w - threshold) {
          // Right snap
          onUpdatePosition(app.id, w / 2, 0);
          onUpdateSize(app.id, w / 2, h);
          setDragging(false);
        } else {
          onUpdatePosition(app.id, newX, newY);
        }
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
        height: app.isMaximized ? 'calc(100% - 48px)' : app.h,
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

export default WindowFrame;
