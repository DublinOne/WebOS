import React from 'react';
import { WindowInstance } from '../types';
import { X } from 'lucide-react';

interface TaskViewProps {
  windows: WindowInstance[];
  onClose: () => void;
  onFocusWindow: (id: number) => void;
  onCloseWindow: (id: number) => void;
}

const TaskView = ({ 
  windows, 
  onClose, 
  onFocusWindow, 
  onCloseWindow 
}: TaskViewProps) => {
  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-light text-white tracking-tight">Activities</h1>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
            {windows.map(win => (
              <div 
                key={win.id}
                className="group relative flex flex-col gap-3"
              >
                <div 
                  onClick={() => { onFocusWindow(win.id); onClose(); }}
                  className="aspect-video bg-slate-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl hover:border-blue-500/50 hover:scale-[1.02] transition-all cursor-pointer relative"
                >
                  {/* Window Preview Placeholder */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-6 bg-slate-800 flex items-center px-3 gap-2 border-b border-white/5">
                      <win.icon size={12} className="text-blue-400" />
                      <span className="text-[10px] text-slate-400 font-medium truncate">{win.title}</span>
                    </div>
                    <div className="flex-1 bg-slate-900/50 flex items-center justify-center">
                       <win.icon size={48} className="text-slate-700 opacity-20" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onCloseWindow(win.id); }}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <win.icon size={16} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-200 truncate">{win.title}</span>
                </div>
              </div>
            ))}

            {windows.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500">
                <p className="text-lg">No active windows</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskView;
