import { normalizeSQL, SQL_CHALLENGES, ROUND1_CODE } from '../data/round1';
import { AGENTS_TABLE, ACCESS_LOGS_TABLE, ROUND2_QUESTIONS } from '../data/round2';
import { ROUND3_QUESTIONS, ROUND3_CODE } from '../data/round3';
import { ROUND4_QUESTIONS, validateAllAnswers } from '../data/round4';

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

        // Round 2 Logic: Data Analysis
        if (round === 2) {
            if (stage <= 3) {
                const question = ROUND2_QUESTIONS[stage - 1];
                // Exact string match, case insensitive
                if (input.trim().toUpperCase() === question.answer.toUpperCase()) {
                    return { success: true, points: 100, message: 'CALCULATION VERIFIED' };
                } else {
                    return { success: false, message: 'LOGIC ERROR: INCORRECT RESULT' };
                }
            }
        }

        // Round 3 Logic: Flash Memory + Pressure
        if (round === 3) {
            if (stage <= 3) {
                const question = ROUND3_QUESTIONS[stage - 1];

                // Q1: Custom validation function
                if (question.type === 'TABLE_FLASH') {
                    if (question.validateFn(input)) {
                        return { success: true, points: 150, message: 'ANALYSIS ACCEPTED' };
                    } else {
                        return { success: false, message: 'INCOMPLETE OR INCORRECT REASONING' };
                    }
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

            // Stage 4: Physical code entry
            if (stage === 4) {
                if (input.trim().toUpperCase() === ROUND3_CODE) {
                    return { success: true, points: 300, message: 'ROUND 3 COMPLETE - FINAL ROUND UNLOCKED' };
                } else {
                    return { success: false, message: 'INVALID PHYSICAL CODE' };
                }
            }
        }

        // Round 4 Logic: SQL Reasoning (Calm Advantage Round)
        if (round === 4) {
            // Stage 1: All 5 questions answered together
            if (stage === 1) {
                // Input should be an array of 5 answers or JSON string
                let answers;
                try {
                    answers = typeof input === 'string' ? JSON.parse(input) : input;
                } catch {
                    return { success: false, message: 'Invalid answer format' };
                }

                const result = validateAllAnswers(answers);
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

            // Stage 2: Email code entry
            if (stage === 2) {
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
                    location: "LIBRARY - SECTION B" // Hardcoded place as requested
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
            if (stage >= 1 && stage <= 3) {
                const question = ROUND2_QUESTIONS[stage - 1];
                if (!question) return null; // Safety check

                return {
                    type: 'DATA_ANALYSIS',
                    title: `LOGIC PROBE [${stage}/3]`,
                    content: question.text,
                    hint: question.hint,
                    tables: { agents: AGENTS_TABLE, logs: ACCESS_LOGS_TABLE },
                    placeholder: 'Enter calculated value...'
                }
            }
            if (stage === 4) {
                return {
                    type: 'ROUND_COMPLETE',
                    title: 'ROUND 2 COMPLETE',
                    content: 'LOGIC CORE STABILIZED. ROUND 3 UNLOCKING...',
                    hint: 'Prepare for memory pressure testing.',
                    placeholder: 'SYSTEM LOCKED'
                }
            }
        }

        if (round === 3) {
            if (stage <= 3) {
                const question = ROUND3_QUESTIONS[stage - 1];
                return {
                    type: 'FLASH_CHALLENGE',
                    subType: question.type,
                    title: `PRESSURE TEST [${stage}/3]`,
                    prompt: question.prompt,
                    hint: question.hint,
                    flashDuration: question.flashDuration || 0,
                    flashData: question.flashData,
                    placeholder: question.type === 'QUERY_FLASH' ? 'Type the query...' : 'Enter your answer...'
                };
            }
            if (stage === 4) {
                return {
                    type: 'LOCATION_REVEAL',
                    title: 'PHYSICAL RETRIEVAL AUTHORIZED',
                    content: 'ONE TEAM MEMBER MUST RETRIEVE CODE',
                    hint: 'Go to location immediately',
                    location: "OPEN AUDITORIUM"
                };
            }
            if (stage === 5) {
                return {
                    type: 'ROUND_COMPLETE',
                    title: 'ROUND 3 COMPLETE',
                    content: 'ALL SYSTEMS OPERATIONAL. FINAL ROUND AWAITS...',
                    hint: 'Prepare for the ultimate challenge.',
                    placeholder: 'SYSTEM LOCKED'
                };
            }
        }

        if (round === 4) {
            if (stage === 1) {
                return {
                    type: 'SQL_REASONING_MULTI',
                    title: 'ADVANTAGE ROUND - SQL REASONING',
                    subtitle: 'Answer all 5 questions correctly to receive your advantage code via email',
                    questions: ROUND4_QUESTIONS,
                    placeholder: 'Enter your answer...',
                    hint: 'Take your time. No time limit.'
                };
            }
            if (stage === 2) {
                return {
                    type: 'EMAIL_CODE_ENTRY',
                    title: 'ADVANTAGE CODE VERIFICATION',
                    content: 'Check your registered email for the advantage code',
                    hint: 'Code format: INT26-R4-XXXX',
                    placeholder: 'Enter code from email...'
                };
            }
            if (stage === 3) {
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
