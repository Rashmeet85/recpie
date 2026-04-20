import { useEffect } from 'react'
import { useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import LibraryPage from './pages/LibraryPage'
import AddRecipePage from './pages/AddRecipePage'
import RecipeViewPage from './pages/RecipeViewPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { currentPage, init } = useStore()
  useEffect(() => { init() }, [])

  const renderPage = () => {
    const style = { opacity: 0, animationDuration: '0.35s', minHeight: '100dvh' }
    switch (currentPage) {
      case 'add': return <div key="add" className="animate-fade-up" style={style}><AddRecipePage /></div>
      case 'view': return <div key="view" className="animate-fade-up" style={style}><RecipeViewPage /></div>
      case 'settings': return <div key="settings" className="animate-fade-up" style={style}><SettingsPage /></div>
      default: return <div key="library" className="animate-fade-up" style={style}><LibraryPage /></div>
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: `
        radial-gradient(ellipse at 15% 0%, rgba(242,217,208,0.55) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 100%, rgba(200,217,197,0.35) 0%, transparent 50%),
        #f9f3ee
      `,
      paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{
        position: 'fixed', top: -80, right: -80, width: 280, height: 280,
        borderRadius: '50%', background: 'rgba(242,217,208,0.2)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: 100, left: -60, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(200,217,197,0.15)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{renderPage()}</div>
      <BottomNav />
    </div>
  )
}
