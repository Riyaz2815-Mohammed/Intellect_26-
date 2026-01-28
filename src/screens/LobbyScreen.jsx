import React from 'react';
import { useGame } from '../context/GameContext';

const LobbyScreen = () => {
    const { state, startRound } = useGame();

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    Welcome, <span style={{ color: 'var(--accent-secondary)' }}>{state.teamName || state.teamId}</span>
                </h2>

                <div style={{
                    margin: '2rem auto',
                    padding: '2rem',
                    border: '1px dashed var(--accent-primary)',
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div className="pulse" style={{
                        width: '20px',
                        height: '20px',
                        background: 'var(--accent-primary)',
                        borderRadius: '50%'
                    }}></div>
                </div>

                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                    READY FOR ROUND {state.round || 1}
                </h3>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your system is synchronized and ready for the next challenge.
                </p>

                <button
                    className="btn btn-primary"
                    onClick={() => startRound(state.round || 1, 600)}
                    style={{ padding: '1.5rem 3rem', fontSize: '1.2rem' }}
                >
                    🚀 START MISSION
                </button>

                <p style={{ marginTop: '2rem', fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    System ID: {state.teamId} // Status: ACCESS_GRANTED
                </p>
            </div>
        </div>
    );
};

export default LobbyScreen;
