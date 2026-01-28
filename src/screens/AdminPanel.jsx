import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
    const [teams, setTeams] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        teamName: '',
        email: '',
        loginCode: ''
    });

    // Fetch all teams
    const fetchTeams = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/teams');
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

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

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🔐 CODECRYPT Admin Panel</h1>
                <p>Manage teams and credentials</p>
            </div>

            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

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

            <div className="teams-section">
                <h2>Teams ({teams.length})</h2>
                <div className="teams-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Team ID</th>
                                <th>Team Name</th>
                                <th>Email</th>
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
        </div>
    );
};

export default AdminPanel;
