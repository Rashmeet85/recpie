import React from 'react'

export default function HeartDivider({ width = 280, color = '#C5A866', heartColor = '#E84376', className = '' }) {
  return (
    <svg
      width={width}
      height="16"
      viewBox="0 0 280 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line x1="20" y1="8" x2="125" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="8" r="1.5" fill={color} />

      <line x1="155" y1="8" x2="260" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="260" cy="8" r="1.5" fill={color} />

      {/* Center Heart */}
      <g transform="translate(140, 8) scale(0.75)">
        <path
          d="M0,5 C-4.5,0.5 -8,-3.5 -8,-7 C-8,-10.5 -4.5,-13 0,-9 C4.5,-13 8,-10.5 8,-7 C8,-3.5 4.5,0.5 0,5 Z"
          fill={heartColor}
        />
      </g>
    </svg>
  )
}

