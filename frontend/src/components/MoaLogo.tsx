import React, { useState } from 'react';

interface MoaLogoProps {
  className?: string;
  size?: number;
}

export const MoaLogo: React.FC<MoaLogoProps> = ({ className = 'h-10 w-10', size = 40 }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    // Official institutional emblem SVG fallback
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Ministry of Agriculture Institutional Emblem"
      >
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0B7A3B" strokeWidth="3" />
        {/* Top Sun / Gold Harvest Arc */}
        <path
          d="M 20 50 A 30 30 0 0 1 80 50 Z"
          fill="#F5B81C"
        />
        {/* Center Agricultural Green Leaves */}
        <circle cx="50" cy="46" r="14" fill="#0B7A3B" />
        <path
          d="M 50 32 C 43 40 43 52 50 60 C 57 52 57 40 50 32 Z"
          fill="#FFFFFF"
        />
        {/* Bottom Irrigation & Water Deep Blue Bands */}
        <path
          d="M 18 54 C 30 50 40 58 50 54 C 60 50 70 58 82 54 L 82 58 C 70 62 60 54 50 58 C 40 62 30 54 18 58 Z"
          fill="#145B8C"
        />
        <path
          d="M 24 64 C 34 60 42 66 50 63 C 58 60 66 66 76 63 L 76 66 C 66 69 58 63 50 66 C 42 69 34 63 24 66 Z"
          fill="#145B8C"
        />
      </svg>
    );
  }

  return (
    <img
      src="/moa-logo.png"
      alt="Ministry of Agriculture (MoA)"
      className={`${className} object-contain`}
      onError={() => setImgFailed(true)}
    />
  );
};
