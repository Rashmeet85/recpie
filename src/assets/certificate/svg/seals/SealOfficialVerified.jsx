import React from 'react'

export default function SealOfficialVerified({ width = 110, height = 110, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 10px rgba(138, 36, 78, 0.22))' }}
    >
      <defs>
        <linearGradient id="rubyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="40%" stopColor="#F9E29D" />
          <stop offset="70%" stopColor="#C5A028" />
          <stop offset="100%" stopColor="#8C6D14" />
        </linearGradient>

        <linearGradient id="roseStampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9E1B4D" />
          <stop offset="100%" stopColor="#690E30" />
        </linearGradient>
      </defs>

      {/* Scalloped Gold Perimeter */}
      <circle cx="70" cy="70" r="56" fill="url(#rubyGold)" />

      {/* Crimson/Ruby Core Stamp */}
      <circle cx="70" cy="70" r="49" fill="url(#roseStampGrad)" stroke="#FAF6EE" strokeWidth="1.5" />
      <circle cx="70" cy="70" r="45" fill="none" stroke="url(#rubyGold)" strokeWidth="1" strokeDasharray="3 2" />

      {/* Center Whisk & Heart Icon */}
      <g transform="translate(70, 64) scale(0.9)">
        {/* Heart */}
        <path
          d="M0,7 C-5,2 -9,-3 -9,-7 C-9,-11 -5,-14 0,-9 C5,-14 9,-11 9,-7 C9,-3 5,2 0,7 Z"
          fill="#FAF6EE"
        />
        {/* Golden Crown on top */}
        <path
          d="M -7,-14 L -9,-19 L -4,-17 L 0,-21 L 4,-17 L 9,-19 L 7,-14 Z"
          fill="url(#rubyGold)"
        />
      </g>

      {/* Curved Circular Text Path (Upper: KAUR'S CAKERY) */}
      <path id="cakerySealArc" d="M 32,70 A 38,38 0 0,1 108,70" fill="none" />
      <text fill="#FFF3D4" fontSize="7" fontWeight="800" letterSpacing="2.8">
        <textPath href="#cakerySealArc" startOffset="50%" textAnchor="middle">
          ★ KAUR&apos;S CAKERY ★
        </textPath>
      </text>

      {/* Lower Banner: BAKING DREAMS */}
      <text
        x="70"
        y="86"
        fill="#FAF6EE"
        fontSize="6.5"
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="1.8"
      >
        OFFICIAL SEAL
      </text>

      <text
        x="70"
        y="96"
        fill="#F9E29D"
        fontSize="5.5"
        fontWeight="600"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        VERIFIED • 100%
      </text>
    </svg>
  )
}

