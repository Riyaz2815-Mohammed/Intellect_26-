import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameService } from '../services/GameService';
import { VARIANTS, PHASE1_QUESTION } from '../data/round5';
import DragDropSQL from './DragDropSQL';

const Round5Component = () => {
    const { state, submitAnswer } = useGame();

    // Internal Phase State: 'INTRO', 'UNLOCK', 'RECOVERY', 'DECISION', 'REVEAL', 'WIN'
    const [phase, setPhase] = useState('INTRO');

    // Unlocked Data State
    const [unlockedTables, setUnlockedTables] = useState([]); // ['events', 'performance', ...]
    const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0); // 0-8
    const [variantData, setVariantData] = useState(null);
    const [input, setInput] = useState('');
    const [error, setError] = useState(null);

    // Load Variant Data on Mount
    useEffect(() => {
        try {
            console.log("Round5 Init. TeamID:", state.teamId);
            const variantId = GameService.getRound5Variant(state.teamId);
            console.log("Assigned Variant:", variantId);

            if (VARIANTS && VARIANTS[variantId]) {
                setVariantData(VARIANTS[variantId]);
            } else {
                console.error("CRITICAL: Variant data missing for ID:", variantId);
                // Fallback to avoid black screen
                setVariantData(VARIANTS['A']);
            }
        } catch (e) {
            console.error("Round5 Crash Prevention:", e);
        }
    }, [state.teamId]);

    // --- PERSISTENCE ---
    const [savedStateLoaded, setSavedStateLoaded] = useState(false);

    // --- ADMIN OVERRIDE LISTENER ---
    // Sync internal phase with global state.current_stage if it changes externally (Admin Tool)
    useEffect(() => {
        if (!state.stage) return;

        console.log("Admin/Global Stage Sync:", state.stage);

        switch (parseInt(state.stage)) {
            case 1:
                if (phase !== 'INTRO') setPhase('INTRO');
                break;
            case 2:
                if (phase !== 'UNLOCK') setPhase('UNLOCK');
                break;
            case 3:
                if (phase !== 'RECOVERY') setPhase('RECOVERY');
                break;
            case 4:
                if (phase !== 'DECISION') setPhase('DECISION');
                break;
            case 5:
                if (phase !== 'REVEAL' && phase !== 'WIN') setPhase('REVEAL');
                break;
            case 6: // Force Win
                if (phase !== 'WIN') setPhase('WIN');
                break;
            default:
                // Do nothing if stage is standard or undefined
                break;
        }
    }, [state.stage]); // Listen to global stage changes

    // Load State from LocalStorage (Initial Load Only)
    useEffect(() => {
        if (!state.teamId) return;

        const key = `round5_progress_${state.teamId}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                const p = JSON.parse(saved);
                // Only load saved phase if we haven't been overridden by admin yet (implicit)
                // Actually, let's respect saved state heavily unless admin overrides.
                // But admin override updates 'state.stage'.

                // If local state tracks properly, we just load valid data.
                if (p.unlockedTables) setUnlockedTables(p.unlockedTables);
                if (p.currentChallengeIndex !== undefined) setCurrentChallengeIndex(p.currentChallengeIndex);

                // Prefer saved phase unless global stage dictates otherwise (which the above effect handles)
                // But initially, use saved phase if no strong signal.
                if (p.phase && !state.stage) setPhase(p.phase);

                console.log("State restored from storage:", p);
            } catch (e) {
                console.error("Corruption in save file:", e);
            }
        }
        setSavedStateLoaded(true);
    }, [state.teamId]);

    // Save State
    useEffect(() => {
        if (!state.teamId || !savedStateLoaded) return;

        const key = `round5_progress_${state.teamId}`;
        const data = {
            phase,
            unlockedTables,
            currentChallengeIndex,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
    }, [phase, unlockedTables, currentChallengeIndex, savedStateLoaded, state.teamId]);

    if (!variantData) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <div className="glitch">INITIALIZING CRITICAL SYSTEM...</div>
                <div style={{ marginTop: '1rem', color: '#666' }}>
                    Loading Node Data... ({state.teamId || 'GUEST'})
                </div>
                <button
                    className="btn btn-outline"
                    style={{ marginTop: '2rem', fontSize: '0.8rem' }}
                    onClick={() => {
                        console.log("Forcing Variant A load...");
                        setVariantData(VARIANTS['A']);
                    }}
                >
                    [DEBUG] FORCE LOAD NODE A
                </button>
            </div>
        );
    }

    // --- LOGIC HANDLERS ---

    const handleIntroContinue = () => {
        setPhase('UNLOCK');
    };

    const handleUnlockSubmit = () => {
        // Validate keyword presence
        const attempt = input.trim().toUpperCase();
        const isValid = PHASE1_QUESTION.keywords.some(k => attempt.includes(k.toUpperCase()));

        if (isValid) {
            setUnlockedTables(['events', 'performance', 'operations']);
            setPhase('RECOVERY');
            setInput('');
            setError(null);
        } else {
            setError("ACCESS DENIED: Keyword verification failed.");
            // Optional: You could clear the input here or leave it for correction
        }
    };

    const handleChallengeSubmit = (answer) => {
        const currentChallenge = variantData.challenges[currentChallengeIndex];

        // Normalize for simple comparison
        const normalize = (str) => str.replace(/\s+/g, ' ').trim().toUpperCase();
        const isCorrect = normalize(answer) === normalize(currentChallenge.answer);

        if (isCorrect) {
            const nextIndex = currentChallengeIndex + 1;

            if (nextIndex < variantData.challenges.length) {
                setCurrentChallengeIndex(nextIndex);
                setInput('');
                setError(null);
            } else {
                setPhase('DECISION');
            }
        } else {
            setError("SYSTEM ERROR: Invalid logic or query parameters.");
        }
    };

    const handleDecisionSubmit = async (option) => {
        if (option === variantData.finalDecision.answer) {
            // Trigger Email
            try {
                await fetch('/api/game/round5/trigger-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamId: state.teamId })
                });
            } catch (e) {
                console.error("Failed to trigger R5 email", e);
            }
            setPhase('REVEAL');
        } else {
            setError("FATAL ERROR: Incorrect strategic decision. Try again.");
        }
    };

    const handleFinalCodeSubmit = async () => {
        // Here we actually call the backend to claim victory
        const result = await submitAnswer(input);
        if (result.success) {
            setPhase('WIN');
        } else {
            setError(result.message || "INVALID AUTH CODE");
        }
    };

    // --- RENDERERS ---

    // --- RENDER HELPERS ---

    const renderIntro = () => (
        <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '10vh', maxWidth: '800px' }}>
            <h1 className="glitch" data-text="🚨 CRITICAL SYSTEM FAILURE" style={{ color: 'var(--accent-error)', fontSize: '3rem', marginBottom: '2rem' }}>
                🚨 CRITICAL SYSTEM FAILURE
            </h1>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Intellect ’26 core systems are corrupted.</p>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Event planning data has been fragmented across 4 nodes.</p>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--accent-warning)' }}>
                    You are the CORE COMMAND. Restore Node <strong>{variantData.node}</strong>.
                </p>
                <button className="btn btn-primary" onClick={handleIntroContinue} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                    INITIATE RECOVERY PROTOCOL
                </button>
            </div>
        </div>
    );

    const renderUnlock = () => (
        <div className="container animate-fade-in" style={{ maxWidth: '600px', marginTop: '15vh' }}>
            <h2 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-code)' }}>// PHASE 1: SYSTEM UNLOCK</h2>
            <div className="card" style={{
                marginTop: '1rem',
                border: '1px solid var(--accent-secondary)',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)'
            }}>
                <div style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-code)',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)'
                    }}>
                        <span style={{ color: 'var(--accent-secondary)' }}>{`>`}</span> {PHASE1_QUESTION.text}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 51, 51, 0.1)',
                        borderLeft: '4px solid var(--accent-error)',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: 'var(--accent-error)',
                        fontFamily: 'var(--font-code)'
                    }}>
                        [ERROR]: {error}
                    </div>
                )}

                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <span style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--accent-primary)',
                        fontFamily: 'var(--font-code)'
                    }}>$</span>
                    <input
                        className="input-code"
                        placeholder="ENTER_METRIC_KEYWORD..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 2.5rem',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--accent-primary)',
                            color: 'var(--accent-primary)',
                            fontFamily: 'var(--font-code)',
                            fontSize: '1.1rem',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none'
                        }}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleUnlockSubmit}
                    disabled={!input}
                    style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                >
                    INITIATE HANDSHAKE
                </button>

                <p style={{
                    marginTop: '1.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-code)'
                }}>
                    HINT: {PHASE1_QUESTION.hint}
                </p>
            </div>
        </div>
    );

    // Sanity Check Index
    useEffect(() => {
        if (variantData && currentChallengeIndex >= variantData.challenges.length) {
            console.warn("Index out of bounds (legacy state?), resetting or advancing.");
            // If we are past the end, we should probably be in DECISION phase if we finished?
            // Or just reset to 0 if it looks like a glitch. 
            // Let's reset to 0 to be safe for now, or last index.
            // If the user truly finished, they'd be in DECISION.
            setCurrentChallengeIndex(0);
        }
    }, [variantData, currentChallengeIndex]);

    const renderRecovery = () => {
        const challenge = variantData.challenges[currentChallengeIndex];

        // Safe Guard
        if (!challenge) {
            return (
                <div className="container" style={{ textAlign: 'center', marginTop: '20vh' }}>
                    <div className="glitch">SYNCHRONIZING DATA STREAM...</div>
                    <p>Re-aligning challenge pointer...</p>
                </div>
            );
        }

        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', gap: '1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>NODE: {variantData.node} // RECOVERY STATUS: {Math.round((currentChallengeIndex / variantData.challenges.length) * 100)}%</h3>
                    <div style={{ color: 'var(--accent-warning)', fontFamily: 'var(--font-code)' }}>task_id: {challenge.id}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflow: 'hidden' }}>
                    {/* Top: Unlocked Tables */}
                    <div style={{
                        flex: '0 0 auto',
                        maxHeight: '40vh',
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '1rem',
                        paddingRight: '0.5rem'
                    }}>
                        {unlockedTables.map(t => (
                            <div key={t} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ color: 'var(--accent-secondary)', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                                    TABLE: {t}
                                </h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', fontFamily: 'var(--font-code)' }}>
                                        <thead>
                                            <tr>
                                                {Object.keys(variantData.data[t][0]).map(k => (
                                                    <th key={k} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                                        {k}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variantData.data[t].map((r, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {Object.values(r).map((v, j) => (
                                                        <td key={j} style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{v}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom: Challenge Area */}
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                            <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>{`>`}</span>
                            {challenge.question}
                        </h2>

                        {error && <div style={{ background: 'rgba(255, 51, 51, 0.1)', color: 'var(--accent-error)', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-error)' }}>{error}</div>}

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {challenge.type === 'SCRAMBLE' && (
                                <DragDropSQL
                                    fragments={challenge.fragments}
                                    onSubmit={(res) => handleChallengeSubmit(res)}
                                />
                            )}

                            {(challenge.type === 'FIX' || challenge.type === 'REASONING') && (
                                <div style={{ marginTop: 'auto' }}>
                                    {challenge.broken && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>BROKEN_QUERY:</div>
                                            <pre style={{
                                                background: 'rgba(255, 51, 51, 0.1)',
                                                color: '#ffaaaa',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-sm)',
                                                fontFamily: 'var(--font-code)',
                                                border: '1px dashed var(--accent-error)'
                                            }}>
                                                {challenge.broken}
                                            </pre>
                                        </div>
                                    )}
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }}>$</span>
                                        <input
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            placeholder="ENTER_SOLUTION..."
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1rem 1rem 2.5rem',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--accent-primary)',
                                                color: '#fff',
                                                fontSize: '1rem',
                                                fontFamily: 'var(--font-code)',
                                                borderRadius: 'var(--radius-sm)'
                                            }}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem', width: '100%' }}
                                        onClick={() => handleChallengeSubmit(input)}
                                    >
                                        EXECUTE PATCH
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDecision = () => (
        <div className="container animate-fade-in" style={{ maxWidth: '800px', marginTop: '10vh' }}>
            <h2 style={{ color: 'var(--accent-primary)', marginBottom: '2rem' }}>// FINAL DECISION REQUIRED</h2>
            <div className="card">
                <p style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>{variantData.finalDecision.question}</p>
                {error && <div style={{ color: 'var(--accent-error)', marginBottom: '1rem' }}>{error}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {variantData.finalDecision.options.map(opt => (
                        <button
                            key={opt}
                            className="btn btn-outline"
                            style={{ padding: '2rem', fontSize: '1.2rem', borderColor: 'var(--accent-secondary)' }}
                            onClick={() => handleDecisionSubmit(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderReveal = () => (
        <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '15vh' }}>
            <h1 className="glitch" style={{ fontSize: '4rem', color: 'var(--accent-primary)', marginBottom: '2rem' }}>
                EMAIL DISPATCHED
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>CRITICAL SYSTEM RESTORATION CODE SENT.</p>
            <div style={{ background: 'rgba(255,204,0,0.1)', padding: '2rem', border: '2px solid var(--accent-warning)', display: 'inline-block' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--accent-warning)', fontWeight: 'bold' }}>
                    INSTRUCTIONS:
                </p>
                <p>1. Check your Team Email Inbox</p>
                <p>2. Locate the "CRITICAL RESTORATION CODE"</p>
                <p>3. Enter the code below to finalize restoration.</p>
            </div>

            <div style={{ marginTop: '3rem' }}>
                {error && <div style={{ color: 'var(--accent-error)', marginBottom: '1rem' }}>{error}</div>}
                <input
                    placeholder="ENTER CODE (INT26-R5...)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{ fontSize: '1.5rem', padding: '1rem', background: '#000', border: '2px solid var(--accent-primary)', color: '#fff', textAlign: 'center', width: '350px' }}
                />
                <br />
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', fontSize: '1.2rem' }}
                    onClick={handleFinalCodeSubmit}
                >
                    RESTORE SYSTEM
                </button>
            </div>
        </div>
    );

    const renderWin = () => {
        // Confetti Effect Hook
        useEffect(() => {
            const colors = ['#00ff41', '#00ffcc', '#ffcc00', '#ff00ff', '#ffffff'];

            const createParticle = (x, y) => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.width = '10px';
                particle.style.height = '10px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';

                // Animation
                const angle = Math.random() * Math.PI * 2;
                const velocity = 2 + Math.random() * 6;
                let velX = Math.cos(angle) * velocity;
                let velY = Math.sin(angle) * velocity;

                document.body.appendChild(particle);

                let opacity = 1;
                const animate = () => {
                    velY += 0.1; // gravity
                    particle.style.left = (parseFloat(particle.style.left) + velX) + 'px';
                    particle.style.top = (parseFloat(particle.style.top) + velY) + 'px';
                    opacity -= 0.01;
                    particle.style.opacity = opacity;

                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                requestAnimationFrame(animate);
            };

            // Explode interval
            const interval = setInterval(() => {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight;
                for (let i = 0; i < 10; i++) createParticle(x, y);
            }, 200);

            return () => clearInterval(interval);
        }, []);

        return (
            <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '10vh', position: 'relative', zIndex: 10 }}>
                <h1 className="glow-text" style={{ fontSize: '6rem', color: 'var(--accent-primary)', textShadow: '0 0 50px var(--accent-primary)' }}>
                    🏆 VICTORY 🏆
                </h1>
                <p style={{ fontSize: '2.5rem', marginTop: '1rem', color: '#fff' }}>SYSTEM SECURITY RESTORED</p>

                <div style={{
                    marginTop: '3rem',
                    background: 'linear-gradient(135deg, rgba(0,255,65,0.1) 0%, rgba(0,0,0,0.8) 100%)',
                    padding: '3rem',
                    border: '4px solid var(--accent-primary)',
                    borderRadius: '20px',
                    display: 'inline-block',
                    boxShadow: '0 0 100px rgba(0,255,65,0.3)',
                    maxWidth: '800px',
                    width: '100%'
                }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', marginBottom: '1rem', letterSpacing: '4px' }}>OFFICIAL RANKING</div>

                    <div style={{
                        fontSize: '5rem',
                        fontWeight: 'bold',
                        color: '#ffcc00',
                        textShadow: '0 0 20px #ffcc00',
                        marginBottom: '1rem'
                    }}>
                        #1 LEGEND
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', textAlign: 'left' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px' }}>
                            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>TEAM ID</div>
                            <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-code)' }}>{state.teamId || 'UNKNOWN'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px' }}>
                            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>STATUS</div>
                            <div style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>COMPLETED</div>
                        </div>
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '1.2rem', color: '#fff', fontStyle: 'italic' }}>
                        "The code is secure. The future is safe. Well done."
                    </p>
                </div>

                <button
                    className="btn btn-outline"
                    style={{ marginTop: '3rem', fontSize: '1rem', opacity: 0.7 }}
                    onClick={() => window.location.href = '/'}
                >
                    RETURN TO LOBBY
                </button>
            </div>
        );
    };

    // --- MAIN RENDER ---
    const renderPhaseContent = () => {
        switch (phase) {
            case 'INTRO': return renderIntro();
            case 'UNLOCK': return renderUnlock();
            case 'RECOVERY': return renderRecovery();
            case 'DECISION': return renderDecision();
            case 'REVEAL': return renderReveal();
            case 'WIN': return renderWin();
            default: return (
                <div style={{ color: 'red', textAlign: 'center', marginTop: '20vh' }}>
                    <h1>SYSTEM ERROR</h1>
                    <p>Unknown Phase: {phase}</p>
                </div>
            );
        }
    };

    return (
        <React.Fragment>
            {renderPhaseContent()}
        </React.Fragment>
    );
};

// Error Boundary Wrapper
class Round5ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Round5 Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'red' }}>
                    <h1>CRITICAL UI FAILURE</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default (props) => (
    <Round5ErrorBoundary>
        <Round5Component {...props} />
    </Round5ErrorBoundary>
);
