import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import LeaderboardScreen from './LeaderboardScreen';

import { API_BASE_URL } from '../config';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

    const [codes, setCodes] = useState([]);

    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'activity', 'codes'
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [lastUpdated, setLastUpdated] = useState(null);

    // Dynamic API Base URL
    const API_BASE = `${API_BASE_URL}/admin`;

    // Form state
    const [formData, setFormData] = useState({
        teamName: '',
        email: '',
        loginCode: ''
    });

    const [overrideData, setOverrideData] = useState({
        teamId: '',
        teamName: '',
        round: 1,
        stage: 1,
        score: 0
    });
    const [showOverrideForm, setShowOverrideForm] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        fetchTeams();
        fetchSubmissions();
        const interval = setInterval(() => {
            if (activeTab === 'activity') fetchSubmissions();
            else if (activeTab === 'codes') fetchCodes();
            else fetchTeams();
        }, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [activeTab, isAuthenticated]);

    const fetchCodes = async () => {
        try {
            const response = await fetch(`${API_BASE}/codes?t=${Date.now()}`);
            const data = await response.json();
            if (Array.isArray(data)) setCodes(data);
        } catch (error) {
            console.error('Error fetching codes:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_BASE}/teams?t=${Date.now()}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setTeams(data);
                setLastUpdated(new Date());
            } else {
                console.error('Expected array for teams, got:', data);
                setTeams([]);
                setMessage({ type: 'error', text: 'Database connection failed: ' + (data.error || 'Server Error') });
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setMessage({ type: 'error', text: `Network error: Could not reach server at ${API_BASE}` });
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${API_BASE}/submissions?t=${Date.now()}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setSubmissions(data);
            } else {
                setSubmissions([]);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginCreds.username === 'admin' && loginCreds.password === 'admin123') {
            setIsAuthenticated(true);
            localStorage.setItem('isAdmin', 'true');
        } else {
            alert('Invalid Admin Credentials');
        }
    };

    // Generate random login code
    const generateLoginCode = () => {
        const code = `LOGIN-${Math.floor(1000 + Math.random() * 9000)}`;
        setFormData({ ...formData, loginCode: code });
    };

    // Create team
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_BASE}/create-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `Team "${formData.teamName}" created successfully! Credentials sent to ${formData.email}` });
                setFormData({ teamName: '', email: '', loginCode: '' });
                setShowCreateForm(false);
                fetchTeams();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create team' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Resend credentials
    const handleResendCredentials = async (teamId, teamName, email) => {
        if (!confirm(`Resend credentials to ${teamName} (${email})?`)) return;

        try {
            const response = await fetch(`${API_BASE}/resend-credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `Credentials resent to ${email}` });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to resend credentials' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Please try again.' });
        }
    };

    // Delete team
    const handleDeleteTeam = async (teamId, teamName) => {
        if (!confirm(`WARNING: Are you sure you want to DELETE team "${teamName}"?\n\nThis will permanently remove all progress, submissions, and logs for this team. This action cannot be undone.`)) return;

        try {
            const response = await fetch(`${API_BASE}/delete-team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId })
            });

            const data = await response.json();

            if (data.success) {
                fetchTeams();
                setMessage({ type: 'success', text: `Team ${teamName} deleted successfully` });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to delete team' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete team' });
        }
    };

    // Admin Override
    const handleOverrideSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/override`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId: overrideData.teamId,
                    round: parseInt(overrideData.round),
                    stage: parseInt(overrideData.stage),
                    score: parseInt(overrideData.score)
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: `State updated for team: ${overrideData.teamName}` });
                setShowOverrideForm(false);
                fetchTeams();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to override state' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error: Connection failed' });
        } finally {
            setLoading(false);
        }
    };

    const openOverride = (team) => {
        setOverrideData({
            teamId: team.team_id,
            teamName: team.team_name,
            round: team.current_round,
            stage: team.current_stage,
            score: team.total_score
        });
        setShowOverrideForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'login' } }));
    };

    if (!isAuthenticated) {
        return (
            <>
                <style>
                    {`
                    .admin-login-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                        background-color: #050505;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                    }
                    .admin-login-card {
                        background: #111;
                        border: 1px solid #333;
                        padding: 3rem;
                        border-radius: 12px;
                        width: 100%;
                        max-width: 400px;
                        box-shadow: 0 0 50px rgba(0,255,65,0.1);
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                    .admin-login-title {
                        color: #00ff41;
                        text-align: center;
                        font-family: monospace;
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                        letter-spacing: 2px;
                    }
                    .admin-input-group label {
                        color: #888;
                        font-size: 0.8rem;
                        font-family: monospace;
                        display: block;
                        margin-bottom: 5px;
                    }
                    .admin-login-input {
                        width: 100%;
                        padding: 1rem;
                        background: #000;
                        border: 1px solid #333;
                        color: #fff;
                        font-family: monospace;
                        font-size: 1rem;
                        border-radius: 4px;
                    }
                    .admin-login-btn {
                        width: 100%;
                        padding: 1rem;
                        background: #00ff41;
                        color: #000;
                        border: none;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        font-family: monospace;
                    }
                    `}
                </style>
                <div className="admin-login-overlay">
                    <form onSubmit={handleLogin} className="admin-login-card">
                        <h2 className="admin-login-title">ADMIN TERMINAL</h2>

                        <div className="admin-input-group">
                            <label>admin_user</label>
                            <input
                                type="text"
                                value={loginCreds.username}
                                onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })}
                                className="admin-login-input"
                            />
                        </div>

                        <div className="admin-input-group">
                            <label>passkey</label>
                            <input
                                type="password"
                                value={loginCreds.password}
                                onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })}
                                className="admin-login-input"
                            />
                        </div>

                        <button type="submit" className="admin-login-btn">
                            AUTHENTICATE
                        </button>

                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'login' } }))}
                            style={{ background: 'transparent', border: 'none', color: '#666', marginTop: '10px', width: '100%', cursor: 'pointer' }}
                        >
                            &larr; Return to System
                        </button>
                    </form>
                </div>
            </>
        );
    }

    return (
        <div className="admin-container">
            {/* ... header ... */}
            <div className="admin-header">
                <h1>🔐 CODECRYPT Admin Panel</h1>
                <p>Manage teams and credentials</p>
                <button onClick={handleLogout} className="admin-logout-btn">LOGOUT</button>
            </div>

            {showLeaderboard ? (
                <div style={{ padding: '20px', background: '#000', minHeight: '100vh', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100 }}>
                    <LeaderboardScreen onBack={() => setShowLeaderboard(false)} />
                </div>
            ) : (
                <>
                    <br />
                    {message.text && (
                        <div className={`admin-message ${message.type}`}>
                            {message.type === 'success' ? '✅' : '❌'} {message.text}
                        </div>
                    )}

                    <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        <button
                            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
                            onClick={() => setActiveTab('teams')}
                            style={{ background: activeTab === 'teams' ? 'var(--accent-primary)' : 'transparent', border: '1px solid #444', color: activeTab === 'teams' ? '#000' : '#fff', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}
                        >
                            👥 Team Management
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activity')}
                            style={{ background: activeTab === 'activity' ? 'var(--accent-secondary)' : 'transparent', border: '1px solid #444', color: activeTab === 'activity' ? '#000' : '#fff', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}
                        >
                            📡 Live Activity
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'codes' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('codes'); fetchCodes(); }}
                            style={{ background: activeTab === 'codes' ? '#ff3333' : 'transparent', border: '1px solid #ff3333', color: '#fff', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}
                        >
                            🔑 Sensitive Codes
                        </button>
                    </div>

                    {activeTab === 'codes' && (
                        <div className="codes-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 style={{ color: '#ff3333' }}>⚠️ SENSITIVE ACCESS CODES (Email Fallback)</h2>
                                <button className="btn-secondary" onClick={fetchCodes}>🔄 Refresh Codes</button>
                            </div>
                            <div className="teams-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Team</th>
                                            <th>Login Credentials</th>
                                            <th>Round 1 Code</th>
                                            <th>Round 2 Code</th>
                                            <th>Round 3 Code</th>
                                            <th>Round 4 Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {codes.map((team) => (
                                            <tr key={team.team_id}>
                                                <td><strong>{team.team_name}</strong></td>
                                                <td><code style={{ color: '#00ff41', fontSize: '1.1em' }}>{team.login_code}</code></td>
                                                <td><code style={{ color: '#fff' }}>{team.round1}</code></td>
                                                <td><code style={{ color: '#aaa' }}>{team.round2 || '-'}</code></td>
                                                <td><code style={{ color: '#ffcc00' }}>{team.round3}</code></td>
                                                <td><code style={{ color: '#00ccff' }}>{team.round4}</code></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        // ... (keep existing activity tab)
                        <div className="activity-section">
                            {/* ... same activity content ... */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>Live Submission Log</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {lastUpdated && <span style={{ fontSize: '0.8rem', color: '#666' }}>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
                                    <button className="btn-secondary" onClick={fetchSubmissions}>🔄 Refresh Activity</button>
                                </div>
                            </div>
                            <div className="teams-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Team</th>
                                            <th>Target</th>
                                            <th>Result</th>
                                            <th>Answer / Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((sub, i) => (
                                            <tr key={i} style={{ opacity: sub.is_correct ? 1 : 0.8 }}>
                                                <td style={{ fontSize: '12px' }}>{new Date(sub.submitted_at).toLocaleTimeString()}</td>
                                                <td><strong>{sub.team_name}</strong></td>
                                                <td>R{sub.round} S{sub.stage}</td>
                                                <td>
                                                    <span style={{ color: sub.is_correct ? '#00ff41' : '#ff3333' }}>
                                                        {sub.is_correct ? '✅ CORRECT' : '❌ FAILED'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '11px', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {sub.is_correct ? '--- hidden ---' : (sub.error_message || sub.submitted_answer)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'teams' && (
                        // ... (keep existing teams tab)
                        <>
                            <div className="admin-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                >
                                    {showCreateForm ? '❌ Cancel' : '➕ Create New Team'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={fetchTeams}
                                >
                                    🔄 Refresh
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ background: '#FFD700', color: '#000', border: 'none' }}
                                    onClick={() => setShowLeaderboard(true)}
                                >
                                    🏆 View Leaderboard
                                </button>
                            </div>
                            {/* ... rest of teams tab from original file ... */}
                            {lastUpdated && <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}

                            {showCreateForm && (
                                <div className="create-team-form">
                                    <h2>Create New Team</h2>
                                    <form onSubmit={handleCreateTeam}>
                                        <div className="form-group">
                                            <label>Team Name *</label>
                                            <input
                                                type="text"
                                                value={formData.teamName}
                                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                                placeholder="Enter team name..."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="team@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Login Code *</label>
                                            <div className="input-with-button">
                                                <input
                                                    type="text"
                                                    value={formData.loginCode}
                                                    onChange={(e) => setFormData({ ...formData, loginCode: e.target.value })}
                                                    placeholder="LOGIN-XXXX"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={generateLoginCode}
                                                    className="btn-generate"
                                                >
                                                    🎲 Generate
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="btn-submit"
                                                disabled={loading}
                                            >
                                                {loading ? '⏳ Creating...' : '✅ Create & Send Email'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {showOverrideForm && (
                                <div className="create-team-form override-form" style={{ borderColor: '#ffcc00', borderStyle: 'dashed' }}>
                                // ... (REST OF OVERRIDE FORM) ...
                                    <h2 style={{ color: '#ffcc00' }}>⚡ Admin Override: {overrideData.teamName}</h2>
                                    <p style={{ fontSize: '12px', color: '#ffcc00', marginTop: '-10px', marginBottom: '15px' }}>
                                        Manual progress update. Use with caution.
                                    </p>
                                    <form onSubmit={handleOverrideSubmit}>
                                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            <div className="form-group" style={{ flex: '1 1 100px' }}>
                                                <label>Round (1-10)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={overrideData.round}
                                                    onChange={(e) => setOverrideData({ ...overrideData, round: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: '1 1 100px' }}>
                                                <label>Stage</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={overrideData.stage}
                                                    onChange={(e) => setOverrideData({ ...overrideData, stage: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: '2 1 150px' }}>
                                                <label>New Total Score</label>
                                                <input
                                                    type="number"
                                                    value={overrideData.score}
                                                    onChange={(e) => setOverrideData({ ...overrideData, score: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions" style={{ display: 'flex', gap: '15px' }}>
                                            <button type="submit" className="btn-submit" disabled={loading} style={{ background: '#ffcc00', color: '#000', fontWeight: 'bold' }}>
                                                {loading ? '⏳ Processing...' : 'SAVE & APPLY OVERRIDE'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => setShowOverrideForm(false)}
                                                style={{ border: '1px solid #444' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="teams-section">
                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '0.8rem 1rem',
                                    background: 'rgba(0, 255, 65, 0.05)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(0, 255, 65, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap',
                                    fontSize: '0.85rem'
                                }}>
                                    <strong style={{ color: '#fff' }}>ROUND KEY:</strong>
                                    <span><strong style={{ color: 'var(--accent-primary)' }}>1</strong> SQL Basics</span>
                                    <span style={{ color: '#444' }}>|</span>
                                    <span><strong style={{ color: 'var(--accent-primary)' }}>2</strong> Physical Access</span>
                                    <span style={{ color: '#444' }}>|</span>
                                    <span><strong style={{ color: 'var(--accent-primary)' }}>3</strong> Memory Analysis</span>
                                    <span style={{ color: '#444' }}>|</span>
                                    <span><strong style={{ color: 'var(--accent-primary)' }}>4</strong> Advanced Queries</span>
                                </div>

                                <h2>Teams ({teams.length})</h2>
                                <div className="teams-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Team ID</th>
                                                <th>Team Name</th>
                                                <th>Email</th>
                                                <th>Login Code</th>
                                                <th>Round Sequence</th>
                                                <th>Round</th>
                                                <th>Stage</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teams.map((team) => (
                                                <tr key={team.team_id} className={!team.is_active ? 'inactive' : ''}>
                                                    <td><code>{team.team_id}</code></td>
                                                    <td><strong>{team.team_name}</strong></td>
                                                    <td>{team.email}</td>
                                                    <td><code style={{ color: '#00ff41' }}>{team.login_code}</code></td>
                                                    <td>
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '4px',
                                                            alignItems: 'center',
                                                            fontSize: '0.85rem',
                                                            fontFamily: 'monospace',
                                                            color: '#00ffcc'
                                                        }}>
                                                            {(team.round_sequence || [1, 2, 3, 4]).map((round, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <span style={{
                                                                        background: idx === 0 ? '#00ff41' : 'rgba(0, 255, 204, 0.1)',
                                                                        color: idx === 0 ? '#000' : '#00ffcc',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '3px',
                                                                        fontWeight: idx === 0 ? 'bold' : 'normal',
                                                                        border: `1px solid ${idx === 0 ? '#00ff41' : '#00ffcc'}`
                                                                    }}>
                                                                        {round}
                                                                    </span>
                                                                    {idx < 3 && <span style={{ color: '#666' }}>→</span>}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {team.current_round >= 100 ? (
                                                            <span style={{
                                                                background: '#FFD700',
                                                                color: '#000',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                🏆 FINISHED
                                                            </span>
                                                        ) : (
                                                            `Round ${team.current_round}`
                                                        )}
                                                    </td>
                                                    <td>Stage {team.current_stage}</td>
                                                    <td className="score">{team.total_score}</td>
                                                    <td>
                                                        <span className={`status-badge ${team.is_active ? 'active' : 'inactive'}`}>
                                                            {team.is_active ? '✅ Active' : '❌ Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="actions">
                                                        <button
                                                            onClick={() => handleResendCredentials(team.team_id, team.team_name, team.email)}
                                                            className="btn-action"
                                                            title="Resend credentials"
                                                        >
                                                            📧
                                                        </button>
                                                        <button
                                                            onClick={() => openOverride(team)}
                                                            className="btn-action"
                                                            title="Override State / Skip"
                                                        >
                                                            ⚙️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeam(team.team_id, team.team_name)}
                                                            className="btn-action"
                                                            title="Permanently Delete Team"
                                                            style={{ color: '#ff3333' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPanel;
