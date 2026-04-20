import { useEffect } from 'react'
import { useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import LibraryPage from './pages/LibraryPage'
import AddRecipePage from './pages/AddRecipePage'
import RecipeViewPage from './pages/RecipeViewPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { currentPage, init, initInstallPromptListener, authReady, user, signIn, authError } = useStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    initInstallPromptListener()
  }, [initInstallPromptListener])

  const renderPage = () => {
    const style = { opacity: 0, animationDuration: '0.35s', minHeight: '100dvh' }

    if (!authReady) {
      return <LoadingScreen />
    }

    if (!user) {
      return <SignInScreen signIn={signIn} authError={authError} />
    }

    switch (currentPage) {
      case 'add':
        return <div key="add" className="animate-fade-up" style={style}><AddRecipePage /></div>
      case 'view':
        return <div key="view" className="animate-fade-up" style={style}><RecipeViewPage /></div>
      case 'settings':
        return <div key="settings" className="animate-fade-up" style={style}><SettingsPage /></div>
      default:
        return <div key="library" className="animate-fade-up" style={style}><LibraryPage /></div>
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `
          radial-gradient(ellipse at 10% 0%, rgba(255, 197, 234, 0.62) 0%, transparent 48%),
          radial-gradient(ellipse at 100% 100%, rgba(175, 191, 255, 0.42) 0%, transparent 50%),
          linear-gradient(180deg, #faf8ff 0%, #f1efff 100%)
        `,
        paddingBottom: user ? 'calc(64px + env(safe-area-inset-bottom))' : 0,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(255, 206, 236, 0.26)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 100,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(173, 194, 255, 0.22)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(10px)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{renderPage()}</div>
      {user && <BottomNav />}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(212,136,106,0.2)', borderTopColor: 'var(--rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', color: 'var(--warm-gray)' }}>Loading your recipe book...</p>
      </div>
    </div>
  )
}

function SignInScreen({ signIn, authError }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div className="animate-fade-up" style={{ maxWidth: 420, width: '100%', opacity: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--light-warm)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            Kaur&apos;s Cakery
          </p>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, color: 'var(--charcoal)', letterSpacing: '-0.03em' }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', color: 'var(--warm-gray)', lineHeight: 1.6 }}>
            Sign in with Google to open the shared recipe collection. Admin emails can add, edit, and delete. Everyone else gets view-only access.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.92)', borderRadius: 24, padding: 22, backdropFilter: 'blur(18px)' }}>
          <button
            onClick={signIn}
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #ff8fdc, #9d7cff)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 14px 30px rgba(142,106,232,0.24)',
            }}
          >
            Sign in with Google
          </button>

          <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--light-warm)', lineHeight: 1.6, textAlign: 'center' }}>
            Your recipes stay in Firebase, so they remain available across devices even if local storage is cleared.
          </p>

          {authError && (
            <p style={{ margin: '12px 0 0', fontFamily: 'var(--font-body)', fontSize: 12, color: '#c24a2d', textAlign: 'center' }}>
              {authError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
