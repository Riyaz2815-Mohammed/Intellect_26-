import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import './CompletionScreen.css';

const CompletionScreen = () => {
    const { state } = useGame();
    const [leaderboard, setLeaderboard] = useState([]);
    const [teamPosition, setTeamPosition] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confettiActive, setConfettiActive] = useState(true);

    useEffect(() => {
        fetchLeaderboard();

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setConfettiActive(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Helper function to format seconds into MM:SS
    const formatTime = (seconds) => {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchLeaderboard = async () => {
        try {
            const SERVER_URL = import.meta.env.VITE_API_URL;

            // Calculate total game time (Client-side estimate fallback)
            // Calculate total game time (Client-side estimate fallback)
            const gameStartTime = localStorage.getItem('gameStartTime');
            const gameEndTime = localStorage.getItem('gameEndTime');

            let clientCalculatedTime = 0;
            if (gameStartTime) {
                const startTime = parseInt(gameStartTime);
                const endTime = gameEndTime ? parseInt(gameEndTime) : Date.now();
                clientCalculatedTime = Math.floor((endTime - startTime) / 1000);
            }

            // 1. Fetch Live Leaderboard
            let lbData = [];
            try {
                const lbResponse = await fetch(`${SERVER_URL}/api/leaderboard/live`);
                if (lbResponse.ok) {
                    lbData = await lbResponse.json();
                }
            } catch (e) {
                console.warn("Leaderboard fetch failed", e);
            }
            setLeaderboard(lbData.slice(0, 10)); // Top 10

            // 2. Fetch Personal Stats (Source of Truth)
            let personalData = null;
            if (state.teamId) {
                try {
                    const statsResponse = await fetch(`${SERVER_URL}/api/teams/${state.teamId}/state`);
                    if (statsResponse.ok) {
                        personalData = await statsResponse.json();
                    }
                } catch (e) {
                    console.error("Failed to fetch personal stats:", e);
                }
            }

            // 3. Determine Rank/Position
            const myTeamName = state.teamName?.toLowerCase() || '';
            const lbIndex = lbData.findIndex(team => (team.name || team.team_name)?.toLowerCase() === myTeamName);
            const rank = (lbIndex !== -1) ? (lbIndex + 1) : null;
            const lbEntry = (lbIndex !== -1) ? lbData[lbIndex] : null;

            setTeamPosition(rank);

            // 4. Set Team Data for Display
            // 4. Set Team Data for Display
            // Score: Trust Backend (includes time bonuses)
            // Retries: Trust Frontend (state.totalRetries) if higher, as backend validation is lenient
            // Time: Trust Backend or Calculated

            const srScore = personalData?.score ?? lbEntry?.score ?? state.score;
            const srRetries = Math.max(personalData?.retries || 0, lbEntry?.retries || 0, state.totalRetries || 0);
            const srTime = personalData?.timeTaken ?? lbEntry?.timeTaken ?? clientCalculatedTime ?? 0;

            setTeamData({
                name: state.teamName,
                score: srScore,
                retries: srRetries,
                timeTaken: srTime
            });

            // 5. Patch Leaderboard "You" Row for consistency
            if (lbIndex !== -1) {
                const updatedLb = [...lbData];
                updatedLb[lbIndex] = {
                    ...updatedLb[lbIndex],
                    score: srScore,
                    retries: srRetries,
                    timeTaken: srTime
                };
                setLeaderboard(updatedLb);
            }

            // Clear timer logic
            if (gameStartTime) {
                localStorage.removeItem('gameStartTime');
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLoading(false);
        }
    };

    const getMedalEmoji = (position) => {
        if (!position) return '🏅';
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return `#${position}`;
    };

    const getPositionClass = (position) => {
        if (!position) return '';
        if (position === 1) return 'gold';
        if (position === 2) return 'silver';
        if (position === 3) return 'bronze';
        return '';
    };

    if (loading) {
        return (
            <div className="completion-screen loading">
                <div className="loading-spinner"></div>
                <p>Calculating final results...</p>
            </div>
        );
    }

    return (
        <div className="completion-screen">
            {confettiActive && <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className="confetti" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#00ff41', '#00ffcc', '#ffcc00', '#ff3333'][Math.floor(Math.random() * 4)]
                    }}></div>
                ))}
            </div>}

            <div className="completion-header">
                <div className="glitch-wrapper">
                    <h1 className="glitch" data-text="MISSION COMPLETE">MISSION COMPLETE</h1>
                </div>
                <div className="team-result">
                    <div className={`position-badge ${getPositionClass(teamPosition)}`}>
                        <span className="position-number">{teamPosition ? getMedalEmoji(teamPosition) : '#?'}</span>
                        <span className="position-label">
                            {teamPosition === 1 ? 'WINNER' :
                                (teamPosition > 0 && teamPosition <= 3) ? 'PODIUM FINISH' :
                                    (teamPosition ? `${teamPosition}${teamPosition === 1 ? 'st' : teamPosition === 2 ? 'nd' : teamPosition === 3 ? 'rd' : 'th'} PLACE` : 'RANK PENDING')}
                        </span>
                    </div>
                    <h2 className="team-name-display">{state.teamName}</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🏆</div>
                            <div className="stat-value">{teamData?.score || state.score}</div>
                            <div className="stat-label">Total Points</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔄</div>
                            <div className="stat-value">{teamData?.retries || 0}</div>
                            <div className="stat-label">Total Retries</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-value">{formatTime(teamData?.timeTaken || 0)}</div>
                            <div className="stat-label">Total Time</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="leaderboard-section">
                <h3 className="section-title">
                    <span className="title-icon">📊</span>
                    FINAL LEADERBOARD
                    <span className="title-icon">📊</span>
                </h3>
                <div className="leaderboard-table">
                    <div className="table-header">
                        <div className="col-rank">Rank</div>
                        <div className="col-team">Team Name</div>
                        <div className="col-score">Score</div>
                        <div className="col-retries">Retries</div>
                        <div className="col-time">Time</div>
                    </div>
                    {leaderboard.length > 0 ? leaderboard.map((team, index) => (
                        <div
                            key={team.id}
                            className={`table-row ${team.name === state.teamName ? 'highlight' : ''} ${getPositionClass(index + 1)}`}
                        >
                            <div className="col-rank">
                                <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
                            </div>
                            <div className="col-team">
                                {team.name}
                                {team.name === state.teamName && <span className="you-badge">YOU</span>}
                            </div>
                            <div className="col-score">{team.score}</div>
                            <div className="col-retries">{team.retries}</div>
                            <div className="col-time">{formatTime(team.timeTaken || 0)}</div>
                        </div>
                    )) : (
                        <div className="no-data-message">
                            No leaderboard data available yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="completion-footer">
                <div className="achievement-message">
                    {teamPosition === 1 && (
                        <div className="winner-message">
                            <span className="trophy-icon">🏆</span>
                            <p>CONGRATULATIONS! You are the CODECRYPT Champion!</p>
                            <span className="trophy-icon">🏆</span>
                        </div>
                    )}
                    {teamPosition > 1 && teamPosition <= 3 && (
                        <div className="podium-message">
                            <p>🎉 Amazing performance! You secured a podium finish! 🎉</p>
                        </div>
                    )}
                </div>

                <div className="thank-you">
                    <p>Thank you for participating in <strong>CODECRYPT - Intellect '26</strong></p>
                    <p className="dev-credit" style={{ marginTop: '10px', color: '#00ffcc', fontWeight: 'bold' }}>Developed by Mohammed Riyaz A</p>
                </div>

                <button
                    className="return-button"
                    onClick={() => {
                        window.location.href = '/';
                        localStorage.clear();
                    }}
                >
                    Return to Lobby
                </button>
            </div>
        </div>
    );
};

export default CompletionScreen;
