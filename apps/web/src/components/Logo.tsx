import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textVisible?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconSize = 40, // Increased default size
  textVisible = true,
}) => {
  const boxSize = Math.round(iconSize * 1.4);

  const handleClick = () => {
    const token = localStorage.getItem('project-mccaren_token');
    if (token) {
      window.location.hash = '#/app/dashboard';
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all ${className}`}
    >
      {/* Icon — McLaren Swoosh + Medical Cross */}
      <div
        style={{ width: boxSize, height: boxSize }}
        className="relative rounded-[12px] bg-gradient-to-br from-[#FF8000] to-[#CC6600] shadow-xl shadow-[#FF8000]/40 flex items-center justify-center flex-shrink-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10 rounded-[12px]" />

        <svg
          width={Math.round(iconSize * 0.9)}
          height={Math.round(iconSize * 0.9)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Medical Cross (White) */}
          <rect x="10" y="3" width="4" height="18" rx="1.5" fill="white" fillOpacity="0.95" />
          <rect x="3" y="10" width="18" height="4" rx="1.5" fill="white" fillOpacity="0.95" />
          
          {/* McLaren style Swoosh (Gold) overlaying the cross */}
          <path
            d="M 4 20 Q 12 20 18 10 Q 16 16 2 16"
            fill="#FFD700"
            opacity="0.95"
            transform="translate(1, -2) rotate(-10 12 12)"
          />
        </svg>
      </div>

      {/* Big Wordmark */}
      {textVisible && (
        <span
          className="font-extrabold tracking-tighter text-white italic drop-shadow-md"
          style={{
            fontSize: Math.round(iconSize * 0.8), // Very large text relative to icon
            letterSpacing: '-0.02em',
            transform: 'skewX(-6deg)'
          }}
        >
          Project <span style={{ color: '#FF8000' }}>McCaren</span>
        </span>
      )}
    </div>
  );
};
