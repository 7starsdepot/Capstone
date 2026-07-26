import React from 'react';

interface SdoLogoProps {
  className?: string;
  size?: number;
}

export const SdoLogo: React.FC<SdoLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`shrink-0 ${className}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Department of Education - Division of Ligao City Official Seal Logo"
    >
      <defs>
        {/* Flame Gradient */}
        <linearGradient id="flameGradOfficial" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="85%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Circular path for upper text: DEPARTMENT OF EDUCATION */}
        <path id="upperTextArc" d="M 18.5, 100 A 81.5,81.5 0 0,1 181.5,100" />

        {/* Circular path for lower text: DIVISION OF LIGAO CITY */}
        <path id="lowerTextArc" d="M 181.5, 100 A 81.5,81.5 0 0,1 18.5,100" />

        {/* Clip Path for Inner Seal Artwork */}
        <clipPath id="innerCircleClip">
          <circle cx="100" cy="100" r="64" />
        </clipPath>
      </defs>

      {/* Outer Thick Black Rim */}
      <circle cx="100" cy="100" r="98" fill="#FFE600" stroke="#000000" strokeWidth="4" />

      {/* Inner Black Divider Circle */}
      <circle cx="100" cy="100" r="65" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />

      {/* Upper Text: DEPARTMENT OF EDUCATION */}
      <text fill="#000000" fontSize="13.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">
        <textPath href="#upperTextArc" startOffset="50%" textAnchor="middle">
          DEPARTMENT OF EDUCATION
        </textPath>
      </text>

      {/* Lower Text: DIVISION OF LIGAO CITY */}
      <text fill="#000000" fontSize="13.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">
        <textPath href="#lowerTextArc" startOffset="50%" textAnchor="middle">
          DIVISION OF LIGAO CITY
        </textPath>
      </text>

      {/* Left and Right Green Circle Separators */}
      <g stroke="#000000" strokeWidth="1.5">
        {/* Left Green Circle Icon */}
        <circle cx="28" cy="100" r="7" fill="#22C55E" />
        <line x1="23" y1="105" x2="33" y2="95" stroke="#000000" strokeWidth="1.5" />

        {/* Right Green Circle Icon */}
        <circle cx="172" cy="100" r="7" fill="#22C55E" />
        <line x1="167" y1="105" x2="177" y2="95" stroke="#000000" strokeWidth="1.5" />
      </g>

      {/* INNER SEAL ARTWORK (Clipped to Inner Circle) */}
      <g clipPath="url(#innerCircleClip)">
        {/* Sky / Base Background */}
        <rect x="30" y="30" width="140" height="140" fill="#FEF3C7" />

        {/* Sunburst Rays Fan */}
        <g fill="#F59E0B" opacity="0.85">
          <polygon points="100,60 40,35 55,35" />
          <polygon points="100,60 68,35 84,35" />
          <polygon points="100,60 96,35 110,35" />
          <polygon points="100,60 124,35 140,35" />
          <polygon points="100,60 152,35 165,38" />
        </g>
        <g fill="#FBBF24">
          <polygon points="100,60 55,35 68,35" />
          <polygon points="100,60 84,35 96,35" />
          <polygon points="100,60 110,35 124,35" />
          <polygon points="100,60 140,35 152,35" />
        </g>

        {/* Left Green Mountain (Mount Mayon) */}
        <path d="M 30 130 L 62 76 L 102 125 Z" fill="#15803D" stroke="#000000" strokeWidth="1.2" />

        {/* Lake / Water at base of Left Mountain */}
        <path d="M 32 122 C 45 115, 60 118, 72 125 L 72 135 L 32 135 Z" fill="#2563EB" stroke="#000000" strokeWidth="1" />
        {/* Water Ripple Details */}
        <path d="M 36 126 Q 48 123 58 127" stroke="#93C5FD" strokeWidth="1" fill="none" />
        <path d="M 42 130 Q 52 128 62 131" stroke="#93C5FD" strokeWidth="1" fill="none" />

        {/* Right Green Mountain */}
        <path d="M 92 125 L 138 72 L 170 118 Z" fill="#22C55E" stroke="#000000" strokeWidth="1.2" />

        {/* White Fluffy Clouds on Right Sky */}
        <g fill="#FFFFFF" stroke="#000000" strokeWidth="1">
          <path d="M 135 88 C 130 82, 142 76, 148 78 C 152 72, 164 74, 166 82 C 172 84, 172 92, 165 94 C 160 96, 138 96, 135 88 Z" />
        </g>

        {/* White Cloud Base / Ground Fill behind 2003 & REGION V */}
        <path
          d="M 30 132 C 48 124, 75 122, 100 126 C 125 122, 152 124, 170 132 L 170 170 L 30 170 Z"
          fill="#FFFFFF"
        />

        {/* Center Torch of Knowledge */}
        <g stroke="#000000" strokeWidth="1.2">
          {/* Torch Handle / Column */}
          <path d="M 96 82 L 104 82 L 102 110 L 98 110 Z" fill="#D97706" />
          {/* Torch Ribs */}
          <line x1="97" y1="90" x2="103" y2="90" stroke="#000000" strokeWidth="1" />
          <line x1="97" y1="98" x2="103" y2="98" stroke="#000000" strokeWidth="1" />

          {/* Torch Bowl / Cup */}
          <path d="M 91 70 L 109 70 L 104 82 L 96 82 Z" fill="#EAB308" />
          <path d="M 91 70 Q 100 73 109 70" fill="none" stroke="#000000" strokeWidth="1" />

          {/* Flame */}
          <path
            d="M 100 42 C 112 56 114 70 106 74 C 102 77 98 77 94 74 C 86 70 88 56 100 42 Z"
            fill="url(#flameGradOfficial)"
          />
          <path
            d="M 100 52 C 106 60 108 68 103 72 C 101 73 99 73 97 72 C 92 68 94 60 100 52 Z"
            fill="#FEF08A"
            stroke="none"
          />
        </g>

        {/* Open Book of Education (Over torch stem) */}
        <g stroke="#000000" strokeWidth="2">
          {/* Left Page */}
          <path d="M 54 98 Q 78 92 98 97 L 98 122 Q 78 116 54 122 Z" fill="#FFFFFF" />
          {/* Right Page */}
          <path d="M 146 98 Q 122 92 102 97 L 102 122 Q 122 116 146 122 Z" fill="#FFFFFF" />
          {/* Center Spine */}
          <path d="M 100 97 L 100 123" stroke="#000000" strokeWidth="2.5" />
        </g>

        {/* Student Figures inside the Open Book */}
        <g stroke="#000000" strokeWidth="1">
          {/* Student 1 (Far Left - Blue) */}
          <path d="M 62 103 C 62 100, 68 100, 68 103 C 68 105, 62 105, 62 103 Z" fill="#1E293B" />
          <circle cx="65" cy="104" r="2.5" fill="#FED7AA" stroke="none" />
          <path d="M 60 118 C 60 110, 70 110, 70 118 Z" fill="#2563EB" />

          {/* Student 2 (Middle Left - Yellow) */}
          <path d="M 77 101 C 77 98, 83 98, 83 101 C 83 103, 77 103, 77 101 Z" fill="#1E293B" />
          <circle cx="80" cy="102" r="2.5" fill="#FED7AA" stroke="none" />
          <path d="M 75 117 C 75 109, 85 109, 85 117 Z" fill="#EAB308" />

          {/* Student 3 (Middle Right - Green) */}
          <path d="M 117 101 C 117 98, 123 98, 123 101 C 123 103, 117 103, 117 101 Z" fill="#1E293B" />
          <circle cx="120" cy="102" r="2.5" fill="#FED7AA" stroke="none" />
          <path d="M 115 117 C 115 109, 125 109, 125 117 Z" fill="#22C55E" />

          {/* Student 4 (Far Right - Red) */}
          <path d="M 132 103 C 132 100, 138 100, 138 103 C 138 105, 132 105, 132 103 Z" fill="#1E293B" />
          <circle cx="135" cy="104" r="2.5" fill="#FED7AA" stroke="none" />
          <path d="M 130 118 C 130 110, 140 110, 140 118 Z" fill="#DC2626" />
        </g>

        {/* Text 2003 below book */}
        <text
          x="100"
          y="138"
          fill="#000000"
          fontSize="17"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          2003
        </text>

        {/* Text REGION V below 2003 */}
        <text
          x="100"
          y="149"
          fill="#000000"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          REGION V
        </text>
      </g>
    </svg>
  );
};

