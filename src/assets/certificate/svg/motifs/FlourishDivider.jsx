import React from 'react'

export default function FlourishDivider({ width = 280, color = '#C5A866', className = '' }) {
  return (
    <svg
      width={width}
      height="18"
      viewBox="0 0 280 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center diamond/floral bud */}
      <polygon points="140,4 144,9 140,14 136,9" fill={color} />
      <circle cx="140" cy="9" r="1.5" fill="#FAF7F2" />

      {/* Left side flourish swirl */}
      <path
        d="M132,9 C120,9 116,4 104,4 C92,4 88,14 76,14 C68,14 62,9 45,9 L10,9"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="104" cy="4" r="2" fill={color} />
      <circle cx="76" cy="14" r="1.5" fill={color} />
      <circle cx="10" cy="9" r="2" fill={color} />

      {/* Right side flourish swirl */}
      <path
        d="M148,9 C160,9 164,4 176,4 C188,4 192,14 204,14 C212,14 218,9 235,9 L270,9"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="176" cy="4" r="2" fill={color} />
      <circle cx="204" cy="14" r="1.5" fill={color} />
      <circle cx="270" cy="9" r="2" fill={color} />
    </svg>
  )
}

