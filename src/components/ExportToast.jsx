import { createPortal } from 'react-dom'

export default function ExportToast({ message, error = false }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'calc(14px + env(safe-area-inset-top)) 14px 14px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 'min(340px, 100%)',
          padding: '12px 14px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.94)',
          border: error ? '1px solid rgba(224,90,58,0.28)' : '1px solid rgba(157,124,255,0.28)',
          boxShadow: '0 14px 36px rgba(68,43,128,0.16)',
          backdropFilter: 'blur(18px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-body)',
          animation: 'fadeUp 0.25s cubic-bezier(0.4,0,0.2,1) both',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: error
              ? 'rgba(224,90,58,0.14)'
              : 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
            color: error ? '#c24a2d' : 'white',
            fontSize: 17,
            fontWeight: 900,
            boxShadow: error ? 'none' : '0 8px 18px rgba(142,106,232,0.22)',
            flexShrink: 0,
          }}
        >
          {error ? '!' : 'OK'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 2px',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--charcoal)',
              lineHeight: 1.2,
            }}
          >
            {error ? 'Export failed' : 'Done'}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.35,
              color: 'var(--warm-gray)',
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
