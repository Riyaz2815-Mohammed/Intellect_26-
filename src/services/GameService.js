import { normalizeSQL, SQL_CHALLENGES, ROUND1_CODE, ROUND1_PLACE } from '../data/round1';
import { COLLEGE_DATA, ROUND2_QUESTIONS, normalizeQuery, ROUND2_CODE, ROUND2_PLACE } from '../data/round2';
import { ROUND3_QUESTIONS, ROUND3_CODE, ROUND3_PLACE } from '../data/round3';
import {
    ROUND4_TABLES,
    PHASE1_QUERIES,
    PHASE1_OUTPUTS,
    validatePhase1Matching,
    PHASE2_QUESTIONS,
    validatePhase2Answers,
    ROUND4_PLACE
} from '../data/round4';

// Simulated Backend Service
export const GameService = {
    validateSubmission: (round, stage, input) => {
        // Round 1 Logic
        if (round === 1) {
            // Stages 1-4: SQL Reordering
            if (stage <= 4) {
                const challenge = SQL_CHALLENGES[stage - 1]; // 0-indexed array, 1-indexed stage
                const normalizedInput = normalizeSQL(input);
                const normalizedAnswer = normalizeSQL(challenge.answer);

                if (normalizedInput === normalizedAnswer) {
                    return { success: true, points: 50, message: 'QUERY EXECUTED SUCCESSFULLY' };
                } else {
                    return { success: false, message: 'SYNTAX ERROR: QUERY MALFORMED OR INCORRECT ORDER' };
                }
            }

            // Stage 5: Code Entry
            if (stage === 5) {
                if (input.trim().toUpperCase() === ROUND1_CODE) {
                    return { success: true, points: 200, message: 'ACCESS GRANTED: ROUND 2 UNLOCKED' };
                } else {
                    return { success: false, message: 'INVALID AUTH CODE' };
                }
            }
        }

        // Round 2 Logic: SQL Query Writing
        if (round === 2) {
            if (stage <= 4) {
                const question = ROUND2_QUESTIONS[stage - 1];
                // Normalize and Validate
                const cleanInput = normalizeQuery(input);

                // Check required
                const missing = question.validation.required.find(t => !cleanInput.includes(t));
                if (missing) return { success: false, message: `SYNTAX ERROR: Missing '${missing.toUpperCase()}'` };

                // Check forbidden
                const forbidden = question.validation.forbidden.find(t => cleanInput.includes(t));
                if (forbidden) return { success: false, message: `SYNTAX ERROR: Usage of '${forbidden.toUpperCase()}' is restricted` };

                return { success: true, points: 100, message: 'QUERY EXECUTED SUCCESSFULLY' };
            }

            // Stage 5: Code Entry
            if (stage === 5) {
                if (input.trim().toUpperCase() === ROUND2_CODE) {
                    return { success: true, points: 200, message: 'ACCESS GRANTED: ROUND COMPLETE' };
                } else {
                    return { success: false, message: 'INVALID LOCATION CODE' };
                }
            }
        }

        // Round 3 Logic: Flash Memory + Pressure
        if (round === 3) {
            if (stage <= 5) {
                const question = ROUND3_QUESTIONS[stage - 1];

                // Check if specialized validation function exists
                if (question.validateFn) {
                    if (question.validateFn(input)) {
                        return { success: true, points: 150, message: 'ACCEPTED' };
                    } else {
                        return { success: false, message: 'INCORRECT ANSWER' };
                    }
                }

                // Q1: Custom validation function (Handled by generic check above, but keeping specific message if needed)
                if (question.type === 'TABLE_FLASH' && !question.validateFn) {
                    // Fallback or legacy handling if needed
                }

                // Q2: Query recall - normalize and compare
                if (question.type === 'QUERY_FLASH') {
                    const normalizedInput = normalizeSQL(input);
                    const normalizedAnswer = normalizeSQL(question.answer);
                    if (normalizedInput === normalizedAnswer) {
                        return { success: true, points: 200, message: 'QUERY RECONSTRUCTED SUCCESSFULLY' };
                    } else {
                        return { success: false, message: 'QUERY MISMATCH DETECTED' };
                    }
                }

                // Q3: Logical decision - exact match
                if (question.type === 'LOGICAL_DECISION') {
                    if (input.trim().toUpperCase() === question.answer.toUpperCase()) {
                        return { success: true, points: 150, message: 'DECISION VALIDATED' };
                    } else {
                        return { success: false, message: 'INCORRECT STRATEGIC CHOICE' };
                    }
                }
            }

            // Stage 6: Physical code entry
            if (stage === 6) {
                if (input.trim().toUpperCase() === ROUND3_CODE) {
                    return { success: true, points: 300, message: 'ROUND 3 COMPLETE - FINAL ROUND UNLOCKED' };
                } else {
                    return { success: false, message: 'INVALID PHYSICAL CODE' };
                }
            }
        }

        // Round 4 Logic: SQL Advantage Round (2 Phases)
        if (round === 4) {
            // Phase 1: Match the Logic (Query to Output Matching)
            if (stage === 1) {
                // Input should be an object mapping queries to outputs: { Q1: 'O1', Q2: 'O2', ... }
                let mapping;
                try {
                    mapping = typeof input === 'string' ? JSON.parse(input) : input;
                } catch {
                    return { success: false, message: 'Invalid mapping format' };
                }

                const result = validatePhase1Matching(mapping);
                if (result.success) {
                    return {
                        success: true,
                        points: result.points,
                        message: result.message
                    };
                } else {
                    return {
                        success: false,
                        message: result.message,
                        incorrectQueries: result.incorrectQueries
                    };
                }
            }

            // Phase 2: Fix the System (Broken Query Debugging)
            if (stage === 2) {
                // Input should be an array of 5 answers
                let answers;
                try {
                    answers = typeof input === 'string' ? JSON.parse(input) : input;
                } catch {
                    return { success: false, message: 'Invalid answer format' };
                }

                const result = validatePhase2Answers(answers);
                if (result.success) {
                    return {
                        success: true,
                        points: result.points,
                        message: result.message,
                        triggerEmail: true // Signal to send email
                    };
                } else {
                    return {
                        success: false,
                        message: result.message,
                        incorrectQuestions: result.incorrectQuestions
                    };
                }
            }

            // Stage 3: Email code entry
            if (stage === 3) {
                // In real implementation, validate against database
                // For now, accept any code starting with INT26-R4-
                const codePattern = /^INT26-R4-\d{4}$/i;
                if (codePattern.test(input.trim())) {
                    return { success: true, points: 200, message: 'ADVANTAGE CODE VERIFIED - FINAL ROUND UNLOCKED' };
                } else {
                    return { success: false, message: 'INVALID ADVANTAGE CODE' };
                }
            }
        }

        return { success: false, message: 'UNKNOWN STATE' };
    },

    getStageData: (round, stage) => {
        // Validate inputs
        if (!round || round < 1 || !stage || stage < 1) {
            return null;
        }

        if (round === 1) {
            if (stage >= 1 && stage <= 4) {
                const challenge = SQL_CHALLENGES[stage - 1];
                if (!challenge) return null;

                return {
                    type: 'SQL_ORDER',
                    title: `DECRYPT QUERY SEQUENCE [${stage}/4]`,
                    content: challenge.scrambled,
                    hint: challenge.hint,
                    placeholder: 'SELECT ... FROM ...'
                };
            }
            if (stage === 5) {
                return {
                    type: 'LOCATION_REVEAL',
                    title: 'TARGET LOCATION IDENTIFIED',
                    content: 'PHYSICAL ACCESS REQUIRED',
                    hint: 'Go to location and retrieve the code',
                    location: ROUND1_PLACE
                };
            }
            if (stage === 6) {
                return {
                    type: 'ROUND_COMPLETE',
                    title: 'ROUND 1 COMPLETE',
                    content: 'AWAITING ROUND 2 DEPLOYMENT...',
                    hint: 'Stand by for admin instruction.',
                    placeholder: 'SYSTEM LOCKED'
                };
            }
        }

        if (round === 2) {
            if (stage >= 1 && stage <= 4) {
                const question = ROUND2_QUESTIONS[stage - 1];
                if (!question) return null;

                return {
                    type: 'DATA_ANALYSIS',
                    title: `ACADEMIC PERFORMANCE ANALYSIS [${stage}/4]`,
                    content: question.text,
                    hint: question.hint,
                    tables: COLLEGE_DATA,
                    placeholder: 'SELECT ... FROM students ...'
                };
            }
            if (stage === 5) {
                return {
                    type: 'LOCATION_REVEAL',
                    title: 'PHYSICAL ACCESS REQUIRED',
                    content: 'ENCRYPTED FRAGMENT LOCATED',
                    hint: 'Proceed to location to retrieve unlock key.',
                    location: ROUND2_PLACE
                };
            }
        }

        if (round === 3) {
            if (stage <= 5) {
                const question = ROUND3_QUESTIONS[stage - 1];

                // Handle TABLE_QUERY_FLASH type differently
                if (question.type === 'TABLE_QUERY_FLASH') {
                    return {
                        type: 'TABLE_QUERY_FLASH',
                        title: `PRESSURE TEST [${stage}/5]`,
                        prompt: question.prompt,
                        hint: question.hint,
                        flashDuration: question.flashDuration || 0,
                        flashData: question.flashData, // The SQL query
                        tableData: question.tableData, // The events table
                        placeholder: 'Enter the query result...'
                    };
                }

                // Handle other flash challenge types
                return {
                    type: 'FLASH_CHALLENGE',
                    subType: question.type,
                    title: `PRESSURE TEST [${stage}/5]`,
                    prompt: question.prompt,
                    hint: question.hint,
                    flashDuration: question.flashDuration || 0,
                    flashData: question.flashData,
                    placeholder: question.type === 'QUERY_FLASH' ? 'Type the query...' : 'Enter your answer...'
                };
            }
            if (stage === 6) {
                return {
                    type: 'LOCATION_REVEAL',
                    title: 'PHYSICAL RETRIEVAL AUTHORIZED',
                    content: 'ONE TEAM MEMBER MUST RETRIEVE CODE',
                    hint: 'Go to location immediately',
                    location: ROUND3_PLACE
                };
            }
        }

        if (round === 4) {
            // Phase 1: Match the Logic
            if (stage === 1) {
                return {
                    type: 'QUERY_MATCHING',
                    title: 'ADVANTAGE ROUND - PHASE 1: MATCH THE LOGIC',
                    subtitle: 'Match each SQL query to its correct output',
                    queries: PHASE1_QUERIES,
                    outputs: PHASE1_OUTPUTS,
                    tables: ROUND4_TABLES,
                    placeholder: 'Drag or select outputs...',
                    hint: 'Take your time. No time limit. All tables are visible.'
                };
            }

            // Phase 2: Fix the System
            if (stage === 2) {
                return {
                    type: 'QUERY_FIXING',
                    title: 'ADVANTAGE ROUND - PHASE 2: FIX THE SYSTEM',
                    subtitle: 'Identify and correct the mistakes in these broken queries',
                    questions: PHASE2_QUESTIONS,
                    tables: ROUND4_TABLES,
                    placeholder: 'Enter your correction...',
                    hint: 'Take your time. No time limit.'
                };
            }

            // Stage 3: Email code entry
            if (stage === 3) {
                return {
                    type: 'EMAIL_CODE_ENTRY',
                    title: 'ADVANTAGE CODE VERIFICATION',
                    content: 'Check your email OR visit location for code',
                    location: ROUND4_PLACE,
                    hint: 'Code format: INT26-R4-XXXX',
                    placeholder: 'Enter code from email...'
                };
            }

            // Stage 4: Round complete
            if (stage === 4) {
                return {
                    type: 'ROUND_COMPLETE',
                    title: 'ADVANTAGE SECURED',
                    content: 'You have earned an advantage for the Final Round!',
                    hint: 'Prepare for the ultimate challenge.',
                    placeholder: 'SYSTEM LOCKED'
                };
            }
        }

        return null;
    }
};
