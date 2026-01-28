import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import LoginScreen from './screens/LoginScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import AdminPanel from './screens/AdminPanel';

function App() {
  const { state } = useGame();
  const [currentView, setCurrentView] = useState('login'); // 'login', 'admin', 'game'

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
              TEAM: <span style={{ color: 'var(--accent-secondary)' }}>{state.teamId}</span>
              <span style={{ margin: '0 0.5rem', color: '#333' }}>|</span>
              SCORE: {state.score}
            </div>
          )}
        </header>

        <main style={{ flex: 1, position: 'relative' }}>
          <ScreenComponent />
        </main>
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

  return renderView();
}

export default App;
