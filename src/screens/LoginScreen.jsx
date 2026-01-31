import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './LoginScreen.css';

import { API_BASE_URL } from '../config';

const LoginScreen = ({ onLogin }) => {
    const { login } = useGame();
    const [teamName, setTeamName] = useState('');
    const [loginCode, setLoginCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if admin credentials
            if (teamName.toLowerCase() === 'admin' && loginCode === 'admin123') {
                // Admin login - navigate to admin panel
                localStorage.setItem('isAdmin', 'true');
                window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'admin' } }));
                setLoading(false);
                return;
            }

            // Regular team login
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamName: teamName.trim(),
                    loginCode: loginCode.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store team info in localStorage
                localStorage.setItem('teamId', data.team.id);
                localStorage.setItem('teamName', data.team.name);
                localStorage.setItem('teamEmail', data.team.email);
                localStorage.setItem('isAdmin', 'false');

                // Update Context State with roundSequence from backend
                login(data.team.id, data.team.name, data.team.email, data.team.roundSequence);

                // Call parent onLogin
                onLogin(data.team);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="matrix-rain"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">CODECRYPT</h1>
                    <p className="login-subtitle">// INTELLECT '26</p>
                    <div className="login-divider"></div>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="teamName">TEAM NAME</label>
                        <input
                            id="teamName"
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter your team name..."
                            required
                            autoComplete="off"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="loginCode">LOGIN CODE</label>
                        <input
                            id="loginCode"
                            type="password"
                            value={loginCode}
                            onChange={(e) => setLoginCode(e.target.value)}
                            placeholder="Enter your login code..."
                            required
                            autoComplete="off"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading || !teamName.trim() || !loginCode.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                AUTHENTICATING...
                            </>
                        ) : (
                            <>
                                <span className="lock-icon">🔓</span>
                                ACCESS SYSTEM
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="footer-text">
                        Don't have credentials? Contact the admin desk.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
