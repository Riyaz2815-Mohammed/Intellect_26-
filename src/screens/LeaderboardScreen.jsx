import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config';

const LeaderboardScreen = ({ onBack }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dynamic API Base URL
    const API_BASE = `${API_BASE_URL}/leaderboard/live`;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(API_BASE);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setLeaderboard(data);
                } else {
                    console.error('Invalid leaderboard data:', data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchLeaderboard, 10000);
        return () => clearInterval(interval);
    }, []);

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1: return { color: '#FFD700', textShadow: '0 0 10px #FFD700', fontSize: '1.2rem' }; // Gold
            case 2: return { color: '#C0C0C0', textShadow: '0 0 10px #C0C0C0' }; // Silver
            case 3: return { color: '#CD7F32', textShadow: '0 0 10px #CD7F32' }; // Bronze
            default: return { color: '#fff' };
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="glitch" style={{ fontSize: '2.5rem', margin: 0 }}>
                    <span style={{ color: 'var(--accent-primary)' }}>//</span> LIVE RANKINGS
                </h1>
                <button
                    onClick={onBack}
                    className="btn btn-outline"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem' }}
                >
                    &larr; BACK TO MISSION
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    ESTABLISHING UPLINK...
                </div>
            ) : (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(5px)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '2px solid var(--accent-primary)' }}>
                                <th style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-secondary)', width: '80px' }}>RANK</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-secondary)' }}>OPERATIVE TEAM</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>PROGRESS</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right', color: 'var(--text-secondary)' }}>SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((team) => (
                                <tr key={team.id} style={{
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: String(team.id) === String(localStorage.getItem('teamId')) ? 'rgba(0, 255, 65, 0.05)' : 'transparent',
                                    transition: 'background 0.2s'
                                }} className="hover:bg-white/5">
                                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 'bold', ...getRankStyle(team.rank) }}>
                                        #{team.rank}
                                    </td>
                                    <td style={{ padding: '1.2rem', fontSize: '1.1rem', fontWeight: '500' }}>
                                        {team.name}
                                        {team.rank === 1 && <span style={{ marginLeft: '10px', fontSize: '0.8rem' }}>👑</span>}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {team.progress >= 100 ? (
                                            <span style={{ color: '#FFD700', fontWeight: 'bold' }}>MISSION COMPLETE</span>
                                        ) : (
                                            `R${team.progress} :: S${team.stage}`
                                        )}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right', fontFamily: 'var(--font-code)', fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                        {team.score.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                * Scores calculated based on completion speed + accuracy bonus -retry penalties.
            </div>
        </div>
    );
};

export default LeaderboardScreen;
