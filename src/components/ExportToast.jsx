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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 'min(320px, 100%)',
          padding: '26px 22px 22px',
          borderRadius: 28,
          background: 'rgba(255,255,255,0.94)',
          border: error ? '1px solid rgba(224,90,58,0.28)' : '1px solid rgba(157,124,255,0.28)',
          boxShadow: '0 24px 70px rgba(68, 43, 128, 0.28)',
          backdropFilter: 'blur(24px) saturate(1.25)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.25)',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            margin: '0 auto 16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: error
              ? 'rgba(224,90,58,0.14)'
              : 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
            color: error ? '#c24a2d' : 'white',
            fontSize: 42,
            fontWeight: 900,
            boxShadow: error ? 'none' : '0 16px 36px rgba(142,106,232,0.34)',
          }}
        >
          {error ? '!' : '✓'}
        </div>
        <p
          style={{
            margin: '0 0 6px',
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--charcoal)',
            lineHeight: 1.15,
          }}
        >
          {error ? 'Export Failed' : 'Downloaded'}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--warm-gray)',
          }}
        >
          {message}
        </p>
      </div>
    </div>,
    document.body,
  )
}
