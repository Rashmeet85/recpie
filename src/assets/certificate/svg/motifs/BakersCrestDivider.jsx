import React from 'react'

export default function BakersCrestDivider({ width = 280, color = '#C5A866', className = '' }) {
  return (
    <svg
      width={width}
      height="22"
      viewBox="0 0 280 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left gold line */}
      <line x1="10" y1="11" x2="120" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="10" cy="11" r="2" fill={color} />

      {/* Right gold line */}
      <line x1="160" y1="11" x2="270" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="270" cy="11" r="2" fill={color} />

      {/* Center crossed whisk and rolling pin */}
      <g transform="translate(140, 11) scale(0.7)">
        {/* Whisk at 45 deg */}
        <g transform="rotate(45)">
          <line x1="0" y1="-12" x2="0" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="0" cy="-6" rx="4" ry="7" stroke={color} strokeWidth="1.2" fill="none" />
        </g>
        {/* Rolling pin at -45 deg */}
        <g transform="rotate(-45)">
          <rect x="-2" y="-12" width="4" height="24" rx="2" fill={color} />
          <circle cx="0" cy="-14" r="1.5" fill={color} />
          <circle cx="0" cy="14" r="1.5" fill={color} />
        </g>
        {/* Center sparkling star */}
        <circle cx="0" cy="0" r="2" fill="#E84376" />
      </g>
    </svg>
  )
}

