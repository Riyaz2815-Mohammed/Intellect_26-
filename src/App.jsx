import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import LoginScreen from './screens/LoginScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import AdminPanel from './screens/AdminPanel';
import QuickAdmin from './components/QuickAdmin';

function App() {
  const { state, logout } = useGame();
  // Initialize state from localStorage
  const [currentView, setCurrentView] = useState(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) return 'admin';
    // If state has teamId (from context hydration) or localStorage has it, show game
    if (state.teamId || localStorage.getItem('teamId')) return 'game';
    return 'login';
  });

  // Sync view when state.teamId changes (handle logout)
  React.useEffect(() => {
    if (!state.teamId && currentView === 'game') {
      setCurrentView('login');
    }
  }, [state.teamId, currentView]);

  // Handle login success
  const handleLogin = (teamData) => {
    setCurrentView('game');
  };

  // Render based on current view
  const renderView = () => {
    if (currentView === 'admin') {
      return <AdminPanel />;
    }

    if (currentView === 'login' && !state.teamId) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    // Game screens
    let ScreenComponent;
    switch (state.screen) {
      case 'LOBBY':
        ScreenComponent = LobbyScreen;
        break;
      case 'GAME':
        ScreenComponent = GameScreen;
        break;
      default:
        ScreenComponent = GameScreen;
    }

    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <header style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', letterSpacing: '0.1em' }} className="glitch" data-text="CODECRYPT">
            CODECRYPT <span style={{ color: 'var(--accent-primary)', fontSize: '0.8em' }}>// INTELLECT '26</span>
          </div>

          {state.teamId && (
            <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.9rem' }}>
              TEAM: <span style={{ color: 'var(--accent-secondary)' }}>{state.teamName || state.teamId}</span>
              <span style={{ margin: '0 0.5rem', color: '#333' }}>|</span>
              SCORE: {state.score}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to logout?')) {
                    logout();
                  }
                }}
                style={{
                  marginLeft: '1rem',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 51, 51, 0.1)',
                  border: '1px solid #ff3333',
                  color: '#ff3333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-code)'
                }}
              >
                LOGOUT
              </button>
            </div>
          )}
        </header>

        <main style={{ flex: 1, position: 'relative' }}>
          <ScreenComponent />
        </main>

        <QuickAdmin />
      </div>
    );
  };

  // Listen for navigation events
  React.useEffect(() => {
    const handleNavigation = (e) => {
      if (e.detail?.view) {
        setCurrentView(e.detail.view);
      }
    };

    window.addEventListener('navigate', handleNavigation);
    return () => window.removeEventListener('navigate', handleNavigation);
  }, []);

  return (
    <>
      {renderView()}
      <QuickAdmin />
    </>
  );
}

export default App;
