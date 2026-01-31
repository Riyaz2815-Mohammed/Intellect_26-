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
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    Welcome, <span style={{ color: 'var(--accent-secondary)' }}>{state.teamName || state.teamId}</span>
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
                    <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '15px', fontSize: '1rem', letterSpacing: '2px' }}>
                        YOUR MISSION SEQUENCE
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {(state.roundSequence || [1, 2, 3, 4]).map((round, index) => (
                            <div key={index} style={{
                                background: index === 0 ? 'var(--accent-primary)' : 'rgba(0, 0, 0, 0.5)',
                                color: index === 0 ? '#000' : 'var(--accent-primary)',
                                border: `2px solid var(--accent-primary)`,
                                borderRadius: '8px',
                                padding: '15px 20px',
                                minWidth: '120px',
                                fontWeight: 'bold',
                                boxShadow: index === 0 ? '0 0 20px rgba(0, 255, 65, 0.5)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                                    {index + 1}
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                    ROUND {round}
                                </div>
                                <div style={{ fontSize: '0.65rem', marginTop: '5px' }}>
                                    {roundNames[round]}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Complete all missions in this order to finish the challenge
                    </p>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '2px' }}>
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
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.2em', fontSize: '1rem' }}>
                    NEXT CHALLENGE LOADING...
                </h4>

                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your system is synchronized and ready for the next challenge.
                </p>

                <button
                    className="btn btn-primary"
                    onClick={() => startRound(state.round || 0, 600)}
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
