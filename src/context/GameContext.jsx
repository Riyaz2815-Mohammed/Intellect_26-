import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
    lastSubmission: null,
    error: null,
    roundPath: getRoundPath(localStorage.getItem('teamId')), // Restore path
};

// Actions
const ACTION = {
    LOGIN: 'LOGIN',
    START_ROUND: 'START_ROUND',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    NEXT_STAGE: 'NEXT_STAGE',
    SET_ERROR: 'SET_ERROR',
    ADMIN_OVERRIDE: 'ADMIN_OVERRIDE',
};

// Reducer
function gameReducer(state, action) {
    switch (action.type) {
        case ACTION.LOGIN:
            const assignedPath = getRoundPath(action.payload.id);
            return {
                ...state,
                screen: 'LOBBY',
                teamId: action.payload.id,
                teamName: action.payload.name,
                teamEmail: action.payload.email,
                roundPath: assignedPath,
                error: null,
            };
        case ACTION.START_ROUND:
            // If round 0 (Start Game), pick the first round from assigned path
            const targetRound = action.payload.round === 0 ? state.roundPath[0] : action.payload.round;
            return {
                ...state,
                screen: 'GAME',
                round: targetRound,
                stage: 1,
                roundEndsAt: Date.now() + (action.payload.duration || 600) * 1000,
                error: null,
            };
        case ACTION.NEXT_STAGE:
            return {
                ...state,
                stage: state.stage + 1,
                score: state.score + action.payload.points,
                error: null,
            };
        case ACTION.SET_ERROR:
            return {
                ...state,
                error: action.payload,
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

import { GameService } from '../services/GameService';
import { EmailService } from '../services/EmailService';

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

    const login = (id, name, email) => {
        if (!id || !name || !email) {
            dispatch({ type: ACTION.SET_ERROR, payload: 'All fields required' });
            return;
        }
        dispatch({ type: ACTION.LOGIN, payload: { id, name, email } });
    };

    const logout = () => {
        dispatch({ type: ACTION.LOGOUT });
    };

    const startRound = (roundNumber, duration = 600) => {
        dispatch({ type: ACTION.START_ROUND, payload: { round: roundNumber, duration } });
    };

    const getNextRound = (currentRound) => {
        const path = state.roundPath || ROUND_PATHS[0];
        const currentIndex = path.indexOf(currentRound);

        if (currentIndex !== -1 && currentIndex < (path.length - 1)) {
            // Move to next round in the shuffled path
            return path[currentIndex + 1];
        } else {
            // Path complete (all 4 done), move to Round 5 (Final)
            return 5;
        }
    };

    const submitAnswer = async (answer) => {
        dispatch({ type: ACTION.SET_ERROR, payload: null });

        const result = GameService.validateSubmission(state.round, state.stage, answer);

        if (result.success) {
            // ROUND COMPLETION HELPER
            const completeRound = (pointsToAdd = 0, msg = null) => {
                const nextRound = getNextRound(state.round);
                const nextStage = 1;
                console.log(`Round ${state.round} Complete. Auto-proceeding to Round ${nextRound}...`);

                dispatch({
                    type: ACTION.ADMIN_OVERRIDE,
                    payload: {
                        round: nextRound,
                        stage: nextStage,
                        score: state.score + pointsToAdd,
                        screen: nextRound > 4 ? 'LOBBY' : 'GAME',
                        error: null
                    }
                });
                return { success: true, message: msg || 'ROUND COMPLETE' };
            };

            // CHECK ROUND COMPLETION CONDITIONS
            if (state.round === 1 && state.stage === 5) return completeRound(result.points);
            if (state.round === 2 && state.stage === 5) return completeRound(result.points);
            if (state.round === 3 && state.stage === 6) return completeRound(result.points);

            // ROUND 4 SPECIFIC LOGIC
            if (state.round === 4) {
                if (state.stage === 1 && result.triggerEmail) {
                    const emailResult = await EmailService.sendAdvantageCode(state.teamId, state.teamEmail, state.teamName);
                    if (emailResult.success) {
                        dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } });
                    } else {
                        dispatch({ type: ACTION.SET_ERROR, payload: 'Email failed.' });
                        return result;
                    }
                    return result;
                }
                if (state.stage === 2) {
                    const isValid = EmailService.validateCode(state.teamId, answer);
                    if (isValid) {
                        return completeRound(200, 'ADVANTAGE CODE VERIFIED');
                    } else {
                        dispatch({ type: ACTION.SET_ERROR, payload: 'INVALID CODE' });
                        return { success: false, message: 'INVALID CODE' };
                    }
                }
            }

            // SPECIAL CHECK FOR ROUND 5 WINNER
            if (state.round === 5 && state.stage === 10 && result.isWinner) {
                dispatch({
                    type: ACTION.ADMIN_OVERRIDE, payload: {
                        screen: 'SUCCESS',
                        score: state.score + result.points,
                        completionTime: new Date().toISOString(),
                        isWinner: true
                    }
                });
                return result;
            }

            // Normal Stage Progression
            dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } });
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
