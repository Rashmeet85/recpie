import React from 'react'

export default function SealGoldRibbon({ width = 120, height = 120, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 6px 12px rgba(92, 60, 20, 0.28))' }}
    >
      <defs>
        {/* Luxury Gold Gradients */}
        <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9933B" />
          <stop offset="25%" stopColor="#F7E5A9" />
          <stop offset="50%" stopColor="#D8A243" />
          <stop offset="75%" stopColor="#FFECC0" />
          <stop offset="100%" stopColor="#B37D28" />
        </linearGradient>

        <linearGradient id="darkGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#96681E" />
          <stop offset="50%" stopColor="#C9933B" />
          <stop offset="100%" stopColor="#7E5615" />
        </linearGradient>

        <linearGradient id="ribbonTailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B37D28" />
          <stop offset="50%" stopColor="#E2B45A" />
          <stop offset="100%" stopColor="#8C5C15" />
        </linearGradient>
      </defs>

      {/* Hanging Ribbons Behind the Medal */}
      <g>
        {/* Left Ribbon Tail */}
        <path
          d="M62 95 L40 148 L58 140 L76 150 L68 95 Z"
          fill="url(#ribbonTailGrad)"
          stroke="#7A5214"
          strokeWidth="1"
        />
        {/* Right Ribbon Tail */}
        <path
          d="M98 95 L120 148 L102 140 L84 150 L92 95 Z"
          fill="url(#ribbonTailGrad)"
          stroke="#7A5214"
          strokeWidth="1"
        />
        {/* Ribbon Fold Shadows */}
        <path d="M62 95 L68 115 L76 98 Z" fill="rgba(0,0,0,0.25)" />
        <path d="M98 95 L92 115 L84 98 Z" fill="rgba(0,0,0,0.25)" />
      </g>

      {/* Outer 16-Point Scalloped Gold Medal Body */}
      <circle cx="80" cy="74" r="54" fill="url(#goldRibbonGrad)" stroke="#8C5C15" strokeWidth="1.5" />

      {/* Inner Decorative Pinstripe Rings */}
      <circle cx="80" cy="74" r="48" fill="none" stroke="#7E5615" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="80" cy="74" r="44" fill="url(#darkGoldGrad)" />
      <circle cx="80" cy="74" r="41" fill="#FAF6EE" stroke="#C9933B" strokeWidth="1.5" />

      {/* Centered Star of Distinction */}
      <g transform="translate(80, 62)">
        {/* Big Center Star */}
        <polygon
          points="0,-13 4,-4 13,-4 6,2 9,11 0,6 -9,11 -6,2 -13,-4 -4,-4"
          fill="url(#goldRibbonGrad)"
          stroke="#8C5C15"
          strokeWidth="0.8"
        />
      </g>

      {/* Flanking Small Stars */}
      <g transform="translate(62, 74) scale(0.6)">
        <polygon
          points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
          fill="#D8A243"
        />
      </g>
      <g transform="translate(98, 74) scale(0.6)">
        <polygon
          points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3"
          fill="#D8A243"
        />
      </g>

      {/* Curved Upper Text: CERTIFIED */}
      <path id="certTextArc" d="M 46,74 A 34,34 0 0,1 114,74" fill="none" />
      <text fill="#664412" fontSize="7" fontWeight="800" letterSpacing="2.5">
        <textPath href="#certTextArc" startOffset="50%" textAnchor="middle">
          ★ CERTIFIED ★
        </textPath>
      </text>

      {/* Lower Banner Text: PASTRY ARTISAN */}
      <text
        x="80"
        y="91"
        fill="#7A1C54"
        fontSize="6.5"
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        PASTRY ARTISAN
      </text>
    </svg>
  )
}

