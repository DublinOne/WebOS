import React from 'react';

interface DesktopIconProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

const DesktopIcon = React.memo(({ 
  icon: Icon, 
  label, 
  onClick, 
  color = "text-blue-500" 
}: DesktopIconProps) => (
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

export default DesktopIcon;
