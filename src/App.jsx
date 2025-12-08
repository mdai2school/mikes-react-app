import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import StateChart from './components/StateChart'
import Login from './components/Login'
import UserMenu from './components/UserMenu'
import './App.css'

function AppContent() {
  const { currentUser, userState } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        right: '1rem', 
        zIndex: 100 
      }}>
        <UserMenu />
      </div>
      {!userState && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(100, 108, 255, 0.9)',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          color: 'white',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          👆 Click your profile to select your state and have it highlighted!
        </div>
      )}
      <StateChart />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
