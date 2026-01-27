// Round 4: SQL Reasoning (Calm Advantage Round)
// No time pressure, no physical movement
// Email-based code delivery

// Sample data for questions
const SAMPLE_EMPLOYEES = [
    { id: 1, name: 'Alice', dept: 'Engineering', salary: 75000 },
    { id: 2, name: 'Bob', dept: 'Engineering', salary: 82000 },
    { id: 3, name: 'Charlie', dept: 'Marketing', salary: 65000 },
    { id: 4, name: 'Diana', dept: 'Engineering', salary: 78000 },
    { id: 5, name: 'Eve', dept: 'HR', salary: 70000 },
    { id: 6, name: 'Frank', dept: 'Marketing', salary: 68000 }
];

const SAMPLE_ORDERS = [
    { order_id: 101, customer: 'John', amount: 250, status: 'completed' },
    { order_id: 102, customer: 'Sarah', amount: 450, status: 'completed' },
    { order_id: 103, customer: 'John', amount: 150, status: 'pending' },
    { order_id: 104, customer: 'Mike', amount: 300, status: 'completed' },
    { order_id: 105, customer: 'Sarah', amount: 200, status: 'cancelled' }
];

// Normalize answer for comparison
const normalizeAnswer = (answer) => {
    if (!answer) return '';
    return answer.toString().trim().toLowerCase();
};

export const ROUND4_QUESTIONS = [
    {
        id: 1,
        type: 'SQL_REASONING',
        title: 'Q1: COUNT with Condition',
        table: SAMPLE_EMPLOYEES,
        tableName: 'EMPLOYEES',
        question: 'How many employees work in the Engineering department?',
        hint: 'Count rows where dept = "Engineering"',
        query: 'SELECT COUNT(*) FROM employees WHERE dept = "Engineering";',
        answer: '3',
        validateFn: (input) => {
            const normalized = normalizeAnswer(input);
            return normalized === '3' || normalized === 'three';
        }
    },
    {
        id: 2,
        type: 'SQL_REASONING',
        title: 'Q2: AVG Calculation',
        table: SAMPLE_EMPLOYEES,
        tableName: 'EMPLOYEES',
        question: 'What is the average salary of employees in the Marketing department? (Round to nearest thousand)',
        hint: 'Calculate AVG(salary) WHERE dept = "Marketing"',
        query: 'SELECT AVG(salary) FROM employees WHERE dept = "Marketing";',
        answer: '67000',
        validateFn: (input) => {
            const normalized = normalizeAnswer(input);
            // Accept 66500, 67000, or 66.5k variations
            return normalized === '67000' || normalized === '66500' ||
                normalized === '67' || normalized === '66.5';
        }
    },
    {
        id: 3,
        type: 'SQL_REASONING',
        title: 'Q3: DISTINCT Count',
        table: SAMPLE_ORDERS,
        tableName: 'ORDERS',
        question: 'How many DISTINCT customers have placed orders?',
        hint: 'Use COUNT(DISTINCT customer)',
        query: 'SELECT COUNT(DISTINCT customer) FROM orders;',
        answer: '3',
        validateFn: (input) => {
            const normalized = normalizeAnswer(input);
            return normalized === '3' || normalized === 'three';
        }
    },
    {
        id: 4,
        type: 'SQL_REASONING',
        title: 'Q4: MAX with Filter',
        table: SAMPLE_ORDERS,
        tableName: 'ORDERS',
        question: 'What is the maximum order amount among COMPLETED orders only?',
        hint: 'Find MAX(amount) WHERE status = "completed"',
        query: 'SELECT MAX(amount) FROM orders WHERE status = "completed";',
        answer: '450',
        validateFn: (input) => {
            const normalized = normalizeAnswer(input);
            return normalized === '450';
        }
    },
    {
        id: 5,
        type: 'SQL_REASONING',
        title: 'Q5: Predict Output',
        table: SAMPLE_EMPLOYEES,
        tableName: 'EMPLOYEES',
        question: 'If we run: SELECT dept, COUNT(*) FROM employees GROUP BY dept ORDER BY COUNT(*) DESC LIMIT 1; \n\nWhat department name will be returned?',
        hint: 'Which department has the most employees?',
        query: 'SELECT dept, COUNT(*) FROM employees GROUP BY dept ORDER BY COUNT(*) DESC LIMIT 1;',
        answer: 'Engineering',
        validateFn: (input) => {
            const normalized = normalizeAnswer(input);
            return normalized === 'engineering';
        }
    }
];

// Email code format
export const ROUND4_CODE_PREFIX = 'INT26-R4-';

// Generate unique code for team
export const generateRound4Code = (teamId) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${ROUND4_CODE_PREFIX}${random}`;
};

// Validate all answers
export const validateAllAnswers = (answers) => {
    if (!answers || answers.length !== 5) {
        return { success: false, message: 'All 5 questions must be answered' };
    }

    const results = ROUND4_QUESTIONS.map((q, idx) => {
        const userAnswer = answers[idx];
        const isCorrect = q.validateFn(userAnswer);
        return { questionId: q.id, correct: isCorrect };
    });

    const allCorrect = results.every(r => r.correct);
    const incorrectQuestions = results
        .filter(r => !r.correct)
        .map(r => r.questionId);

    if (allCorrect) {
        return {
            success: true,
            message: 'All answers correct! Check your email for the advantage code.',
            points: 100
        };
    } else {
        return {
            success: false,
            message: `Incorrect answers for questions: ${incorrectQuestions.join(', ')}`,
            incorrectQuestions
        };
    }
};
