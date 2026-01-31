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
        sql: 'SELECT t.name as team_name, t.lead, AVG(p.budget) as avg_budget FROM teams t JOIN projects p ON t.id = p.team_id GROUP BY t.name, t.lead ORDER BY avg_budget DESC LIMIT 1'
    },
    {
        id: 'Q2',
        label: 'Query B',
        sql: 'SELECT t.department, SUM(p.budget) as total_budget FROM teams t JOIN projects p ON t.id = p.team_id WHERE p.status IN ("Active", "On Hold") GROUP BY t.department ORDER BY total_budget DESC'
    },
    {
        id: 'Q3',
        label: 'Query C',
        sql: 'SELECT t.name, COUNT(p.id) as project_count FROM teams t JOIN projects p ON t.id = p.team_id WHERE p.status = "Active" GROUP BY t.name HAVING COUNT(p.id) >= 2'
    },
    {
        id: 'Q4',
        label: 'Query D',
        sql: 'SELECT p.name, COUNT(tk.id) as task_count FROM projects p LEFT JOIN tasks tk ON p.id = tk.project_id WHERE p.status = "Active" GROUP BY p.name HAVING COUNT(tk.id) > 1'
    },
    {
        id: 'Q5',
        label: 'Query E',
        sql: 'SELECT p.name, p.budget FROM projects p WHERE p.priority = "Critical" AND p.budget > 70000 ORDER BY p.budget DESC'
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

// Correct mappings: Q1->O3, Q2->O5, Q3->O1, Q4->O4, Q5->O2 (User requested 36142 -> 35142)
export const PHASE1_CORRECT_MAPPING = {
    'Q1': 'O3',
    'Q2': 'O5',
    'Q3': 'O1',
    'Q4': 'O4',
    'Q5': 'O2'
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
        type: 'SIMPLE_LOGIC_ERROR',
        title: 'Q1: Simple Logic Error',
        brokenQuery: 'SELECT * FROM projects WHERE priority = "Critical" OR budget > 50000',
        task: 'This query retrieves projects that are EITHER Critical OR have a high budget. We want projects that satisfy BOTH conditions. Fix the logic.',
        hint: 'Review your logical operators carefully.',
        validSQL: 'SELECT * FROM projects WHERE priority = "Critical" AND budget > 50000',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
            return normalized.includes('priority = "critical"') && normalized.includes('budget > 50000') && normalized.includes('and') && !normalized.includes(' or ');
        }
    },
    {
        id: 2,
        type: 'JOIN_SYNTAX_ERROR',
        title: 'Q2: Missing Join Condition',
        brokenQuery: 'SELECT p.name, t.title FROM projects p JOIN tasks t',
        task: 'This query produces a Cartesian product (all combinations). We want to match tasks to their specific projects. Add the missing join condition.',
        hint: 'Tables must be explicitly linked to avoid Cartesian products.',
        validSQL: 'SELECT p.name, t.title FROM projects p JOIN tasks t ON p.id = t.project_id',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
            return normalized.includes('on p.id = t.project_id') || normalized.includes('on t.project_id = p.id');
        }
    },
    {
        id: 3,
        type: 'MISSING_GROUP_BY',
        title: 'Q3: Aggregate Error',
        brokenQuery: 'SELECT team_id, COUNT(*) FROM projects',
        task: 'We want to count the number of projects per team. This query fails because it aggregates everything into one row but asks for team_id. Fix it.',
        hint: 'Aggregates require defining how rows are bunched together.',
        validSQL: 'SELECT team_id, COUNT(*) FROM projects GROUP BY team_id',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
            return normalized.includes('group by team_id') && normalized.includes('count(*)');
        }
    },
    {
        id: 4,
        type: 'SUBQUERY_ERROR',
        title: 'Q4: Multi-Row Subquery',
        brokenQuery: 'SELECT name FROM projects WHERE budget > (SELECT budget FROM projects WHERE team_id = "T2")',
        task: 'The subquery returns all budgets for T2 (multiple rows), causing an error. We want projects with a budget higher than the MAXIMUM budget of any T2 project. Fix it.',
        hint: 'Ensure your subquery returns a single scalar value.',
        validSQL: 'SELECT name FROM projects WHERE budget > (SELECT MAX(budget) FROM projects WHERE team_id = "T2")',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
            return normalized.includes('max(budget)') && normalized.includes('team_id = "t2"');
        }
    },
    {
        id: 5,
        type: 'HAVING_CLAUSE',
        title: 'Q5: Filtering Aggregates',
        brokenQuery: 'SELECT team_id, COUNT(*) FROM projects WHERE COUNT(*) > 1 GROUP BY team_id',
        task: 'You cannot filter aggregate results (like COUNT) using WHERE. Fix the query to show only teams with more than 1 project.',
        hint: 'Filtering happens at different stages of query execution.',
        validSQL: 'SELECT team_id, COUNT(*) FROM projects GROUP BY team_id HAVING COUNT(*) > 1',
        validateFn: (input) => {
            const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
            return normalized.includes('having count(*) > 1') && !normalized.includes('where count(*)');
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


export const ROUND4_PLACE = "Oval";
export const ROUND4_CODE = 'CRPT-8124';

// Export all tables as a collection for easy rendering
export const ROUND4_TABLES = {
    projects: PROJECTS_TABLE,
    teams: TEAMS_TABLE,
    tasks: TASKS_TABLE
};
