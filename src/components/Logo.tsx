import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-emerald-950 ${className}`}>
      {/* Custom Original SVG Logo: Bridge arch + Sprouting Leaf + Rich Soil Layer */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-2 text-white shadow-sm ring-1 ring-emerald-900/10 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Soil Layer Base */}
          <path
            d="M6 34C14 31 26 31 34 34"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Bridge Arch */}
          <path
            d="M6 31C10 21 30 21 34 31"
            stroke="#a7f3d0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bridge Keystone / Support Pillars */}
          <path d="M14 26V31" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 26V31" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" />
          {/* Sprouting Agritech Leaf / Growth */}
          <path
            d="M20 22C20 15 25 10 30 9C29 14 26 19 20 22Z"
            fill="#34d399"
          />
          <path
            d="M20 22C20 16 15 12 10 11C11 16 14 20 20 22Z"
            fill="#10b981"
          />
          {/* Center Sprout Stem */}
          <path
            d="M20 24V14"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight leading-none text-emerald-950 ${textSizes[size]}`}>
            Ingoga<span className="text-emerald-700">Bridge</span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-700/80">
            Rwanda Agritech
          </span>
        </div>
      )}
    </div>
  );
};
