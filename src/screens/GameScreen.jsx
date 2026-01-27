import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameService } from '../services/GameService';
import DragDropSQL from '../components/DragDropSQL';

// Flash Challenge Component
const FlashChallengeContent = ({ levelData }) => {
    const [flashTimeLeft, setFlashTimeLeft] = useState(levelData.flashDuration);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        setFlashTimeLeft(levelData.flashDuration);
        setIsLocked(false);
    }, [levelData]);

    useEffect(() => {
        if (flashTimeLeft <= 0) {
            setIsLocked(true);
            return;
        }

        const timer = setTimeout(() => {
            setFlashTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [flashTimeLeft]);

    const renderFlashData = () => {
        if (levelData.subType === 'TABLE_FLASH') {
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

        return null;
    };

    return (
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
    );
};

// Round 4 Multi-Question Component
const Round4MultiQuestion = ({ levelData, onSubmitAll }) => {
    const [answers, setAnswers] = useState(['', '', '', '', '']);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        onSubmitAll(answers, setIncorrectQuestions);
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
                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                disabled={answers.some(a => !a.trim())}
            >
                SUBMIT ALL ANSWERS
            </button>
        </div>
    );
};

const GameScreen = () => {
    const { state, submitAnswer, error } = useGame();
    const [input, setInput] = useState('');
    const [levelData, setLevelData] = useState(null);
    const [showRetry, setShowRetry] = useState(false);

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!state.roundEndsAt) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((state.roundEndsAt - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state.roundEndsAt]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Initialize/Update Level Data
    useEffect(() => {
        const data = GameService.getStageData(state.round, state.stage);
        setLevelData(data);
        setInput('');
        setShowRetry(false);
    }, [state.round, state.stage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (state.roundEndsAt && timeLeft === 0) return;

        const success = submitAnswer(input);
        if (!success) {
            setShowRetry(true);
        }
    };

    const handleDragDropSubmit = (query) => {
        const success = submitAnswer(query);
        if (!success) {
            setShowRetry(true);
        }
    };

    const handleRetry = () => {
        setInput('');
        setShowRetry(false);
    };

    const handleRound4Submit = (answers, setIncorrectQuestions) => {
        const result = submitAnswer(JSON.stringify(answers));
        if (result && !result.success && result.incorrectQuestions) {
            setIncorrectQuestions(result.incorrectQuestions);
            setShowRetry(true);
        }
    };

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
                    <DragDropSQL
                        fragments={levelData.content}
                        onSubmit={handleDragDropSubmit}
                    />
                </div>
            );
        }

        if (levelData.type === 'FLASH_CHALLENGE') {
            return <FlashChallengeContent levelData={levelData} />;
        }

        if (levelData.type === 'DATA_ANALYSIS') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-code)' }}>TABLE: AGENTS</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                            {Object.keys(levelData.tables.agents[0]).map(key => (
                                                <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{key.toUpperCase()}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levelData.tables.agents.map((row, i) => (
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

                        <div style={{ flex: 1, minWidth: '300px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-code)' }}>TABLE: ACCESS_LOGS</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                            {Object.keys(levelData.tables.logs[0]).map(key => (
                                                <th key={key} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{key.toUpperCase()}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levelData.tables.logs.map((row, i) => (
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
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{levelData.title}</h2>
                    <div style={{ fontFamily: 'var(--font-code)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ROUND {state.round} // PHASE {state.stage}
                    </div>
                </div>
                <div style={{
                    color: timeLeft < 60 ? 'var(--accent-error)' : 'var(--accent-warning)',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-code)',
                    fontSize: '1.5rem'
                }}>
                    {state.roundEndsAt ? formatTime(timeLeft) : '∞'}
                </div>
            </div>

            <div className="card animate-fade-in">
                {renderContent()}

                {levelData.type !== 'ROUND_COMPLETE' && levelData.type !== 'SQL_ORDER' && (
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
                                    borderRadius: 'var(--radius-sm)'
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
                            <button type="submit" className="btn btn-primary" disabled={timeLeft === 0 && state.roundEndsAt}>
                                {levelData.type === 'LOCATION_REVEAL' ? 'AUTHENTICATE' : 'EXECUTE'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GameScreen;
