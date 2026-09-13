import { createPortal } from 'react-dom'
import { useStore } from '../../store/useStore'

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
}

export default function RecipeAiButton({ onClick, isOpen, loading }) {
  const { canUseAi } = useStore()
  if (typeof document === 'undefined' || !canUseAi) return null

  return createPortal(
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="AI Recipe Assistant"
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)',
        right: 20,
        zIndex: 99,
        width: 50,
        height: 50,
        borderRadius: '50%',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 28px rgba(142, 106, 232, 0.42), 0 2px 6px rgba(255, 255, 255, 0.45) inset',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
        transform: isOpen ? 'rotate(20deg) scale(0.96)' : 'rotate(0deg) scale(1)',
        backdropFilter: 'blur(10px)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = isOpen ? 'rotate(20deg) scale(0.96)' : 'scale(1)' }}
    >
      {loading ? (
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
          }}
        >
          🪄
        </span>
      ) : (
        <SparkleIcon />
      )}
    </button>,
    document.body
  )
}

