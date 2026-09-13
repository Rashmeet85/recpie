import { useStore } from '../store/useStore'
import { useTimerStore } from '../store/useTimerStore'

const NAV_ITEMS = [
  { id: 'library', icon: BookIcon, label: 'Recipes' },
  { id: 'orders', icon: OrdersIcon, label: 'Orders' },
  { id: 'add', icon: PlusIcon, label: 'Add', isFab: true },
  { id: 'timer', icon: TimerIcon, label: 'Timer' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
]

function BookIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}
function OrdersIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20" />
      <path d="M7 8v2" />
      <path d="M12 8v2" />
      <path d="M17 8v2" />
      <path d="M7 4h.01" />
      <path d="M12 4h.01" />
      <path d="M17 4h.01" />
    </svg>
  )
}
function TimerIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3L2 6" />
      <path d="M22 6l-3-3" />
      <path d="M12 2v3" />
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
  const { currentPage, setPage, isAdmin, getTodayPendingOrdersCount } = useStore()
  const todayOrdersCount = getTodayPendingOrdersCount ? getTodayPendingOrdersCount() : 0
  const activeTimersCount = useTimerStore((s) => s.getActiveRunningCount ? s.getActiveRunningCount() : 0)
  const navItems = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter(item => !item.isFab)

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(255,255,255,0.42)',
      backdropFilter: 'blur(28px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
      borderTop: '1px solid rgba(255,255,255,0.5)',
      boxShadow: '0 -12px 30px rgba(86, 61, 160, 0.08)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 64,
    }} className="no-print">
      {navItems.map(item => {
        if (item.isFab) {
          return (
            <button
              key={item.id}
              onClick={() => setPage('add')}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                boxShadow: '0 12px 28px rgba(142, 106, 232, 0.34)',
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
              display: 'block',
              position: 'relative',
            }}>
              <Icon active={isActive} />
              {item.id === 'orders' && todayOrdersCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -7,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: '#ff4d6d',
                    color: 'white',
                    fontSize: 9.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 6px rgba(255, 77, 109, 0.4)',
                  }}
                >
                  {todayOrdersCount}
                </span>
              )}
              {item.id === 'timer' && activeTimersCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -7,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
                    color: 'white',
                    fontSize: 9.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 6px rgba(142, 106, 232, 0.4)',
                  }}
                >
                  {activeTimersCount}
                </span>
              )}
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
