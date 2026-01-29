import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './context/GameContext'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("GLOBAL CRASH:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ff3333', background: '#000', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ borderBottom: '1px solid #ff3333', paddingBottom: '1rem' }}>☢ GLOBAL SYSTEM CRASH</h1>
          <p style={{ marginTop: '1rem', color: '#fff' }}>The application has encountered a critical runtime error.</p>
          <pre style={{ background: '#111', padding: '1.5rem', marginTop: '1rem', overflowX: 'auto', border: '1px solid #333' }}>
            {this.state.error && this.state.error.toString()}
            {"\n\n"}
            {this.state.error && this.state.error.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ background: '#ff3333', color: '#000', border: 'none', padding: '1rem', marginTop: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            FORCE RESET SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
