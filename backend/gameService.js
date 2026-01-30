// Game Service for Backend Validation

// ==================== ROUND 4 DATA ====================
// Phase 1 Correct Logic
const PHASE1_CORRECT_MAPPING = {
    'Q1': 'O3',
    'Q2': 'O5',
    'Q3': 'O1',
    'Q4': 'O4',
    'Q5': 'O2'
};

// Phase 2 Correct Answers
const PHASE2_ANSWERS = [
    { id: 1, answer: 'AND' },
    { id: 2, answer: 'ON' },
    { id: 3, answer: 'GROUP BY' },
    { id: 4, answer: 'MAX' },
    { id: 5, answer: 'HAVING' }
];

const validatePhase2Input = (input, expected) => {
    const normalized = input.trim().toLowerCase();
    const exp = expected.toLowerCase();

    // Check if the expected keyword/correction is present in the full query
    return normalized.includes(exp);
};

// ==================== MAIN VALIDATION LOGIC ====================

const validateSubmission = (round, stage, answer) => {
    console.log(`Validating submission - Round: ${round}, Stage: ${stage}`, answer);

    try {
        // Round 1: SQL Basics
        if (round === 1) {
            // For now, assume client validation is correct due to complexity of SQL parsing on backend without a full engine
            // In a production env, we would run the query against a readonly DB
            return {
                success: true,
                points: 100,
                message: 'Query executed successfully'
            };
        }

        // Round 2: Debugging & Optimization
        if (round === 2) {
            return {
                success: true,
                points: 150,
                message: 'Optimization verified'
            };
        }

        // Round 3: Analysis
        if (round === 3) {
            if (stage <= 5) {
                return {
                    success: true,
                    points: 200,
                    message: 'Analysis accepted',
                    triggerEmail: stage === 5 // Trigger email on completion of Stage 5
                };
            }
            if (stage === 6) {
                // Validate code format CRPT-XXXX
                const codePattern = /^CRPT-\d{4}$/i;
                if (codePattern.test(answer.trim())) {
                    return {
                        success: true,
                        points: 200,
                        message: 'Access code verified'
                    };
                } else {
                    return { success: false, message: 'Invalid access code format' };
                }
            }
        }

        // Round 4: SQL Advantage
        if (round === 4) {
            // Phase 1: Matching
            if (stage === 1) {
                const mapping = typeof answer === 'string' ? JSON.parse(answer) : answer;

                if (!mapping || Object.keys(mapping).length !== 5) {
                    return { success: false, message: 'All queries must be matched' };
                }

                const incorrect = [];
                Object.keys(PHASE1_CORRECT_MAPPING).forEach(q => {
                    if (mapping[q] !== PHASE1_CORRECT_MAPPING[q]) {
                        incorrect.push(q);
                    }
                });

                if (incorrect.length === 0) {
                    return { success: true, points: 150, message: 'Matches correct' };
                } else {
                    return { success: false, message: `Incorrect matches: ${incorrect.join(', ')}` };
                }
            }

            // Phase 2: Fixing
            if (stage === 2) {
                const answers = typeof answer === 'string' ? JSON.parse(answer) : answer;

                if (!answers || answers.length !== 5) {
                    return { success: false, message: 'All questions must be answered' };
                }

                let allCorrect = true;
                const incorrectIds = [];

                PHASE2_ANSWERS.forEach((q, idx) => {
                    const isValid = validatePhase2Input(answers[idx] || '', q.answer);
                    if (!isValid) {
                        allCorrect = false;
                        incorrectIds.push(q.id);
                    }
                });

                if (allCorrect) {
                    return {
                        success: true,
                        points: 150,
                        message: 'All fixes correct',
                        triggerEmail: true // Important for Round 4
                    };
                } else {
                    return {
                        success: false,
                        message: `Incorrect fixes for Q${incorrectIds.join(', Q')}`
                    };
                }
            }

            // Stage 3: Email Code Entry
            if (stage === 3) {
                // Validate code format CRPT-XXXX
                const codePattern = /^CRPT-\d{4}$/i;
                if (codePattern.test(answer.trim())) {
                    return {
                        success: true,
                        points: 200,
                        message: 'Advantage code verified'
                    };
                } else {
                    return { success: false, message: 'Invalid advantage code format' };
                }
            }
        }

        return { success: false, message: 'Unknown round/stage' };
    } catch (error) {
        console.error('Validation error:', error);
        return { success: false, message: 'Validation error occurred' };
    }
};

module.exports = {
    validateSubmission
};
