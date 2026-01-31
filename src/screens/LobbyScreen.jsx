import React from 'react';
import { useGame } from '../context/GameContext';

const LobbyScreen = () => {
    const { state, startRound } = useGame();

    const roundNames = {
        1: 'SQL BASICS',
        2: 'PHYSICAL ACCESS',
        3: 'MEMORY ANALYSIS',
        4: 'ADVANCED QUERIES'
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 'normal' }}>
                    Welcome, <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{state.teamName || state.teamId}</span>
                </h2>

                {/* Round Sequence Display */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.05) 0%, rgba(0, 255, 204, 0.05) 100%)',
                    border: '2px solid var(--accent-primary)',
                    borderRadius: '10px',
                    padding: '20px',
                    margin: '20px auto',
                    maxWidth: '600px'
                }}>
                    <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '15px', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 'normal' }}>
                        YOUR MISSION SEQUENCE
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {(state.roundSequence || [1, 2, 3, 4]).map((round, index) => (
                            <div key={index} style={{
                                background: index === 0 ? 'var(--accent-primary)' : 'rgba(0, 0, 0, 0.5)',
                                color: index === 0 ? '#000' : 'var(--accent-primary)',
                                border: `2px solid var(--accent-primary)`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                minWidth: '100px',
                                fontWeight: 'bold',
                                boxShadow: index === 0 ? '0 0 20px rgba(0, 255, 65, 0.5)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
                                    {index + 1}
                                </div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                    ROUND {round}
                                </div>
                                <div style={{ fontSize: '0.6rem', marginTop: '4px' }}>
                                    {roundNames[round]}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#999' }}>
                        Complete all missions in this order to finish the challenge
                    </p>
                </div>

                <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '1px', fontWeight: 'bold' }}>
                    CORE MISSIONS COMPLETED: {state.round >= 100 ? 4 : Math.max(0, (state.roundSequence || [1, 2, 3, 4]).indexOf(state.round === 0 ? (state.roundSequence || [1, 2, 3, 4])[0] : state.round))} / 4
                </div>

                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '2rem auto' }}>
                    <div className="spin-slow" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: '2px dashed var(--accent-primary)',
                        borderRadius: '50%',
                        opacity: 0.5
                    }}></div>
                    <div className="pulse" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '20px',
                        height: '20px',
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        boxShadow: '0 0 15px var(--accent-primary)'
                    }}></div>
                </div>

                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                    {state.round >= 100 ? 'MISSION ACCOMPLISHED' : 'SYSTEM READY'}
                </h3>
                <h4 style={{ color: '#999', marginBottom: '0.5rem', letterSpacing: '0.15em', fontSize: '0.9rem', fontWeight: 'normal' }}>
                    NEXT CHALLENGE LOADING...
                </h4>

                <p style={{ fontSize: '0.95rem', color: '#999', marginBottom: '2rem' }}>
                    Your system is synchronized and ready for the next challenge.
                </p>

                <button
                    className="btn btn-primary"
                    onClick={() => startRound(state.round || 0, 600)}
                    style={{
                        padding: '1.2rem 3.5rem',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em',
                        boxShadow: '0 0 30px rgba(0, 255, 65, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.boxShadow = '0 0 40px rgba(0, 255, 65, 0.6)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.boxShadow = '0 0 30px rgba(0, 255, 65, 0.4)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    🚀 START MISSION
                </button>

                <p style={{ marginTop: '2rem', fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: '#666' }}>
                    System ID: {state.teamId} // Status: ACCESS_GRANTED
                </p>
            </div>
        </div>
    );
};

export default LobbyScreen;
