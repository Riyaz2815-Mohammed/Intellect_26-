import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { API_BASE_URL } from '../config';
import './CompletionScreen.css';

const CompletionScreen = () => {
    const { state, dispatch } = useGame();
    const [leaderboard, setLeaderboard] = useState([]);
    const [teamPosition, setTeamPosition] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [breakdown, setBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confettiActive, setConfettiActive] = useState(true);
    const [visibleStep, setVisibleStep] = useState(0);

    useEffect(() => {
        const init = async () => {
            await fetchLeaderboard();
            await fetchBreakdown();
            setLoading(false);

            // Staggered reveal sequence
            for (let i = 1; i <= 4; i++) {
                await new Promise(r => setTimeout(r, 600));
                setVisibleStep(i);
            }
        };

        init();

        // Stop confetti after 8 seconds (longer for WOW)
        const timer = setTimeout(() => setConfettiActive(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const fetchBreakdown = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${state.teamId}/breakdown`);
            if (response.ok) {
                const data = await response.json();
                setBreakdown(data);
            }
        } catch (e) {
            console.error("Failed to fetch breakdown", e);
        }
    };

    // Helper function to format seconds into MM:SS
    const formatTime = (seconds) => {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchLeaderboard = async () => {
        try {
            const SERVER_URL = API_BASE_URL;

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
                const lbResponse = await fetch(`${SERVER_URL}/leaderboard/live`);
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
                    const statsResponse = await fetch(`${SERVER_URL}/teams/${state.teamId}/state`);
                    if (statsResponse.ok) {
                        personalData = await statsResponse.json();
                    }
                } catch (e) {
                    console.error("Failed to fetch personal stats:", e);
                }
            }

            // 3. Determine Rank/Position
            const myTeamId = state.teamId;
            const lbIndex = lbData.findIndex(team => String(team.id) === String(myTeamId));

            // Priority: Server-calculated rank, Fallback: Local search index
            const rank = (personalData?.rank) || (lbIndex !== -1 ? lbIndex + 1 : null);
            const lbEntry = (lbIndex !== -1) ? lbData[lbIndex] : null;

            setTeamPosition(rank);

            // 4. Set Team Data for Display
            const srScore = personalData?.score ?? lbEntry?.score ?? state.score;
            const srTime = personalData?.timeTaken ?? lbEntry?.timeTaken ?? clientCalculatedTime ?? 0;

            setTeamData({
                name: state.teamName,
                score: srScore,
                timeTaken: srTime
            });

            // 5. Patch Leaderboard "You" Row for consistency
            if (lbIndex !== -1) {
                const updatedLb = [...lbData];
                updatedLb[lbIndex] = {
                    ...updatedLb[lbIndex],
                    score: srScore,
                    timeTaken: srTime
                };
                setLeaderboard(updatedLb);
            }

            // Clear timer logic
            if (gameStartTime) {
                localStorage.removeItem('gameStartTime');
            }

            setLoading(false);

            // Sync Context with Server Truth (Ensures Header Score matches Body Score)
            if (srScore !== state.score && dispatch) {
                console.log(`[SYNC] Updating Context Score: ${state.score} -> ${srScore}`);
                dispatch({
                    type: 'ADMIN_OVERRIDE',
                    payload: { score: srScore }
                });
            }

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
                <p className="glow-text">DECRYPTING MISSION RESULTS...</p>
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
                        backgroundColor: ['#00ff41', '#00f3ff', '#ffcc00', '#ff3333'][Math.floor(Math.random() * 4)]
                    }}></div>
                ))}
            </div>}

            {/* Step 1: Hero Section */}
            {visibleStep >= 1 && (
                <div className="completion-header visible-content">
                    <div className="glitch-wrapper">
                        <h1 className="glitch" data-text="MISSION ACCOMPLISHED">MISSION ACCOMPLISHED</h1>
                    </div>
                    <div className="team-result">
                        <div className={`position-badge ${getPositionClass(teamPosition)}`}>
                            <span className="position-number">{teamPosition ? getMedalEmoji(teamPosition) : '#?'}</span>
                            <span className="position-label">
                                {teamPosition === 1 ? 'ULTIMATE CHAMPION' :
                                    (teamPosition > 0 && teamPosition <= 3) ? 'PODIUM ELITE' :
                                        (teamPosition ? `RANKED #${teamPosition}` : 'CALCULATING...')}
                            </span>
                        </div>
                        <h2 className="team-name-display">{state.teamName}</h2>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💎</div>
                                <div className="stat-value pulse">{teamData?.score || state.score}</div>
                                <div className="stat-label">Total Points</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⚡</div>
                                <div className="stat-value">{formatTime(teamData?.timeTaken || 0)}</div>
                                <div className="stat-label">Total Time</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Performance Roundup */}
            {visibleStep >= 2 && breakdown.length > 0 && (
                <div className="breakdown-section visible-content">
                    {breakdown.map((roundData, idx) => (
                        <div key={idx} className="breakdown-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <span className="round-label">ROUND {roundData.round}</span>
                            <div className="round-score">+{roundData.score} PTS</div>
                            <div className="round-time">{formatTime(roundData.time_taken)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Step 3: Leaderboard */}
            {visibleStep >= 3 && (
                <div className="leaderboard-section visible-content">
                    <h3 className="section-title">
                        <span className="title-icon">🏆</span>
                        UNIFIED RANKINGS
                        <span className="title-icon">🏆</span>
                    </h3>
                    <div className="leaderboard-table">
                        <div className="table-header">
                            <div className="col-rank">Rank</div>
                            <div className="col-team">Operative</div>
                            <div className="col-score">Score</div>
                            <div className="col-time">Time</div>
                        </div>
                        {leaderboard.length > 0 ? leaderboard.map((team, index) => (
                            <div
                                key={team.id}
                                className={`table-row ${String(team.id) === String(state.teamId) ? 'highlight' : ''} ${getPositionClass(index + 1)}`}
                            >
                                <div className="col-rank">
                                    <span className="rank-badge">{getMedalEmoji(index + 1)}</span>
                                </div>
                                <div className="col-team">
                                    {team.name}
                                    {String(team.id) === String(state.teamId) && <span className="you-badge">YOU</span>}
                                </div>
                                <div className="col-score">{team.score}</div>
                                <div className="col-time">{formatTime(team.timeTaken || 0)}</div>
                            </div>
                        )) : (
                            <div className="no-data-message">
                                Fetching live rankings...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 4: Footer */}
            {visibleStep >= 4 && (
                <div className="completion-footer visible-content">
                    <div className="achievement-message">
                        {teamPosition === 1 && (
                            <div className="winner-message">
                                <span className="trophy-icon">👑</span>
                                <p>CONGRATULATIONS! You have mastered CODECRYPT!</p>
                                <span className="trophy-icon">👑</span>
                            </div>
                        )}
                        {teamPosition > 1 && teamPosition <= 3 && (
                            <div className="podium-message">
                                <p>🎉 Elite Tactical Performance! 🎉</p>
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
            )}
        </div>
    );
};

export default CompletionScreen;
