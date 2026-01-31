import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import './CompletionScreen.css';

const CompletionScreen = () => {
    const { state } = useGame();
    const [leaderboard, setLeaderboard] = useState([]);
    const [teamPosition, setTeamPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confettiActive, setConfettiActive] = useState(true);

    useEffect(() => {
        fetchLeaderboard();

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setConfettiActive(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`);
            const data = await response.json();

            setLeaderboard(data.slice(0, 10)); // Top 10

            // Find current team position
            const position = data.findIndex(team => team.team_name === state.teamName) + 1;
            setTeamPosition(position);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLoading(false);
        }
    };

    const getMedalEmoji = (position) => {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return `#${position}`;
    };

    const getPositionClass = (position) => {
        if (position === 1) return 'gold';
        if (position === 2) return 'silver';
        if (position === 3) return 'bronze';
        return '';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        <span className="position-number">{getMedalEmoji(teamPosition)}</span>
                        <span className="position-label">
                            {teamPosition === 1 ? 'WINNER' :
                                teamPosition <= 3 ? 'PODIUM FINISH' :
                                    `${teamPosition}${teamPosition === 1 ? 'st' : teamPosition === 2 ? 'nd' : teamPosition === 3 ? 'rd' : 'th'} PLACE`}
                        </span>
                    </div>
                    <h2 className="team-name-display">{state.teamName}</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🏆</div>
                            <div className="stat-value">{state.score}</div>
                            <div className="stat-label">Total Points</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-value">{state.round}</div>
                            <div className="stat-label">Rounds Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-value">{formatTime(state.totalTime || 0)}</div>
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
                        <div className="col-time">Time</div>
                    </div>
                    {leaderboard.map((team, index) => (
                        <div
                            key={team.team_id}
                            className={`table-row ${team.team_name === state.teamName ? 'highlight' : ''} ${getPositionClass(index + 1)}`}
                        >
                            <div className="col-rank">
                                <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
                            </div>
                            <div className="col-team">
                                {team.team_name}
                                {team.team_name === state.teamName && <span className="you-badge">YOU</span>}
                            </div>
                            <div className="col-score">{team.total_score}</div>
                            <div className="col-time">{formatTime(team.total_time || 0)}</div>
                        </div>
                    ))}
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
                    {teamPosition > 3 && (
                        <div className="participant-message">
                            <p>✨ Great effort! You completed all challenges! ✨</p>
                        </div>
                    )}
                </div>

                <div className="thank-you">
                    <p>Thank you for participating in <strong>CODECRYPT - Intellect '26</strong></p>
                    <p className="event-credit">Organized by the Department of Computer Science</p>
                </div>

                <button
                    className="return-button"
                    onClick={() => window.location.href = '/'}
                >
                    Return to Lobby
                </button>
            </div>
        </div>
    );
};

export default CompletionScreen;
