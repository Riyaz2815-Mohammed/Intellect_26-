import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'activity'
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
            else fetchTeams();
        }, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [activeTab, isAuthenticated]);

    const fetchTeams = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/teams');
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/submissions');
            const data = await response.json();
            setSubmissions(data);
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
            const response = await fetch('http://localhost:3001/api/admin/create-team', {
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
            const response = await fetch('http://localhost:3001/api/admin/resend-credentials', {
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

    // Toggle team active status
    const handleToggleActive = async (teamId, currentStatus) => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/toggle-team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId, isActive: !currentStatus })
            });

            const data = await response.json();

            if (data.success) {
                fetchTeams();
                setMessage({ type: 'success', text: `Team ${!currentStatus ? 'activated' : 'deactivated'}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update team status' });
        }
    };

    // Admin Override
    const handleOverrideSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/override', {
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

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🔐 CODECRYPT Admin Panel</h1>
                <p>Manage teams and credentials</p>
                <button onClick={handleLogout} className="admin-logout-btn">
                    LOGOUT
                </button>
            </div>

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
            </div>

            {activeTab === 'activity' && (
                <div className="activity-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>Live Submission Log</h2>
                        <button className="btn-secondary" onClick={fetchSubmissions}>🔄 Refresh Activity</button>
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
                    </div>

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
                            <h2 style={{ color: '#ffcc00' }}>⚡ Admin Override: {overrideData.teamName}</h2>
                            <p style={{ fontSize: '12px', color: '#ffcc00', marginTop: '-10px', marginBottom: '15px' }}>
                                Manual progress update. Use with caution.
                            </p>
                            <form onSubmit={handleOverrideSubmit}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    <div className="form-group" style={{ flex: '1 1 100px' }}>
                                        <label>Round (1-4)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="4"
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
                        <h2>Teams ({teams.length})</h2>
                        <div className="teams-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Team ID</th>
                                        <th>Team Name</th>
                                        <th>Email</th>
                                        <th>Login Code</th>
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
                                            <td>Round {team.current_round}</td>
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
                                                    onClick={() => handleToggleActive(team.team_id, team.is_active)}
                                                    className="btn-action"
                                                    title={team.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {team.is_active ? '🔒' : '🔓'}
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
        </div>
    );
};

export default AdminPanel;
