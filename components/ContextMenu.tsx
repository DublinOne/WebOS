import React, { useEffect } from 'react';

interface ContextMenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

const ContextMenu = ({ 
  x, 
  y, 
  onClose, 
  items 
}: ContextMenuProps) => {
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
  );
};

export default ContextMenu;
