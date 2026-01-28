// Round 4: SQL Advantage Round - CODECRYPT Intellect '26
// Phase 1: Match the Logic (5 queries ↔ 5 outputs)
// Phase 2: Fix the System (5 broken queries)

// ============================================
// MULTIPLE TABLES FOR PHASE 1
// ============================================

export const PROJECTS_TABLE = [
    { id: 'P-001', name: 'WebApp', team_id: 'T1', budget: 50000, status: 'Active', priority: 'High' },
    { id: 'P-002', name: 'MobileApp', team_id: 'T2', budget: 75000, status: 'Active', priority: 'Critical' },
    { id: 'P-003', name: 'DataPipeline', team_id: 'T1', budget: 60000, status: 'Completed', priority: 'Medium' },
    { id: 'P-004', name: 'APIGateway', team_id: 'T3', budget: 45000, status: 'Active', priority: 'High' },
    { id: 'P-005', name: 'Dashboard', team_id: 'T2', budget: 30000, status: 'On Hold', priority: 'Low' },
    { id: 'P-006', name: 'Analytics', team_id: 'T1', budget: 80000, status: 'Active', priority: 'Critical' },
    { id: 'P-007', name: 'Security', team_id: 'T3', budget: 90000, status: 'Active', priority: 'Critical' }
];

export const TEAMS_TABLE = [
    { id: 'T1', name: 'Alpha', lead: 'Sarah Chen', department: 'Engineering' },
    { id: 'T2', name: 'Beta', lead: 'Mike Johnson', department: 'Product' },
    { id: 'T3', name: 'Gamma', lead: 'Alex Kumar', department: 'Security' }
];

export const TASKS_TABLE = [
    { id: 'TSK-001', project_id: 'P-001', title: 'Design UI', hours: 40, completed: true },
    { id: 'TSK-002', project_id: 'P-001', title: 'Backend API', hours: 60, completed: true },
    { id: 'TSK-003', project_id: 'P-002', title: 'iOS App', hours: 80, completed: false },
    { id: 'TSK-004', project_id: 'P-002', title: 'Android App', hours: 80, completed: false },
    { id: 'TSK-005', project_id: 'P-003', title: 'ETL Pipeline', hours: 100, completed: true },
    { id: 'TSK-006', project_id: 'P-004', title: 'Gateway Setup', hours: 50, completed: true },
    { id: 'TSK-007', project_id: 'P-006', title: 'Data Viz', hours: 70, completed: false },
    { id: 'TSK-008', project_id: 'P-007', title: 'Penetration Test', hours: 90, completed: false }
];

// ============================================
// PHASE 1: MATCH THE LOGIC
// ============================================

export const PHASE1_QUERIES = [
    {
        id: 'Q1',
        label: 'Query A',
        sql: 'SELECT t.name, COUNT(p.id) as project_count FROM teams t JOIN projects p ON t.id = p.team_id WHERE p.status = "Active" GROUP BY t.name HAVING COUNT(p.id) >= 2'
    },
    {
        id: 'Q2',
        label: 'Query B',
        sql: 'SELECT p.name, p.budget FROM projects p WHERE p.priority = "Critical" AND p.budget > 70000 ORDER BY p.budget DESC'
    },
    {
        id: 'Q3',
        label: 'Query C',
        sql: 'SELECT t.name as team_name, t.lead, AVG(p.budget) as avg_budget FROM teams t JOIN projects p ON t.id = p.team_id GROUP BY t.name, t.lead ORDER BY avg_budget DESC LIMIT 1'
    },
    {
        id: 'Q4',
        label: 'Query D',
        sql: 'SELECT p.name, COUNT(tk.id) as task_count FROM projects p LEFT JOIN tasks tk ON p.id = tk.project_id WHERE p.status = "Active" GROUP BY p.name HAVING COUNT(tk.id) > 1'
    },
    {
        id: 'Q5',
        label: 'Query E',
        sql: 'SELECT t.department, SUM(p.budget) as total_budget FROM teams t JOIN projects p ON t.id = p.team_id WHERE p.status IN ("Active", "On Hold") GROUP BY t.department ORDER BY total_budget DESC'
    }
];

export const PHASE1_OUTPUTS = [
    {
        id: 'O1',
        label: 'Output 1',
        data: [
            { name: 'Alpha', project_count: 2 },
            { name: 'Beta', project_count: 2 },
            { name: 'Gamma', project_count: 2 }
        ]
    },
    {
        id: 'O2',
        label: 'Output 2',
        data: [
            { name: 'Security', budget: 90000 },
            { name: 'Analytics', budget: 80000 },
            { name: 'MobileApp', budget: 75000 }
        ]
    },
    {
        id: 'O3',
        label: 'Output 3',
        data: [
            { team_name: 'Gamma', lead: 'Alex Kumar', avg_budget: 67500 }
        ]
    },
    {
        id: 'O4',
        label: 'Output 4',
        data: [
            { name: 'WebApp', task_count: 2 },
            { name: 'MobileApp', task_count: 2 }
        ]
    },
    {
        id: 'O5',
        label: 'Output 5',
        data: [
            { department: 'Engineering', total_budget: 130000 },
            { department: 'Security', total_budget: 135000 },
            { department: 'Product', total_budget: 105000 }
        ]
    }
];

// Correct mappings: Q1->O1, Q2->O2, Q3->O3, Q4->O4, Q5->O5
export const PHASE1_CORRECT_MAPPING = {
    'Q1': 'O1',
    'Q2': 'O2',
    'Q3': 'O3',
    'Q4': 'O4',
    'Q5': 'O5'
};

export const validatePhase1Matching = (userMapping) => {
    // userMapping should be { Q1: 'O1', Q2: 'O2', ... }
    if (!userMapping || Object.keys(userMapping).length !== 5) {
        return { success: false, message: 'All 5 queries must be matched' };
    }

    const incorrect = [];
    Object.keys(PHASE1_CORRECT_MAPPING).forEach(queryId => {
        if (userMapping[queryId] !== PHASE1_CORRECT_MAPPING[queryId]) {
            incorrect.push(queryId);
        }
    });

    if (incorrect.length === 0) {
        return {
            success: true,
            message: 'Perfect! All matches are correct.',
            points: 150
        };
    } else {
        return {
            success: false,
            message: `Incorrect matches for: ${incorrect.join(', ')}`,
            incorrectQueries: incorrect
        };
    }
};

// ============================================
// PHASE 2: FIX THE SYSTEM
// ============================================

export const PHASE2_QUESTIONS = [
    {
        id: 1,
        type: 'INCORRECT_WHERE',
        title: 'Q1: Incorrect WHERE Logic',
        brokenQuery: 'SELECT * FROM projects WHERE status = "Active" OR priority = "Critical"',
        task: 'This query should find projects that are BOTH Active AND Critical priority. What operator should replace OR?',
        hint: 'Think about logical operators',
        answer: 'AND',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase();
            return normalized === 'and';
        }
    },
    {
        id: 2,
        type: 'WRONG_AGGREGATION',
        title: 'Q2: Wrong Aggregation Function',
        brokenQuery: 'SELECT team_id, SUM(budget) FROM projects GROUP BY team_id',
        task: 'We want the AVERAGE budget per team, not the total. What function should replace SUM?',
        hint: 'Which function calculates the mean?',
        answer: 'AVG',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase();
            return normalized === 'avg' || normalized === 'average';
        }
    },
    {
        id: 3,
        type: 'FAULTY_SUBQUERY',
        title: 'Q3: Faulty Subquery',
        brokenQuery: 'SELECT name FROM projects WHERE budget > (SELECT budget FROM projects WHERE team_id = "T1")',
        task: 'The subquery might return multiple rows. What should we add before "budget" in the subquery to make it safe? (We want the maximum)',
        hint: 'Use an aggregation function',
        answer: 'MAX',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/[()]/g, '');
            return normalized === 'max' || normalized === 'max budget' || normalized.includes('max');
        }
    },
    {
        id: 4,
        type: 'GROUP_BY_HAVING_MISUSE',
        title: 'Q4: GROUP BY / HAVING Misuse',
        brokenQuery: 'SELECT team_id, COUNT(*) FROM projects WHERE COUNT(*) > 2 GROUP BY team_id',
        task: 'You cannot use aggregate functions in WHERE clause. What clause should be used instead for filtering groups?',
        hint: 'It comes after GROUP BY',
        answer: 'HAVING',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase();
            return normalized === 'having';
        }
    },
    {
        id: 5,
        type: 'CONCEPTUAL_LOGIC_FLAW',
        title: 'Q5: Conceptual Logic Flaw',
        brokenQuery: 'SELECT * FROM projects WHERE status = "Active" ORDER BY budget LIMIT 1',
        task: 'This query finds the project with the LOWEST budget among active projects. To find the HIGHEST budget project, what should we add after "budget" in ORDER BY?',
        hint: 'Think about sort direction',
        answer: 'DESC',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase();
            return normalized === 'desc' || normalized === 'descending';
        }
    }
];

export const validatePhase2Answers = (answers) => {
    if (!answers || answers.length !== 5) {
        return { success: false, message: 'All 5 questions must be answered' };
    }

    const results = PHASE2_QUESTIONS.map((q, idx) => {
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
            message: 'All corrections are perfect! Check your email for the advantage code.',
            points: 150
        };
    } else {
        return {
            success: false,
            message: `Incorrect answers for questions: ${incorrectQuestions.join(', ')}`,
            incorrectQuestions
        };
    }
};

// ============================================
// EMAIL CODE GENERATION
// ============================================

export const ROUND4_CODE_PREFIX = 'INT26-R4-';

export const generateRound4Code = (teamId) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${ROUND4_CODE_PREFIX}${random}`;
};

export const ROUND4_PLACE = "ADMIN DESK";

// Export all tables as a collection for easy rendering
export const ROUND4_TABLES = {
    projects: PROJECTS_TABLE,
    teams: TEAMS_TABLE,
    tasks: TASKS_TABLE
};
