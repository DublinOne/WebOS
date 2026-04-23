import React from 'react';
import { WindowInstance } from '../types';

interface TaskbarItemProps {
  app: WindowInstance;
  onClick: () => void;
}

const TaskbarItem = React.memo(({ 
  app, 
  onClick 
}: TaskbarItemProps) => {
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

export default TaskbarItem;
