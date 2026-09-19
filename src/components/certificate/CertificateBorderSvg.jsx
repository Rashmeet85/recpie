export default function CertificateBorderSvg({ color = '#C5A866', secondaryColor = '#DFC68C', className = '' }) {
  // 1024 x 740 landscape A4 canvas
  return (
    <svg
      viewBox="0 0 1024 740"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Outer Border with Inward Scalloped Corners */}
      <path
        d="
          M 46,18
          L 978,18
          C 986,18 994,22 998,28
          C 994,36 994,44 1006,46
          L 1006,694
          C 994,696 994,704 998,712
          C 994,718 986,722 978,722
          L 46,722
          C 38,722 30,718 26,712
          C 30,704 30,696 18,694
          L 18,46
          C 30,44 30,36 26,28
          C 30,22 38,18 46,18
          Z
        "
        stroke={color}
        strokeWidth="2.2"
        fill="none"
      />

      {/* Inner Thin Border */}
      <path
        d="
          M 56,28
          L 968,28
          C 976,28 984,34 986,40
          C 980,48 980,56 994,58
          L 994,682
          C 980,684 980,692 986,700
          C 984,706 976,712 968,712
          L 56,712
          C 48,712 40,706 38,700
          C 44,692 44,684 30,682
          L 30,58
          C 44,56 44,48 38,40
          C 40,34 48,28 56,28
          Z
        "
        stroke={secondaryColor}
        strokeWidth="1.2"
        fill="none"
        opacity="0.9"
      />

      {/* Top-Left Corner Filigree Ornament */}
      <g transform="translate(20, 20)">
        <path
          d="M 6,6 C 16,10 24,18 28,28 C 22,24 14,24 8,28 C 10,20 8,14 6,6 Z"
          fill={color}
          opacity="0.85"
        />
        <circle cx="16" cy="16" r="2.5" fill={color} />
        <path
          d="M 4,32 C 12,30 20,24 24,16 C 30,24 32,32 30,40"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Top-Right Corner Filigree Ornament */}
      <g transform="translate(1004, 20) scale(-1, 1)">
        <path
          d="M 6,6 C 16,10 24,18 28,28 C 22,24 14,24 8,28 C 10,20 8,14 6,6 Z"
          fill={color}
          opacity="0.85"
        />
        <circle cx="16" cy="16" r="2.5" fill={color} />
        <path
          d="M 4,32 C 12,30 20,24 24,16 C 30,24 32,32 30,40"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Bottom-Left Corner Filigree Ornament */}
      <g transform="translate(20, 720) scale(1, -1)">
        <path
          d="M 6,6 C 16,10 24,18 28,28 C 22,24 14,24 8,28 C 10,20 8,14 6,6 Z"
          fill={color}
          opacity="0.85"
        />
        <circle cx="16" cy="16" r="2.5" fill={color} />
        <path
          d="M 4,32 C 12,30 20,24 24,16 C 30,24 32,32 30,40"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Bottom-Right Corner Filigree Ornament */}
      <g transform="translate(1004, 720) scale(-1, -1)">
        <path
          d="M 6,6 C 16,10 24,18 28,28 C 22,24 14,24 8,28 C 10,20 8,14 6,6 Z"
          fill={color}
          opacity="0.85"
        />
        <circle cx="16" cy="16" r="2.5" fill={color} />
        <path
          d="M 4,32 C 12,30 20,24 24,16 C 30,24 32,32 30,40"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

