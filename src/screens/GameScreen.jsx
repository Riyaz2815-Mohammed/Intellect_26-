import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameService } from '../services/GameService';
import DragDropSQL from '../components/DragDropSQL';

// Video Game Style Win Screen
const WinScreen = ({ state }) => {
    return (
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)',
            color: '#fff',
            fontFamily: '"Press Start 2P", "Courier New", monospace', // Video game font fallback
            padding: '2rem',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000
        }}>
            <h1 style={{
                fontSize: '4rem',
                color: '#00ff41',
                textShadow: '0 0 20px rgba(0, 255, 65, 0.5), 4px 4px 0px #000',
                marginBottom: '1rem',
                letterSpacing: '5px',
                animation: 'pulse 2s infinite'
            }}>
                MISSION ACCOMPLISHED
            </h1>

            <div style={{
                fontSize: '1.5rem',
                marginBottom: '3rem',
                color: '#aaa',
                textTransform: 'uppercase'
            }}>
                All Systems Restored.
            </div>

            <div style={{
                background: 'rgba(0, 50, 0, 0.8)',
                border: '4px solid #00ff41',
                padding: '2rem 4rem',
                borderRadius: '0px', // Retro blocky style
                boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.1)',
                marginBottom: '3rem',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#000',
                    padding: '0 10px',
                    color: '#00ff41',
                    fontSize: '1rem'
                }}>HIGH SCORE</div>

                <div style={{ fontSize: '5rem', fontWeight: 'bold', textShadow: '4px 4px 0px #003300' }}>
                    {state.score.toString().padStart(6, '0')}
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '4rem',
                marginTop: '1rem'
            }}>
                <div className="stat-box">
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>TEAM</div>
                    <div style={{ fontSize: '1.5rem', color: '#fff', textShadow: '2px 2px 0px #333' }}>{state.teamName}</div>
                </div>
                <div className="stat-box">
                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>RANK</div>
                    <div style={{ fontSize: '1.5rem', color: '#FFD700', textShadow: '2px 2px 0px #654321' }}>#1</div>
                </div>
            </div>

            <div style={{ marginTop: '5rem', opacity: 0.8, fontSize: '0.9rem', animation: 'blink 1s step-end infinite' }}>
                PRESS START TO PLAY AGAIN (Just kidding, good job!)
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); text-shadow: 0 0 20px rgba(0, 255, 65, 0.5); }
                    50% { transform: scale(1.05); text-shadow: 0 0 30px rgba(0, 255, 65, 0.8); }
                    100% { transform: scale(1); text-shadow: 0 0 20px rgba(0, 255, 65, 0.5); }
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// Flash Challenge Component with Disclaimer and Retry Penalty
const FlashChallengeContent = ({ levelData, retryCount = 0 }) => {
    const [flashTimeLeft, setFlashTimeLeft] = useState(levelData.flashDuration);
    const [isLocked, setIsLocked] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [adjustedDuration, setAdjustedDuration] = useState(levelData.flashDuration);

    useEffect(() => {
        // Calculate adjusted duration based on retries (reduce 2s per retry, minimum 5s)
        const newDuration = Math.max(5, levelData.flashDuration - (retryCount * 2));
        setAdjustedDuration(newDuration);
        setFlashTimeLeft(newDuration);
        setIsLocked(false);
        setShowDisclaimer(true);
    }, [levelData, retryCount]);

    useEffect(() => {
        if (showDisclaimer || isLocked || flashTimeLeft <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setFlashTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [flashTimeLeft, showDisclaimer, isLocked]);

    const renderFlashData = () => {
        if (levelData.subType === 'TABLE_FLASH') {
            // Safety check: ensure flashData exists and is an array
            if (!levelData.flashData || !Array.isArray(levelData.flashData) || levelData.flashData.length === 0) {
                return <div style={{ color: 'var(--accent-error)', padding: '1rem' }}>ERROR: No table data available</div>;
            }

            return (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                                {Object.keys(levelData.flashData[0]).map(key => (
                                    <th key={key} style={{ padding: '0.75rem', color: 'var(--accent-secondary)' }}>{key.toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {levelData.flashData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} style={{ padding: '0.75rem' }}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (levelData.subType === 'QUERY_FLASH') {
            return (
                <pre style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '1.1rem',
                    border: '2px solid var(--accent-primary)',
                    whiteSpace: 'pre-wrap'
                }}>
                    {levelData.flashData}
                </pre>
            );
        }

        if (levelData.subType === 'LOGICAL_DECISION') {
            // For logical decision, show the table data if available
            if (levelData.flashData && Array.isArray(levelData.flashData) && levelData.flashData.length > 0) {
                return (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                                    {Object.keys(levelData.flashData[0]).map(key => (
                                        <th key={key} style={{ padding: '0.75rem', color: 'var(--accent-secondary)' }}>{key.toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {levelData.flashData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={{ padding: '0.75rem' }}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div>
            {/* Disclaimer Popup */}
            {showDisclaimer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                        border: '3px solid var(--accent-warning)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2.5rem',
                        maxWidth: '600px',
                        textAlign: 'center',
                        boxShadow: '0 0 50px rgba(255, 204, 0, 0.3)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: 'var(--accent-warning)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                            MEMORY CHALLENGE AHEAD
                        </h2>
                        <div style={{
                            background: 'rgba(255, 204, 0, 0.1)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 204, 0, 0.3)'
                        }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                📊 The data will be visible for <strong style={{ color: 'var(--accent-warning)' }}>{adjustedDuration} seconds</strong>
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                🔒 After that, it will be <strong style={{ color: 'var(--accent-error)' }}>LOCKED</strong>
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                🧠 Study carefully and memorize the information!
                            </p>
                        </div>
                        {retryCount > 0 && (
                            <div style={{
                                background: 'rgba(255, 51, 51, 0.1)',
                                border: '1px solid var(--accent-error)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem'
                            }}>
                                <p style={{ color: 'var(--accent-error)', fontSize: '0.95rem' }}>
                                    ⚠️ RETRY PENALTY: Time reduced by {retryCount * 2}s (Attempt #{retryCount + 1})
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => setShowDisclaimer(false)}
                            style={{
                                background: 'var(--accent-warning)',
                                color: '#000',
                                border: 'none',
                                padding: '1rem 3rem',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 0 20px rgba(255, 204, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            I'M READY
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {!showDisclaimer && (
                <div>
                    {!isLocked ? (
                        <div className="animate-fade-in">
                            <div style={{
                                background: 'rgba(255, 204, 0, 0.1)',
                                border: '2px solid var(--accent-warning)',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                fontSize: '2rem',
                                fontFamily: 'var(--font-code)',
                                color: 'var(--accent-warning)',
                                fontWeight: 'bold'
                            }}>
                                MEMORIZE: {flashTimeLeft}s
                                {retryCount > 0 && (
                                    <span style={{ fontSize: '0.8rem', display: 'block', marginTop: '0.5rem', color: 'var(--accent-error)' }}>
                                        (Retry #{retryCount + 1} - Reduced Time)
                                    </span>
                                )}
                            </div>
                            {renderFlashData()}
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 51, 51, 0.1)',
                            border: '2px solid var(--accent-error)',
                            padding: '3rem',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <h2 style={{ color: 'var(--accent-error)', marginBottom: '1rem' }}>🔒 DATA LOCKED</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>{levelData.prompt}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
                                HINT: {levelData.hint}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Table Query Flash Component - Table stays visible, query flashes
const TableQueryFlashContent = ({ levelData, retryCount = 0 }) => {
    const [flashTimeLeft, setFlashTimeLeft] = useState(levelData.flashDuration);
    const [isQueryLocked, setIsQueryLocked] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [adjustedDuration, setAdjustedDuration] = useState(levelData.flashDuration);

    useEffect(() => {
        // Calculate adjusted duration based on retries (reduce 2s per retry, minimum 5s)
        const newDuration = Math.max(5, levelData.flashDuration - (retryCount * 2));
        setAdjustedDuration(newDuration);
        setFlashTimeLeft(newDuration);
        setIsQueryLocked(false);
        setShowDisclaimer(true);
    }, [levelData, retryCount]);

    useEffect(() => {
        if (showDisclaimer || isQueryLocked || flashTimeLeft <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setFlashTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [flashTimeLeft, showDisclaimer, isQueryLocked]);

    useEffect(() => {
        if (flashTimeLeft <= 0) {
            setIsQueryLocked(true);
        }
    }, [flashTimeLeft]);

    const renderTable = (tableData) => {
        if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
            return <div style={{ color: 'var(--accent-error)', padding: '1rem' }}>ERROR: No table data available</div>;
        }

        return (
            <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontFamily: 'var(--font-code)' }}>
                    EVENTS TABLE (Reference)
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                            {Object.keys(tableData[0]).map(key => (
                                <th key={key} style={{ padding: '0.75rem', color: 'var(--accent-secondary)' }}>{key.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {Object.values(row).map((val, j) => (
                                    <td key={j} style={{ padding: '0.75rem' }}>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            {/* Disclaimer Popup */}
            {showDisclaimer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                        border: '3px solid var(--accent-warning)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2.5rem',
                        maxWidth: '600px',
                        textAlign: 'center',
                        boxShadow: '0 0 50px rgba(255, 204, 0, 0.3)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: 'var(--accent-warning)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                            MEMORY CHALLENGE AHEAD
                        </h2>
                        <div style={{
                            background: 'rgba(255, 204, 0, 0.1)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255, 204, 0, 0.3)'
                        }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                📑 The query will be visible for <strong style={{ color: 'var(--accent-warning)' }}>{adjustedDuration} seconds</strong>
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                🔒 After that, the query will be <strong style={{ color: 'var(--accent-error)' }}>LOCKED</strong>
                            </p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                🧠 Study the query carefully. You will need to apply it to the table below!
                            </p>
                        </div>
                        {retryCount > 0 && (
                            <div style={{
                                background: 'rgba(255, 51, 51, 0.1)',
                                border: '1px solid var(--accent-error)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem'
                            }}>
                                <p style={{ color: 'var(--accent-error)', fontSize: '0.95rem' }}>
                                    ⚠️ RETRY PENALTY: Time reduced by {retryCount * 2}s (Attempt #{retryCount + 1})
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => setShowDisclaimer(false)}
                            style={{
                                background: 'var(--accent-warning)',
                                color: '#000',
                                border: 'none',
                                padding: '1rem 3rem',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            I'M READY
                        </button>
                    </div>
                </div>
            )}

            {/* Query Flash Section */}
            {!showDisclaimer && (
                <div>
                    {!isQueryLocked ? (
                        <div className="animate-fade-in">
                            <div style={{
                                background: 'rgba(255, 204, 0, 0.1)',
                                border: '2px solid var(--accent-warning)',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                fontSize: '2rem',
                                fontFamily: 'var(--font-code)',
                                color: 'var(--accent-warning)',
                                fontWeight: 'bold'
                            }}>
                                MEMORIZE QUERY: {flashTimeLeft}s
                            </div>
                            <pre style={{
                                background: 'var(--bg-tertiary)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-md)',
                                fontFamily: 'var(--font-code)',
                                fontSize: '1.1rem',
                                border: '2px solid var(--accent-primary)',
                                whiteSpace: 'pre-wrap',
                                marginBottom: '1.5rem'
                            }}>
                                {levelData.flashData}
                            </pre>
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255, 51, 51, 0.1)',
                            border: '2px solid var(--accent-error)',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <h3 style={{ color: 'var(--accent-error)', marginBottom: '0.5rem' }}>🔒 QUERY LOCKED</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{levelData.prompt}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                HINT: {levelData.hint}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Table Always Visible (Wait for disclaimer if desired, but user said 'when this pop up shows... timer is started', implying the background content might be visible or they just want the timer stopped until 'ready') */}
            {/* Keeping table visible for reference as per original design, but the flash data is what matters */}
            {renderTable(levelData.tableData)}
        </div>
    );
};

// Round 4 Multi-Question Component
const Round4MultiQuestion = ({ levelData, onSubmitAll }) => {
    const [answers, setAnswers] = useState(['', '', '', '', '']);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await Promise.all([
                onSubmitAll(answers, setIncorrectQuestions),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTable = (table, tableName) => {
        if (!table || table.length === 0) return null;

        return (
            <div style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem'
            }}>
                <h4 style={{
                    color: 'var(--accent-secondary)',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.9rem'
                }}>
                    TABLE: {tableName}
                </h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-code)'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                                {Object.keys(table[0]).map(key => (
                                    <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                                        {key.toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} style={{ padding: '0.5rem' }}>{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
                background: 'rgba(0, 255, 204, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-secondary)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>
                    {levelData.subtitle}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    ⏱ No time limit • 📊 Tables always visible • ✅ All answers must be correct
                </p>
            </div>

            {levelData.questions.map((q, idx) => (
                <div
                    key={q.id}
                    style={{
                        background: incorrectQuestions.includes(q.id)
                            ? 'rgba(255, 51, 51, 0.05)'
                            : 'var(--bg-secondary)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: incorrectQuestions.includes(q.id)
                            ? '2px solid var(--accent-error)'
                            : '1px solid var(--border-subtle)'
                    }}
                >
                    <h3 style={{
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                    }}>
                        {q.title}
                    </h3>

                    {renderTable(q.table, q.tableName)}

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q.question}</p>
                        {q.query && (
                            <pre style={{
                                background: 'var(--bg-tertiary)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--font-code)',
                                color: 'var(--accent-secondary)',
                                overflowX: 'auto',
                                marginTop: '0.5rem'
                            }}>
                                {q.query}
                            </pre>
                        )}
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            marginTop: '0.5rem'
                        }}>
                            HINT: {q.hint}
                        </p>
                    </div>

                    <input
                        type="text"
                        value={answers[idx]}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        placeholder={`Answer for Q${idx + 1}...`}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--bg-primary)',
                            border: incorrectQuestions.includes(q.id)
                                ? '1px solid var(--accent-error)'
                                : '1px solid var(--accent-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            outline: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-code)'
                        }}
                    />
                </div>
            ))}

            <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    opacity: isSubmitting ? 0.8 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    background: isSubmitting ? 'var(--accent-warning)' : 'var(--accent-primary)',
                    transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minWidth: '200px'
                }}
                disabled={answers.some(a => !a.trim()) || isSubmitting}
            >
                {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #000',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite'
                        }}></span>
                        PROCESSING...
                    </span>
                ) : (
                    'SUBMIT ALL ANSWERS'
                )}
            </button>
        </div>
    );
};

// Round 4 Phase 1: Query Matching Component
const QueryMatchingComponent = ({ levelData, onSubmit }) => {
    const [mapping, setMapping] = useState({});
    const [incorrectQueries, setIncorrectQueries] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOutputSelect = (queryId, outputId) => {
        setMapping(prev => ({ ...prev, [queryId]: outputId }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await Promise.all([
                onSubmit(mapping, setIncorrectQueries),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTables = (tables) => {
        return Object.entries(tables).map(([tableName, tableData]) => {
            if (!tableData || tableData.length === 0) return null;

            return (
                <div key={tableName} style={{
                    background: 'var(--bg-secondary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{
                        color: 'var(--accent-secondary)',
                        marginBottom: '0.75rem',
                        fontFamily: 'var(--font-code)',
                        fontSize: '0.9rem'
                    }}>
                        TABLE: {tableName.toUpperCase()}
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-code)'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                                    {Object.keys(tableData[0]).map(key => (
                                        <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                                            {key.toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={{ padding: '0.5rem' }}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        });
    };

    const renderOutput = (output) => {
        if (!output.data || output.data.length === 0) return null;

        return (
            <div style={{
                background: 'var(--bg-tertiary)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginTop: '0.5rem'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-code)'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                            {Object.keys(output.data[0]).map(key => (
                                <th key={key} style={{ padding: '0.4rem', color: 'var(--accent-secondary)' }}>
                                    {key.toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {output.data.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                {Object.values(row).map((val, j) => (
                                    <td key={j} style={{ padding: '0.4rem' }}>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Info Banner */}
            <div style={{
                background: 'rgba(0, 255, 204, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-secondary)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>
                    {levelData.subtitle}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    ⏱ No time limit • 📊 All tables visible • ✅ All matches must be correct
                </p>
            </div>

            {/* Tables Section */}
            <div>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📊 Reference Tables</h3>
                {renderTables(levelData.tables)}
            </div>

            {/* Queries and Outputs Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Queries Column */}
                <div>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>🔍 SQL Queries</h3>
                    {levelData.queries.map((query) => (
                        <div key={query.id} style={{
                            background: incorrectQueries.includes(query.id)
                                ? 'rgba(255, 51, 51, 0.05)'
                                : 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: incorrectQueries.includes(query.id)
                                ? '2px solid var(--accent-error)'
                                : '1px solid var(--border-subtle)',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                                {query.label}
                            </h4>
                            <pre style={{
                                background: 'var(--bg-tertiary)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontFamily: 'var(--font-code)',
                                color: 'var(--text-primary)',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap',
                                marginBottom: '0.75rem'
                            }}>
                                {query.sql}
                            </pre>
                            <select
                                value={mapping[query.id] || ''}
                                onChange={(e) => handleOutputSelect(query.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--accent-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'var(--font-code)'
                                }}
                            >
                                <option value="">Select output...</option>
                                {levelData.outputs.map(output => (
                                    <option key={output.id} value={output.id}>
                                        {output.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Outputs Column */}
                <div>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📤 Query Outputs</h3>
                    {levelData.outputs.map((output) => (
                        <div key={output.id} style={{
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                                {output.label}
                            </h4>
                            {renderOutput(output)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    opacity: isSubmitting ? 0.8 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    background: isSubmitting ? 'var(--accent-warning)' : 'var(--accent-primary)',
                    transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minWidth: '200px'
                }}
                disabled={Object.keys(mapping).length !== levelData.queries.length || isSubmitting}
            >
                {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #000',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite'
                        }}></span>
                        PROCESSING...
                    </span>
                ) : (
                    `SUBMIT MATCHES (${Object.keys(mapping).length}/${levelData.queries.length})`
                )}
            </button>
        </div>
    );
};

// Round 4 Phase 2: Query Fixing Component
const QueryFixingComponent = ({ levelData, onSubmitAll }) => {
    const [answers, setAnswers] = useState(['', '', '', '', '']);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await Promise.all([
                onSubmitAll(answers, setIncorrectQuestions),
                new Promise(resolve => setTimeout(resolve, 500))
            ]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTables = (tables) => {
        return Object.entries(tables).map(([tableName, tableData]) => {
            if (!tableData || tableData.length === 0) return null;

            return (
                <div key={tableName} style={{
                    background: 'var(--bg-secondary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{
                        color: 'var(--accent-secondary)',
                        marginBottom: '0.75rem',
                        fontFamily: 'var(--font-code)',
                        fontSize: '0.9rem'
                    }}>
                        TABLE: {tableName.toUpperCase()}
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-code)'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--accent-primary)', textAlign: 'left' }}>
                                    {Object.keys(tableData[0]).map(key => (
                                        <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                                            {key.toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={{ padding: '0.5rem' }}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Info Banner */}
            <div style={{
                background: 'rgba(0, 255, 204, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-secondary)',
                textAlign: 'center'
            }}>
                <p style={{ color: 'var(--accent-secondary)', fontSize: '0.95rem' }}>
                    {levelData.subtitle}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    ⏱ No time limit • 📊 Tables always visible • ✅ All corrections must be correct
                </p>
            </div>

            {/* Tables Section */}
            <div>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>📊 Reference Tables</h3>
                {renderTables(levelData.tables)}
            </div>

            {/* Questions */}
            {levelData.questions.map((q, idx) => (
                <div
                    key={q.id}
                    style={{
                        background: incorrectQuestions.includes(q.id)
                            ? 'rgba(255, 51, 51, 0.05)'
                            : 'var(--bg-secondary)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: incorrectQuestions.includes(q.id)
                            ? '2px solid var(--accent-error)'
                            : '1px solid var(--border-subtle)'
                    }}
                >
                    <h3 style={{
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontSize: '1.1rem'
                    }}>
                        {q.title}
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }}>
                            BROKEN QUERY:
                        </p>
                        <pre style={{
                            background: 'rgba(255, 51, 51, 0.1)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-code)',
                            color: 'var(--accent-error)',
                            overflowX: 'auto',
                            border: '1px solid var(--accent-error)'
                        }}>
                            {q.brokenQuery}
                        </pre>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{q.task}</p>
                        <p style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                        }}>
                            HINT: {q.hint}
                        </p>
                    </div>

                    <input
                        type="text"
                        value={answers[idx]}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        placeholder="Enter your correction..."
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--bg-primary)',
                            border: incorrectQuestions.includes(q.id)
                                ? '1px solid var(--accent-error)'
                                : '1px solid var(--accent-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            outline: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-code)'
                        }}
                    />
                </div>
            ))}

            {/* Submit Button */}
            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{
                    fontSize: '1.1rem',
                    padding: '1rem 2rem',
                    opacity: isSubmitting ? 0.8 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    background: isSubmitting ? 'var(--accent-warning)' : 'var(--accent-primary)',
                    transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minWidth: '200px'
                }}
                disabled={answers.some(a => !a.trim()) || isSubmitting}
            >
                {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #000',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite'
                        }}></span>
                        PROCESSING...
                    </span>
                ) : (
                    'SUBMIT ALL CORRECTIONS'
                )}
            </button>
        </div>
    );
};

const GameScreen = () => {
    const { state, submitAnswer, error } = useGame();
    const [input, setInput] = useState('');
    const [levelData, setLevelData] = useState(null);
    const [showRetry, setShowRetry] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-submission
    const [flashRetryCount, setFlashRetryCount] = useState(0); // Track Round 3 retries for time penalty

    // --- MISSION BRIEFING LOGIC ---
    const [showBriefing, setShowBriefing] = useState(false);

    // Reset briefing on new round
    useEffect(() => {
        // Only show for Stage 1 of a new round
        if (state.stage === 1) {
            setShowBriefing(true);
        }
    }, [state.round]); // Only trigger when round changes


    // Initialize/Update Level Data
    useEffect(() => {
        if (state.screen === 'SUCCESS') return;

        const data = GameService.getStageData(state.round, state.stage);
        setLevelData(data);
        setInput('');
        setShowRetry(false);
        setFlashRetryCount(0); // Reset retry count for new stage
    }, [state.round, state.stage, state.screen]);

    if (state.screen === 'SUCCESS') {
        return <WinScreen state={state} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double-submission

        setIsSubmitting(true);
        try {
            // Add minimum delay to ensure PROCESSING state is visible
            const [result] = await Promise.all([
                submitAnswer(input),
                new Promise(resolve => setTimeout(resolve, 500)) // Minimum 500ms delay
            ]);

            if (!result.success) {
                setShowRetry(true);
                // Increment retry count for Round 3 flash challenges
                if (state.round === 3 && levelData?.type === 'FLASH_CHALLENGE') {
                    setFlashRetryCount(prev => prev + 1);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragDropSubmit = async (query) => {
        if (isSubmitting) return; // Prevent double-submission

        setIsSubmitting(true);
        try {
            const result = await submitAnswer(query);
            if (!result.success) {
                setShowRetry(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setInput('');
        setShowRetry(false);
    };

    const handleRound4Submit = async (answers, setIncorrectQuestions) => {
        if (isSubmitting) return; // Prevent double-submission

        setIsSubmitting(true);
        try {
            const result = await submitAnswer(JSON.stringify(answers));
            if (!result.success && result.incorrectQuestions) {
                setIncorrectQuestions(result.incorrectQuestions);
                setShowRetry(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQueryMatching = async (mapping, setIncorrectQueries) => {
        if (isSubmitting) return; // Prevent double-submission

        setIsSubmitting(true);
        try {
            const result = await submitAnswer(JSON.stringify(mapping));
            if (!result.success && result.incorrectQueries) {
                setIncorrectQueries(result.incorrectQueries);
                setShowRetry(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQueryFixing = async (answers, setIncorrectQuestions) => {
        if (isSubmitting) return; // Prevent double-submission

        setIsSubmitting(true);
        try {
            const result = await submitAnswer(JSON.stringify(answers));
            if (!result.success && result.incorrectQuestions) {
                setIncorrectQuestions(result.incorrectQuestions);
                setShowRetry(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    };



    const getBriefingContent = () => {
        switch (state.round) {
            case 1: return {
                title: "DATABASE FOUNDATION",
                mission: "The system core is unstable. Your first task is to restore basic connectivity.",
                task: "Correct the syntax of the corrupted SQL queries to re-initialize the database link."
            };
            case 2: return {
                title: "NODE LOGIC TRAVERSAL",
                mission: "Connectivity is restored, but the logic is flawed. Data is flowing incorrectly.",
                task: "Identify conceptual errors in the query logic. Ensure the data retrieval paths are valid."
            };
            case 3: return {
                title: "DATA STREAM ANALYSIS",
                mission: "The stream is volatile. Data fragments appear only for seconds.",
                task: "Memorize the data tables and reconstruction logs. Validating the integrity of the stream is critical."
            };
            case 4: return {
                title: "PHYSICAL-DIGITAL BRIDGE",
                mission: "The digital lock requires a physical key. The system has fragmented into the real world.",
                task: "Analyze the legacy project manifests (Phase 1 & 2) to reveal the location of the physical access code."
            };
            case 5: return {
                title: "CORE SYSTEM RESTORATION",
                mission: "You have reached the System Core. This is the final barrier.",
                task: "Unlock the node, recover the data, and make the ultimate decision to save the event."
            };
            default: return { title: "UNKNOWN MISSION", mission: "Awaiting instructions...", task: "Stand by." };
        }
    };

    const renderBriefing = () => {
        const content = getBriefingContent();
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
            }} className="animate-fade-in">
                <div style={{
                    maxWidth: '600px',
                    width: '90%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent-primary)',
                    padding: '3rem',
                    textAlign: 'center',
                    boxShadow: '0 0 50px rgba(0, 255, 65, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--accent-primary)' }}></div>
                    <div style={{ marginBottom: '2rem', fontSize: '3rem' }}>🛡️</div>

                    <h1 className="glitch" style={{
                        fontSize: '2rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '0.5rem',
                        letterSpacing: '2px'
                    }}>
                        MISSION BRIEFING
                    </h1>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '2rem', fontFamily: 'var(--font-code)' }}>
                        // {content.title}
                    </h2>

                    <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            <strong style={{ color: '#fff' }}>OBJECTIVE:</strong><br />
                            {content.mission}
                        </p>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            <strong style={{ color: '#fff' }}>DIRECTIVE:</strong><br />
                            {content.task}
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowBriefing(false)}
                        style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
                    >
                        INITIATE PROTOCOL
                    </button>
                </div>
            </div>
        );
    };

    // START: Blocking Error Screen REMOVED to prevent unmounting/state loss on validation error.
    // Errors are now handled inline by the components.
    /*
    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <div style={{
                    color: 'var(--accent-error)',
                    fontSize: '1.2rem',
                    border: '1px solid var(--accent-error)',
                    padding: '2rem',
                    display: 'inline-block'
                }}>
                    <h3>⚠ SYSTEM ERROR</h3>
                    <p>{error}</p>
                    <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
                        REBOOT TERMINAL
                    </button>
                </div>
            </div>
        );
    }
    */
    // END: Blocking Error Screen REMOVED

    // Show Briefing Overlay if active
    if (showBriefing && levelData) {
        return renderBriefing();
    }

    if (!levelData) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <h2 className="glow-text">SYSTEM OFFLINE</h2>
                <p style={{ marginBottom: '2rem' }}>Invalid game state detected.</p>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                >
                    RESET SYSTEM
                </button>
            </div>
        );
    }

    const renderContent = () => {
        if (levelData.type === 'SQL_ORDER') {
            return (
                <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        // RECONSTRUCT THE CORRUPTED QUERY FRAGMENTS
                    </p>

                    {error && (
                        <div className="animate-fade-in" style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            border: '1px solid var(--accent-error)',
                            background: 'rgba(255, 51, 51, 0.1)',
                            borderRadius: '4px'
                        }}>
                            <div style={{ color: 'var(--accent-error)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                ⚠ COMPILATION FAILED
                            </div>
                            <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                {error}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                                // HINT: {levelData.hint}
                            </div>
                            <button
                                className="btn btn-outline"
                                style={{ borderColor: 'var(--accent-error)', color: 'var(--accent-error)' }}
                                onClick={() => {
                                    handleRetry();
                                    setResetKey(prev => prev + 1);
                                }}
                            >
                                ↺ RESET SEGMENTS
                            </button>
                        </div>
                    )}

                    <DragDropSQL
                        key={resetKey}
                        fragments={levelData.content}
                        onSubmit={handleDragDropSubmit}
                    />
                </div>
            );
        }

        if (levelData.type === 'FLASH_CHALLENGE') {
            return <FlashChallengeContent levelData={levelData} retryCount={flashRetryCount} />;
        }

        if (levelData.type === 'TABLE_QUERY_FLASH') {
            return <TableQueryFlashContent levelData={levelData} retryCount={flashRetryCount} />;
        }

        if (levelData.type === 'DATA_ANALYSIS') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Object.entries(levelData.tables).map(([tableName, rows]) => (
                            <div key={tableName} style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-code)' }}>
                                    TABLE: {tableName.toUpperCase()}
                                </h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                                {rows.length > 0 && Object.keys(rows[0]).map(key => (
                                                    <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                                                        {key.toUpperCase()}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} style={{ padding: '0.5rem' }}>{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid var(--accent-primary)'
                    }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{levelData.content}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>HINT: {levelData.hint}</p>
                    </div>
                </div>
            );
        }

        if (levelData.type === 'LOCATION_REVEAL') {
            return (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
                    <div style={{
                        fontSize: '3rem',
                        color: 'var(--accent-primary)',
                        textShadow: '0 0 20px var(--accent-primary)',
                        marginBottom: '1rem'
                    }}>
                        {levelData.location}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                        {levelData.hint}
                    </div>
                    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--accent-warning)', color: 'var(--accent-warning)', display: 'inline-block' }}>
                        ⚠ PHYSICAL INTERVENTION REQUIRED
                    </div>
                </div>
            );
        }

        if (levelData.type === 'QUERY_MATCHING') {
            return <QueryMatchingComponent levelData={levelData} onSubmit={handleQueryMatching} />;
        }

        if (levelData.type === 'QUERY_FIXING') {
            return <QueryFixingComponent levelData={levelData} onSubmitAll={handleQueryFixing} />;
        }

        if (levelData.type === 'SQL_REASONING_MULTI') {
            return <Round4MultiQuestion levelData={levelData} onSubmitAll={handleRound4Submit} />;
        }

        if (levelData.type === 'EMAIL_CODE_ENTRY') {
            return (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
                    <div style={{
                        fontSize: '2rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '1.5rem',
                        padding: '2rem',
                        background: 'rgba(0, 255, 65, 0.05)',
                        border: '2px solid var(--accent-primary)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        📧 CHECK YOUR EMAIL
                    </div>
                    {levelData.location && (
                        <div style={{
                            fontSize: '1.5rem',
                            color: 'var(--accent-warning)',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(255, 204, 0, 0.1)',
                            border: '1px dashed var(--accent-warning)',
                            fontFamily: 'var(--font-code)'
                        }}>
                            📍 LOCATION: {levelData.location}
                        </div>
                    )}
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{levelData.content}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {levelData.hint}
                    </p>
                </div>
            );
        }



        if (levelData.type === 'ROUND_COMPLETE') {
            return (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="animate-fade-in">
                    <h1 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>MISSION ACCOMPLISHED</h1>
                    <p style={{ fontSize: '1.2rem' }}>{levelData.content}</p>
                </div>
            );
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>{levelData.title.toUpperCase()}</h1>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-code)' }}>
                        <span>PHASE {state.stage}</span>
                    </div>
                </div>
            </div>

            <div className="card animate-fade-in">
                {renderContent()}

                {![
                    'ROUND_COMPLETE',
                    'SQL_ORDER',
                    'QUERY_MATCHING',
                    'QUERY_FIXING',
                    'SQL_REASONING_MULTI'
                ].includes(levelData.type) && (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>
                                    {levelData.type === 'LOCATION_REVEAL' ? 'ENTER ACCESS CODE_' :
                                        levelData.type === 'DATA_ANALYSIS' ? 'INPUT ANALYSIS RESULT_' :
                                            levelData.type === 'FLASH_CHALLENGE' ? 'INPUT YOUR ANSWER_' : 'INPUT CORRECTED QUERY_'}
                                </label>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="text-code"
                                    autoComplete="off"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'var(--bg-primary)',
                                        border: error ? '1px solid var(--accent-error)' : '1px solid var(--accent-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.1rem',
                                        outline: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                                    }}
                                    autoFocus
                                    placeholder={levelData.placeholder || "Enter code..."}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    color: 'var(--accent-error)',
                                    marginBottom: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(255, 51, 51, 0.1)',
                                    borderLeft: '4px solid var(--accent-error)',
                                    fontFamily: 'var(--font-code)',
                                    fontSize: '0.9rem'
                                }}>
                                    [ERROR]: {error}
                                </div>
                            )}

                            {showRetry && (
                                <div style={{
                                    background: 'rgba(255, 204, 0, 0.1)',
                                    border: '1px solid var(--accent-warning)',
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'var(--accent-warning)' }}>
                                        ⚠ Incorrect answer. Try again?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRetry}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        RETRY
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {levelData.type === 'SQL_ORDER' ? 'NOTE: ORDER MATTERS' : 'SECURE CHANNEL'}
                                </span>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    style={{
                                        opacity: isSubmitting ? 0.8 : 1,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        background: isSubmitting ? 'var(--accent-warning)' : 'var(--accent-primary)',
                                        transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        minWidth: '150px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '12px',
                                                height: '12px',
                                                border: '2px solid #000',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 0.6s linear infinite'
                                            }}></span>
                                            PROCESSING...
                                        </span>
                                    ) : (
                                        levelData.type === 'LOCATION_REVEAL' ? 'AUTHENTICATE' : 'EXECUTE'
                                    )}
                                </button>
                            </div>
                            <style>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </form>
                    )}
            </div>
        </div>
    );
};

export default GameScreen;
