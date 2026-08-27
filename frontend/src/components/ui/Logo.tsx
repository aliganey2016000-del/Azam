import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div className="w-8 h-8 rounded-lg bg-[#e26342] text-white flex items-center justify-center font-black text-lg tracking-tighter shadow-sm shrink-0">
        A
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-sm tracking-wide text-white">AZAAM</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-[#e26342] border border-white/10">
              Admin
            </span>
          </div>
          <span className="text-[10px] text-white/50 truncate tracking-tight font-medium mt-0.5">
            International Medics Network
          </span>
        </div>
      )}
    </div>
  );
};
