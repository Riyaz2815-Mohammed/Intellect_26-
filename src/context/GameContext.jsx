import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State
const initialState = {
    screen: 'WELCOME', // WELCOME, LOGIN, LOBBY, GAME, SUCCESS, DNF
    teamId: null,
    teamName: null,
    teamEmail: null, // Added for Round 4 email delivery
    round: 0,
    stage: 0,
    score: 0,
    lastSubmission: null,
    error: null,
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
            return {
                ...state,
                screen: 'LOBBY',
                teamId: action.payload.id,
                teamName: action.payload.name,
                teamEmail: action.payload.email,
                error: null,
            };
        case ACTION.START_ROUND:
            return {
                ...state,
                screen: 'GAME',
                round: action.payload.round,
                stage: 1, // Reset stage on new round
                roundEndsAt: Date.now() + (action.payload.duration || 600) * 1000, // Default 10 mins
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
        default:
            return state;
    }
}

import { GameService } from '../services/GameService';

const GameContext = createContext();

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState, (defaultState) => {
        const persisted = localStorage.getItem('CODECRYPT_STATE');
        if (persisted) {
            const parsed = JSON.parse(persisted);
            // Reset ephemeral state
            return { ...parsed, error: null };
        }
        return defaultState;
    });

    // Debug logging & Persistence
    useEffect(() => {
        console.log('Game State Updated:', state);
        localStorage.setItem('CODECRYPT_STATE', JSON.stringify(state));
    }, [state]);

    const login = (id, name, email) => {
        if (!id || !name || !email) {
            dispatch({ type: ACTION.SET_ERROR, payload: 'All fields required' });
            return;
        }
        dispatch({ type: ACTION.LOGIN, payload: { id, name, email } });
    };

    const startRound = (roundNumber, duration = 600) => {
        dispatch({ type: ACTION.START_ROUND, payload: { round: roundNumber, duration } });
    };

    const submitAnswer = (answer) => {
        // RESET ERROR ON SUBMIT
        dispatch({ type: ACTION.SET_ERROR, payload: null });

        const result = GameService.validateSubmission(state.round, state.stage, answer);

        if (result.success) {
            // Check if this was a round completion
            if (state.round === 1 && state.stage === 5) {
                // Round 1 Code entered → Move to Round 2
                dispatch({ type: ACTION.ADMIN_OVERRIDE, payload: { round: 2, stage: 1, score: state.score + result.points, error: null } });
            } else if (state.round === 2 && state.stage === 3) {
                // Round 2 Q3 complete → Move to Round 3
                dispatch({ type: ACTION.ADMIN_OVERRIDE, payload: { round: 3, stage: 1, score: state.score + result.points, error: null } });
            } else if (state.round === 3 && state.stage === 4) {
                // Round 3 Physical Code entered → Move to Round 4
                dispatch({ type: ACTION.ADMIN_OVERRIDE, payload: { round: 4, stage: 1, score: state.score + result.points, error: null } });
            } else if (state.round === 4 && state.stage === 1 && result.triggerEmail) {
                // Round 4 All questions correct → Move to email code entry
                // In production, backend would send email here
                dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } });
                console.log('📧 Email would be sent here with advantage code');
            } else if (state.round === 4 && state.stage === 2) {
                // Round 4 Email code verified → Complete
                dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } });
            } else {
                dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } });
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
        <GameContext.Provider value={{ state, login, startRound, submitAnswer, adminOverride, error: state.error }}>
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
