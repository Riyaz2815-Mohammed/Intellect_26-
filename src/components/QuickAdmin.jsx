import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const QuickAdmin = () => {
    const { state, adminOverride } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [jumpData, setJumpData] = useState({
        round: state.round || 1,
        stage: state.stage || 1,
        score: state.score || 0
    });

    // Make it visible even if not logged in

    const handleJump = () => {
        adminOverride({
            round: parseInt(jumpData.round),
            stage: parseInt(jumpData.stage),
            score: parseInt(jumpData.score),
            screen: 'GAME'
        });
        setIsOpen(false);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            fontFamily: 'var(--font-code)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px'
        }}>
            {isOpen && (
                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    width: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <h4 style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                        ⚡ QUICK ADMIN TOOLS
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        CURRENT: <b>R{state.round} S{state.stage}</b> | SCORE: <b>{state.score}</b>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.7rem' }}>ROUND</label>
                            <input
                                type="number"
                                min="1" max="5"
                                value={jumpData.round}
                                onChange={(e) => setJumpData({ ...jumpData, round: e.target.value })}
                                style={{ background: '#000', color: '#00ff41', border: '1px solid #333', padding: '5px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.7rem' }}>STAGE</label>
                            <input
                                type="number"
                                min="1" max="10"
                                value={jumpData.stage}
                                onChange={(e) => setJumpData({ ...jumpData, stage: e.target.value })}
                                style={{ background: '#000', color: '#00ff41', border: '1px solid #333', padding: '5px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.7rem' }}>ADJUST SCORE</label>
                        <input
                            type="number"
                            value={jumpData.score}
                            onChange={(e) => setJumpData({ ...jumpData, score: e.target.value })}
                            style={{ background: '#000', color: '#00ff41', border: '1px solid #333', padding: '5px', borderRadius: '4px' }}
                        />
                    </div>

                    <button
                        onClick={handleJump}
                        style={{
                            background: 'var(--accent-primary)',
                            color: '#000',
                            padding: '10px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '5px'
                        }}
                    >
                        EXECUTE JUMP_
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
                        <button
                            onClick={() => adminOverride({ screen: 'LOBBY', teamId: 'ADMIN-TEST', teamName: 'DEBUG_MODE' })}
                            style={{ fontSize: '0.7rem', border: '1px solid #444', color: '#fff', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            BYPASS_LOGIN
                        </button>
                        <button
                            onClick={() => adminOverride({ round: 4, stage: 1, screen: 'GAME', teamId: 'ADMIN-TEST' })}
                            style={{ fontSize: '0.7rem', border: '1px solid #444', color: '#fff', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            DEMO_R4
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={!isOpen ? "pulse" : ""}
                style={{
                    width: '55px',
                    height: '55px',
                    borderRadius: '50%',
                    background: isOpen ? '#ff3333' : '#00ff41',
                    border: 'none',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: isOpen
                        ? '0 0 15px rgba(255, 51, 51, 0.5)'
                        : '0 0 20px rgba(0, 255, 65, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {isOpen ? '✕' : '⚙️'}
            </button>
        </div>
    );
};

export default QuickAdmin;
