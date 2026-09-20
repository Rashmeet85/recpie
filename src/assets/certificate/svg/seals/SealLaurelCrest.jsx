import React from 'react'

export default function SealLaurelCrest({ width = 110, height = 110, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 10px rgba(92, 60, 20, 0.22))' }}
    >
      <defs>
        <linearGradient id="laurelGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBA24B" />
          <stop offset="30%" stopColor="#FFF1C2" />
          <stop offset="70%" stopColor="#CBA24B" />
          <stop offset="100%" stopColor="#8A6016" />
        </linearGradient>
      </defs>

      {/* Circular Medal Base */}
      <circle cx="70" cy="70" r="54" fill="#FAF6EE" stroke="url(#laurelGold)" strokeWidth="3" />
      <circle cx="70" cy="70" r="48" fill="none" stroke="#CBA24B" strokeWidth="1" strokeDasharray="2 2" />

      {/* Classical Laurel Leaves (Left Branch) */}
      <g stroke="#996D1E" strokeWidth="0.8" fill="url(#laurelGold)">
        {/* Branch stem */}
        <path d="M 40,88 C 30,70 32,50 48,36" fill="none" stroke="#8A6016" strokeWidth="1.5" />
        {/* Leaf pairs */}
        <ellipse cx="38" cy="82" rx="4" ry="2" transform="rotate(-30 38 82)" />
        <ellipse cx="33" cy="73" rx="4.5" ry="2" transform="rotate(-15 33 73)" />
        <ellipse cx="31" cy="62" rx="4.5" ry="2" transform="rotate(0 31 62)" />
        <ellipse cx="33" cy="51" rx="4.5" ry="2" transform="rotate(20 33 51)" />
        <ellipse cx="38" cy="42" rx="4" ry="2" transform="rotate(40 38 42)" />
        <ellipse cx="46" cy="36" rx="3.5" ry="1.8" transform="rotate(60 46 36)" />
      </g>

      {/* Classical Laurel Leaves (Right Branch) */}
      <g stroke="#996D1E" strokeWidth="0.8" fill="url(#laurelGold)">
        {/* Branch stem */}
        <path d="M 100,88 C 110,70 108,50 92,36" fill="none" stroke="#8A6016" strokeWidth="1.5" />
        {/* Leaf pairs */}
        <ellipse cx="102" cy="82" rx="4" ry="2" transform="rotate(30 102 82)" />
        <ellipse cx="107" cy="73" rx="4.5" ry="2" transform="rotate(15 107 73)" />
        <ellipse cx="109" cy="62" rx="4.5" ry="2" transform="rotate(0 109 62)" />
        <ellipse cx="107" cy="51" rx="4.5" ry="2" transform="rotate(-20 107 51)" />
        <ellipse cx="102" cy="42" rx="4" ry="2" transform="rotate(-40 102 42)" />
        <ellipse cx="94" cy="36" rx="3.5" ry="1.8" transform="rotate(-60 94 36)" />
      </g>

      {/* Crown / Chef Toque Crest at Center Top */}
      <g transform="translate(70, 50) scale(0.85)">
        <path
          d="M -12,0 L -14,-10 L -6,-6 L 0,-14 L 6,-6 L 14,-10 L 12,0 Z"
          fill="url(#laurelGold)"
          stroke="#7E5615"
          strokeWidth="1"
        />
      </g>

      {/* Center Crest Text: MASTERCLASS */}
      <text
        x="70"
        y="72"
        fill="#8A244E"
        fontSize="8"
        fontWeight="800"
        fontFamily="serif"
        textAnchor="middle"
        letterSpacing="1.4"
      >
        MASTERCLASS
      </text>

      {/* Sub-text: EXCELLENCE */}
      <text
        x="70"
        y="83"
        fill="#664412"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="2"
      >
        EXCELLENCE
      </text>

      {/* Bottom Year / Star */}
      <text x="70" y="98" fill="#CBA24B" fontSize="9" textAnchor="middle">
        ★ ★ ★
      </text>
    </svg>
  )
}

