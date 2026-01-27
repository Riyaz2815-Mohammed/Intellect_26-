import React from 'react';
import { useGame } from '../context/GameContext';

const LobbyScreen = () => {
    const { state } = useGame();

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    Welcome, <span style={{ color: 'var(--accent-secondary)' }}>{state.teamName || state.teamId}</span>
                </h2>

                <div style={{
                    margin: '2rem 0',
                    padding: '2rem',
                    border: '1px dashed var(--accent-primary)',
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '2rem auto'
                }}>
                    <div className="pulse" style={{ width: '20px', height: '20px', background: 'var(--accent-primary)', borderRadius: '50%' }}></div>
                </div>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    AWAITING ROUND ACTIVATION...
                </p>

                <p style={{ marginTop: '1rem', fontFamily: 'var(--font-code)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    System ID: {state.teamId} // Status: READY
                </p>
            </div>
        </div>
    );
};

export default LobbyScreen;
