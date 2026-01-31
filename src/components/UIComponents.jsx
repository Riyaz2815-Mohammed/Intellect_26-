import React from 'react';
import './UIComponents.css';

// Loading Spinner Component
export const LoadingSpinner = ({ message = "Processing..." }) => (
    <div className="loading-overlay">
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">{message}</p>
        </div>
    </div>
);

// Progress Bar Component
export const ProgressBar = ({ current, total, label }) => {
    const percentage = (current / total) * 100;

    return (
        <div className="progress-container">
            {label && <div className="progress-label">{label}</div>}
            <div className="progress-bar-wrapper">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                >
                    <span className="progress-text">{current} / {total}</span>
                </div>
            </div>
            <div className="progress-percentage">{Math.round(percentage)}%</div>
        </div>
    );
};

// Round Progress Indicator
export const RoundProgress = ({ round, stage, totalStages }) => {
    const roundNames = {
        1: 'SQL BASICS',
        2: 'PHYSICAL ACCESS',
        3: 'MEMORY ANALYSIS',
        4: 'ADVANCED QUERIES'
    };

    return (
        <div className="round-progress">
            <div className="round-info">
                <span className="round-number">ROUND {round}</span>
                <span className="round-name">{roundNames[round]}</span>
            </div>
            <div className="stage-dots">
                {[...Array(totalStages)].map((_, i) => (
                    <div
                        key={i}
                        className={`stage-dot ${i + 1 === stage ? 'active' : i + 1 < stage ? 'completed' : ''}`}
                    >
                        {i + 1 < stage ? '✓' : i + 1}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Error Message
export const ErrorMessage = ({ message, hint, onRetry, attemptsLeft }) => (
    <div className="error-message-container">
        <div className="error-icon">❌</div>
        <div className="error-content">
            <h3 className="error-title">INCORRECT ANSWER</h3>
            <p className="error-message">{message}</p>
            {hint && (
                <div className="error-hint">
                    <span className="hint-icon">💡</span>
                    <span className="hint-text">{hint}</span>
                </div>
            )}
            {attemptsLeft !== undefined && (
                <p className="attempts-remaining">
                    Attempts Remaining: <strong>{attemptsLeft}</strong>
                </p>
            )}
        </div>
        {onRetry && (
            <button className="retry-button" onClick={onRetry}>
                TRY AGAIN
            </button>
        )}
    </div>
);

// Success Message
export const SuccessMessage = ({ message, points, timeBonus }) => (
    <div className="success-message-container">
        <div className="success-icon">✅</div>
        <div className="success-content">
            <h3 className="success-title">CORRECT!</h3>
            <p className="success-message">{message}</p>
            <div className="points-display">
                <div className="points-item">
                    <span className="points-label">Points:</span>
                    <span className="points-value">+{points}</span>
                </div>
                {timeBonus > 0 && (
                    <div className="points-item bonus">
                        <span className="points-label">Time Bonus:</span>
                        <span className="points-value">+{timeBonus}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Timer Component with Visual Feedback
export const Timer = ({ seconds, warning = 10, critical = 5 }) => {
    const getTimerClass = () => {
        if (seconds <= critical) return 'critical';
        if (seconds <= warning) return 'warning';
        return 'normal';
    };

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`timer-display ${getTimerClass()}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(seconds)}</span>
        </div>
    );
};

// Hint Button Component
export const HintButton = ({ onClick, cost, disabled }) => (
    <button
        className="hint-button"
        onClick={onClick}
        disabled={disabled}
    >
        <span className="hint-icon">💡</span>
        <span className="hint-text">Get Hint</span>
        <span className="hint-cost">(-{cost} pts)</span>
    </button>
);

// Countdown Component (for flash challenges)
export const Countdown = ({ seconds, onComplete }) => {
    const [timeLeft, setTimeLeft] = React.useState(seconds);

    React.useEffect(() => {
        if (timeLeft <= 0) {
            onComplete?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / seconds) * circumference;

    return (
        <div className="countdown-container">
            <svg className="countdown-svg" width="120" height="120">
                <circle
                    className="countdown-bg"
                    cx="60"
                    cy="60"
                    r={radius}
                />
                <circle
                    className="countdown-progress"
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                />
            </svg>
            <div className="countdown-text">{timeLeft}s</div>
        </div>
    );
};

// Notification Toast
export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

// Confirmation Dialog
export const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
    <div className="dialog-overlay">
        <div className="dialog-container">
            <h3 className="dialog-title">{title}</h3>
            <p className="dialog-message">{message}</p>
            <div className="dialog-actions">
                <button className="dialog-button cancel" onClick={onCancel}>
                    Cancel
                </button>
                <button className="dialog-button confirm" onClick={onConfirm}>
                    Confirm
                </button>
            </div>
        </div>
    </div>
);
