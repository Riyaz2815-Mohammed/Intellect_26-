import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameService } from '../services/GameService';
import { EmailService } from '../services/EmailService';
import { API_BASE_URL } from '../config';

// Round Shuffling Configuration
// Round Shuffling Configuration (Rounds 1-4 are shuffled)
const ROUND_PATHS = [
    [1, 2, 3, 4], // Path A
    [2, 3, 4, 1], // Path B
    [3, 4, 1, 2], // Path C
    [4, 1, 2, 3]  // Path D
];

const getRoundPath = (teamId) => {
    if (!teamId) return ROUND_PATHS[0];
    const sum = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ROUND_PATHS[sum % ROUND_PATHS.length];
};

// Initial State
const initialState = {
    screen: localStorage.getItem('teamId') ? 'LOBBY' : 'WELCOME',
    teamId: localStorage.getItem('teamId') || null,
    teamName: localStorage.getItem('teamName') || null,
    teamEmail: localStorage.getItem('teamEmail') || null,
    round: 0,
    stage: 0,
    score: 0,
    retryCount: 0, // Track retries per stage
    totalRetries: 0, // Track total retries for the entire game
    lastSubmission: null,
    error: null,
    roundSequence: JSON.parse(localStorage.getItem('roundSequence') || '[1,2,3,4]'), // Team-specific sequence from backend
};

// SCORING CONFIGURATION (Mirrors Backend)
const ROUND_CONFIG = {
    1: { basePoints: 100, timeLimit: 300, timeMultiplier: 0.3 },
    2: { basePoints: 150, timeLimit: 600, timeMultiplier: 0.2 },
    3: { basePoints: 200, timeLimit: 120, timeMultiplier: 0.5 }, // Memory
    4: { basePoints: 250, timeLimit: 180, timeMultiplier: 0.4 }  // Advantage
};

const RETRY_PENALTY = {
    0: 0,
    1: 20,
    2: 40,
    3: 60 // Capped at 4th attempt (index 3)
};

// Actions
const ACTION = {
    LOGIN: 'LOGIN',
    START_ROUND: 'START_ROUND',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    NEXT_STAGE: 'NEXT_STAGE',
    SET_ERROR: 'SET_ERROR',
    ADMIN_OVERRIDE: 'ADMIN_OVERRIDE',
    LOGOUT: 'LOGOUT', // Added LOGOUT action
};

// Reducer
function gameReducer(state, action) {
    switch (action.type) {
        case ACTION.LOGIN:
            const roundSequence = action.payload.roundSequence || [1, 2, 3, 4];
            // Timer logic moved to START_ROUND to ensure it starts only when gameplay begins.
            return {
                ...state,
                screen: 'LOBBY',
                teamId: action.payload.id,
                teamName: action.payload.name,
                teamEmail: action.payload.email,
                round: action.payload.round || 0,
                stage: action.payload.stage || 0,
                score: action.payload.score || 0,
                totalRetries: 0,
                roundSequence: roundSequence,
                error: null,
            };
        case ACTION.START_ROUND:
            // If round 0 (Start Game), pick the first round from assigned path
            const targetRound = action.payload.round === 0 ? state.roundSequence[0] : action.payload.round;

            // Start Global Timer ONLY when the first round actually starts
            const isFirstRound = targetRound === state.roundSequence[0];
            if (isFirstRound && !localStorage.getItem('gameStartTime')) {
                localStorage.setItem('gameStartTime', Date.now().toString());
                console.log('Global Timer Started at:', new Date().toISOString());
            }

            return {
                ...state,
                screen: 'GAME',
                round: targetRound,
                stage: 1,
                retryCount: 0, // Reset retries on new round
                roundEndsAt: Date.now() + (action.payload.duration || 600) * 1000,
                error: null,
            };
        case ACTION.NEXT_STAGE:
            return {
                ...state,
                stage: state.stage + 1,
                score: state.score + action.payload.points,
                retryCount: 0, // Reset retries on next stage
                error: null,
            };
        case ACTION.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                retryCount: state.retryCount + 1, // Increment stage retry count
                totalRetries: (state.totalRetries || 0) + 1, // Increment total game retries
            };
        case ACTION.ADMIN_OVERRIDE:
            return {
                ...state,
                ...action.payload,
            };
        case ACTION.LOGOUT:
            localStorage.removeItem('CODECRYPT_STATE');
            localStorage.removeItem('teamId');
            localStorage.removeItem('teamName');
            localStorage.removeItem('teamEmail');
            localStorage.removeItem('gameStartTime'); // Clear global timer
            return {
                screen: 'WELCOME',
                teamId: null,
                teamName: null,
                teamEmail: null,
                round: 0,
                stage: 0,
                score: 0,
                lastSubmission: null,
                error: null,
                roundPath: ROUND_PATHS[0],
            };
        default:
            return state;
    }
}

const GameContext = createContext();

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState, (defaultState) => {
        const persisted = localStorage.getItem('CODECRYPT_STATE');
        if (persisted) {
            const parsed = JSON.parse(persisted);
            // Ensure roundPath exists for restored state (backward compatibility)
            if (!parsed.roundPath && parsed.teamId) {
                parsed.roundPath = getRoundPath(parsed.teamId);
            }
            // Self-Healing: Clean up invalid states if necessary
            if (parsed.stage === 0) {
                parsed.stage = 1;
            }
            return { ...parsed, error: null };
        }
        return defaultState;
    });

    useEffect(() => {
        console.log('Game State Updated:', state);
        if (state.teamId) {
            localStorage.setItem('CODECRYPT_STATE', JSON.stringify(state));
        }
    }, [state]);

    const login = (id, name, email, roundSequence = [1, 2, 3, 4]) => {
        if (!id || !name || !email) {
            dispatch({ type: ACTION.SET_ERROR, payload: 'All fields required' });
            return;
        }
        // Save roundSequence to localStorage for persistence
        localStorage.setItem('roundSequence', JSON.stringify(roundSequence));
        dispatch({ type: ACTION.LOGIN, payload: { id, name, email, roundSequence } });
    };

    const logout = () => {
        dispatch({ type: ACTION.LOGOUT });
    };

    const startRound = (roundNumber, duration = 600) => {
        dispatch({ type: ACTION.START_ROUND, payload: { round: roundNumber, duration } });
    };

    const getNextRound = (currentRound) => {
        const sequence = state.roundSequence || [1, 2, 3, 4];
        const currentIndex = sequence.indexOf(currentRound);

        if (currentIndex !== -1 && currentIndex < (sequence.length - 1)) {
            // Move to next round in team's assigned sequence
            return sequence[currentIndex + 1];
        } else {
            // All rounds complete, Game Over / Win State
            return 100; // 100 = GAME_COMPLETE
        }
    };

    const submitAnswer = async (answer) => {
        dispatch({ type: ACTION.SET_ERROR, payload: null });

        // 1. Client-Side Validation (Immediate Feedback)
        const clientResult = GameService.validateSubmission(state.round, state.stage, answer);

        // 2. Send to Backend (Async - fire and forget for speed, or await for sync)
        // We await here to ensure DB consistency
        let backendResult = null;
        try {
            if (state.teamId) {
                // Determine 'round' for backend (Backend expects integer)
                // Note: Frontend state.round is synced with backend
                const response = await fetch(`${API_BASE_URL}/game/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId: state.teamId,
                        round: state.round,
                        stage: state.stage,
                        answer: answer
                    })
                });

                if (!response.ok) {
                    console.error(`[BACKEND] Submission failed: ${response.status}`);
                    // Still continue with client-side validation
                } else {
                    backendResult = await response.json();
                    console.log('[BACKEND] Submission recorded:', backendResult);
                }
            }
        } catch (err) {
            console.error('[BACKEND] Network error:', err);
            // We continue with client-side result so game doesn't break offline
        }

        // 3. Process Result
        const result = clientResult; // Trust client logic for immediate UI updates

        if (result.success) {
            // CALCULATE SCORE
            // Formula: Base + TimeBonus - RetryPenalty
            let finalPoints = 0;
            const config = ROUND_CONFIG[state.round] || { basePoints: 100, timeLimit: 300, timeMultiplier: 0.1 };

            // 1. Base Points
            const basePoints = config.basePoints;

            // 2. Retry Penalty
            const penalty = RETRY_PENALTY[Math.min(state.retryCount, 3)] || 60;

            // Final Calculation (Frontend Estimate - now replaced by Backend Truth if available)
            finalPoints = Math.max(0, result.points - penalty);

            if (state.teamId && typeof backendResult?.newTotalScore === 'number') {
                console.log(`[SCORING] Syncing with Backend: ${backendResult.newTotalScore}`);
                finalPoints = backendResult.newTotalScore - state.score; // Diff for animation/logic if needed
                // Update state score directly from backend source of truth
            }

            console.log(`[SCORING] Round ${state.round} Stage ${state.stage}: Base ${result.points} - Penalty ${penalty} (${state.retryCount} retries) = ${finalPoints}`);

            // ROUND COMPLETION HELPER
            const completeRound = (pointsToAdd = 0, msg = null) => {
                const nextRound = getNextRound(state.round);
                const nextStage = 1;

                // Use backend total score if available, otherwise fallback to local calculation
                const finalTotalScore = (typeof backendResult?.newTotalScore === 'number')
                    ? backendResult.newTotalScore
                    : state.score + pointsToAdd;

                if (nextRound === 100) {
                    console.log('ALL ROUNDS COMPLETE. SHOWING WIN SCREEN.');

                    // Stop the global timer
                    const endTime = Date.now();
                    localStorage.setItem('gameEndTime', endTime.toString());

                    dispatch({
                        type: ACTION.ADMIN_OVERRIDE,
                        payload: {
                            screen: 'SUCCESS', // New Win Screen
                            score: finalTotalScore,
                            completionTime: new Date(endTime).toISOString(),
                            isWinner: true
                        }
                    });
                    return { success: true, message: 'MISSION ACCOMPLISHED' };
                }

                console.log(`Round ${state.round} Complete. Auto-proceeding to Round ${nextRound}...`);
                dispatch({
                    type: ACTION.ADMIN_OVERRIDE,
                    payload: {
                        round: nextRound,
                        stage: nextStage,
                        score: finalTotalScore,
                        screen: 'LOBBY', // Always go to lobby between rounds
                        error: null
                    }
                });
                return { success: true, message: msg || 'ROUND COMPLETE' };
            };

            // CHECK ROUND COMPLETION CONDITIONS
            if (state.round === 1 && state.stage === 5) return completeRound(finalPoints);
            if (state.round === 2 && state.stage === 5) return completeRound(finalPoints);

            // ROUND 3 (FLASH ROUND) LOGIC
            if (state.round === 3) {
                if (state.stage === 5) {
                    dispatch({ type: ACTION.NEXT_STAGE, payload: { points: finalPoints } });
                    return { success: true, message: 'FLASH DATA UPLOADED. CHECK SECURE CHANNEL.' };
                }
                if (state.stage === 6) {
                    return completeRound(finalPoints, 'ACCESS GRANTED');
                }
            }

            // ROUND 4 SPECIFIC LOGIC
            if (state.round === 4) {
                if (state.stage === 2) {
                    dispatch({ type: ACTION.NEXT_STAGE, payload: { points: finalPoints } });
                    return { success: true, message: 'SYSTEM PATCHED. CHECK EMAIL FOR ADVANTAGE KEY.' };
                }
                if (state.stage === 3) {
                    return completeRound(finalPoints, 'ADVANTAGE CODE VERIFIED');
                }
            }

            // Normal Stage Progression
            // Use backend total score if available, otherwise local addition
            const finalTotalScore = (typeof backendResult?.newTotalScore === 'number')
                ? backendResult.newTotalScore
                : state.score + finalPoints;

            dispatch({
                type: ACTION.NEXT_STAGE,
                payload: {
                    points: finalPoints,
                    overrideScore: finalTotalScore // Add support for absolute score setting in reducer if needed, or rely on delta logic being updated
                }
            });
            // HACK: To ensure score is exact, we might need a separate action or update NEXT_STAGE to accept absolute score
            // For now, let's assume if we pass the delta 'points', reducer adds it. 
            // Better: Dispatch ADMIN_OVERRIDE-like update for score to be perfect?
            // Actually, let's update NEXT_STAGE reducer to handle this cleaner later, but for now:
            if (typeof backendResult?.newTotalScore === 'number') {
                console.log(`[SCORING] Absolute Sync with Backend: ${backendResult.newTotalScore}`);
                dispatch({
                    type: ACTION.ADMIN_OVERRIDE,
                    payload: { score: backendResult.newTotalScore }
                });
            }

            return result;
        } else {
            dispatch({ type: ACTION.SET_ERROR, payload: result.message });
            return result;
        }
    };

    const adminOverride = (newState) => {
        dispatch({ type: ACTION.ADMIN_OVERRIDE, payload: newState });
    };

    return (
        <GameContext.Provider value={{ state, login, logout, startRound, submitAnswer, adminOverride, error: state.error }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
