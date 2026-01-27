import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const AdminPanel = () => {
    const { adminOverride, state } = useGame();
    const [isOpen, setIsOpen] = useState(true); // Changed to true - always open by default
    const [customRound, setCustomRound] = useState(1);
    const [customStage, setCustomStage] = useState(1);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: '#000',
                    color: '#00ff41',
                    border: '1px solid #00ff41',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    opacity: 0.8,
                    zIndex: 9999,
                    cursor: 'pointer'
                }}
                title="Admin Panel"
            >
                🔧 ADMIN
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '320px',
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid var(--accent-warning)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 0 40px rgba(0,0,0,0.8)',
            zIndex: 10000,
            fontFamily: 'var(--font-code)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                <h4 style={{ color: 'var(--accent-warning)', fontSize: '0.9rem' }}>ADMIN_DEBUG_TOOL</h4>
                <button onClick={() => setIsOpen(false)} style={{ color: '#fff' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.7rem', flex: 1 }}
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                    >
                        🗑 CLEAR STORAGE
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.7rem', flex: 1 }}
                        onClick={() => adminOverride({ screen: 'WELCOME', teamId: null, round: 0 })}
                    >
                        RESET APP
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ fontSize: '0.7rem', flex: 1 }} onClick={() => adminOverride({ stage: state.stage + 1 })}>
                        SKIP STAGE
                    </button>
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #333' }}>
                    <label style={{ fontSize: '0.7rem', color: '#888' }}>SET STATE DIRECTLY:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                            type="number"
                            value={customRound}
                            onChange={e => setCustomRound(Number(e.target.value))}
                            style={{ width: '40px', background: '#222', border: '1px solid #444', color: '#fff', textAlign: 'center' }}
                        />
                        <input
                            type="number"
                            value={customStage}
                            onChange={e => setCustomStage(Number(e.target.value))}
                            style={{ width: '40px', background: '#222', border: '1px solid #444', color: '#fff', textAlign: 'center' }}
                        />
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 1rem', height: 'auto' }}
                            onClick={() => adminOverride({ screen: 'GAME', round: customRound, stage: customStage })}
                        >
                            JUMP TO
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.6rem', color: '#555', wordBreak: 'break-all' }}>
                CURRENT: {JSON.stringify({ screen: state.screen, r: state.round, s: state.stage, score: state.score })}
            </div>

            {state.round === 4 && state.teamId && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: 'rgba(0, 255, 65, 0.1)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '4px'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                        📧 ROUND 4 CODE:
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontFamily: 'var(--font-code)' }}>
                        {localStorage.getItem(`ROUND4_CODE_${state.teamId}`) || 'Not generated yet'}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '0.25rem' }}>
                        Check browser console for email log
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
