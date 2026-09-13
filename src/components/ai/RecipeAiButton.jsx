import { createPortal } from 'react-dom'

export default function RecipeAiButton({ onClick, isOpen, loading }) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Recipe AI Assistant"
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)',
        right: 20,
        zIndex: 99,
        height: 52,
        padding: '0 20px 0 16px',
        borderRadius: 26,
        border: '1px solid rgba(255, 255, 255, 0.75)',
        background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 14px 32px rgba(142, 106, 232, 0.38), 0 2px 6px rgba(255, 255, 255, 0.4) inset',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
        transform: isOpen ? 'scale(0.96)' : 'scale(1)',
        backdropFilter: 'blur(10px)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = isOpen ? 'scale(0.96)' : 'scale(1)' }}
    >
      <span
        style={{
          fontSize: 18,
          lineHeight: 1,
          animation: loading ? 'spin 1.2s linear infinite' : 'none',
          display: 'inline-block',
        }}
      >
        {loading ? '🪄' : '✨'}
      </span>
      <span>{loading ? 'Working…' : 'AI Assistant'}</span>
    </button>,
    document.body
  )
}

