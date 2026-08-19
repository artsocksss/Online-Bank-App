import React from 'react';

interface RaifLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RaifLogo: React.FC<RaifLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
    xl: 'w-16 h-16 rounded-3xl text-xl',
  };

  return (
    <div
      className={`bg-[#EEAA00] text-black font-black flex items-center justify-center shadow-md shadow-[#EEAA00]/25 select-none shrink-0 relative overflow-hidden ${sizeClasses[size]} ${className}`}
      title="АТ «Райффайзен Банк»"
    >
      {/* Official Raiffeisen Gable Cross Symbol (Crossed Hammer Heads) */}
      <svg
        viewBox="0 0 100 100"
        className="w-3/4 h-3/4 fill-current text-black"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top House Gable */}
        <polygon points="50,10 85,45 73,45 50,22 27,45 15,45" />
        {/* Bottom Inverted House Gable */}
        <polygon points="50,90 85,55 73,55 50,78 27,55 15,55" />
        {/* Left Side Gable */}
        <polygon points="10,50 45,85 45,73 22,50 45,27 45,15" />
        {/* Right Side Gable */}
        <polygon points="90,50 55,85 55,73 78,50 55,27 55,15" />
        {/* Center Diamond */}
        <polygon points="50,38 62,50 50,62 38,50" />
      </svg>
    </div>
  );
};
