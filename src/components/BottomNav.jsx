import { useStore } from '../store/useStore'

const NAV_ITEMS = [
  { id: 'library', icon: BookIcon, label: 'Library' },
  { id: 'add', icon: PlusIcon, label: 'Add', isFab: true },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
]

function BookIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
function SettingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

export default function BottomNav() {
  const { currentPage, setPage } = useStore()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(249,243,238,0.85)',
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      borderTop: '1px solid rgba(201,169,110,0.2)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 64,
    }} className="no-print">
      {NAV_ITEMS.map(item => {
        if (item.isFab) {
          return (
            <button
              key={item.id}
              onClick={() => setPage('add')}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4886a, #b8614a)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 16px rgba(212,136,106,0.45)',
                transform: currentPage === 'add' ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <PlusIcon />
            </button>
          )
        }
        const isActive = currentPage === item.id
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              flex: 1, height: '100%', border: 'none', background: 'none',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              color: isActive ? 'var(--rose)' : 'var(--light-warm)',
              transition: 'color 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ 
              transform: isActive ? 'scale(1.1)' : 'scale(1)', 
              transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'block' 
            }}>
              <Icon active={isActive} />
            </span>
            <span style={{ 
              fontSize: 10, fontWeight: isActive ? 600 : 400, 
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.04em'
            }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 2px)',
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--rose)'
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
