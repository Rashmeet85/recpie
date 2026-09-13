import { createPortal } from 'react-dom'

export default function PhotoLightbox({ isOpen, photoUrl, title, subtitle, onClose }) {
  if (!isOpen || !photoUrl || typeof document === 'undefined') return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 12, 28, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Top bar with title and close button */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 'calc(env(safe-area-inset-top) + 16px) 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          color: 'white',
          zIndex: 2,
        }}
      >
        <div style={{ minWidth: 0, flex: 1, marginRight: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title || 'Reference Photo'}
          </h3>
          {subtitle && (
            <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.8, fontFamily: 'var(--font-body)' }}>
              {subtitle}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
          aria-label="Close photo"
        >
          ✕
        </button>
      </div>

      {/* Main Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '82vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={photoUrl}
          alt={title || 'Cake Reference'}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        />
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          margin: 0,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12,
          fontFamily: 'var(--font-body)',
        }}
      >
        Tap anywhere to close
      </p>
    </div>,
    document.body
  )
}

