import React from 'react';
import { Cpu, X, Activity, HardDrive, Zap } from 'lucide-react';
import { FileItem, WindowInstance } from '../types';

interface TaskManagerProps {
  files: FileItem[];
  windows: WindowInstance[];
}

const TaskManager = ({ files, windows }: TaskManagerProps) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-green-400" size={20} />
          <h2 className="font-bold tracking-tight">System Resources</h2>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CPU:</span>
            <span className="text-blue-400">{Math.floor(Math.random() * 15) + 5}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">MEM:</span>
            <span className="text-purple-400">{Math.floor(Math.random() * 500) + 1200}MB</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Resource Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Cpu size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Processor</span>
            </div>
            <div className="text-2xl font-bold">Virtual-8</div>
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[12%] animate-pulse"></div>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Zap size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Memory</span>
            </div>
            <div className="text-2xl font-bold">8GB LPDDR5</div>
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[22%] animate-pulse"></div>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <HardDrive size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Storage</span>
            </div>
            <div className="text-2xl font-bold">{files.length} Files</div>
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[5%] animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Processes Table */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Running Processes</h3>
          <div className="bg-slate-800/80 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400">
                  <th className="p-3 font-medium">PID</th>
                  <th className="p-3 font-medium">Process Name</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {windows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No user processes running</td>
                  </tr>
                ) : (
                  windows.map(win => (
                    <tr key={win.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-xs text-slate-500">{win.id.toString().slice(-5)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <win.icon size={14} className="text-blue-400" />
                          <span className="font-medium">{win.title}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          win.isMinimized ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {win.isMinimized ? 'Background' : 'Foreground'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors" title="End Task">
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
