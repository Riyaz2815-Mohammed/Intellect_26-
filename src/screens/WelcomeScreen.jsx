import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const WelcomeScreen = () => {
    const { login, error } = useGame();
    const [teamId, setTeamId] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        login(teamId, accessCode, email);
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <h1 className="glitch" data-text="CODECRYPT" style={{ fontSize: '4rem', marginBottom: '2rem', color: 'var(--accent-primary)', letterSpacing: '0.2em' }}>
                CODECRYPT
            </h1>

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    System Authorization
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TEAM ID</label>
                        <input
                            type="text"
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-code)',
                                fontSize: '1.1rem'
                            }}
                            placeholder="TM-001"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACCESS CODE</label>
                        <input
                            type="password"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-code)',
                                fontSize: '1.1rem'
                            }}
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TEAM EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-code)',
                                fontSize: '1.1rem'
                            }}
                            placeholder="team@example.com"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--accent-error)', fontSize: '0.9rem', textAlign: 'center' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Initialize Uplink
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                SECURE CONNECTION ESTABLISHED // INTELLECT '26
            </div>
        </div>
    );
};

export default WelcomeScreen;
