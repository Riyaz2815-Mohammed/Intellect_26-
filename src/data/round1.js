export const normalizeSQL = (query) => {
    if (!query) return '';
    return query
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*$/, '') // Remove trailing semicolon
        .split('')
        .filter(char => /[a-z0-9\s<>=_*(),.]/.test(char)) // Allow only safe chars
        .join('');
};

export const SQL_CHALLENGES = [
    {
        id: 1,
        scrambled: [
            "FROM students",
            "WHERE marks > 80",
            "SELECT name"
        ],
        answer: "SELECT name FROM students WHERE marks > 80",
        hint: "Start with SELECT"
    },
    {
        id: 2,
        scrambled: [
            "ORDER BY created_at DESC",
            "SELECT *",
            "FROM logs",
            "WHERE status = 'error'"
        ],
        answer: "SELECT * FROM logs WHERE status = 'error' ORDER BY created_at DESC",
        hint: "Filter before sorting"
    },
    {
        id: 3,
        scrambled: [
            "GROUP BY department",
            "SELECT department, COUNT(*)",
            "FROM employees",
            "HAVING COUNT(*) > 5"
        ],
        answer: "SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5",
        hint: "HAVING comes after GROUP BY"
    },
    {
        id: 4,
        scrambled: [
            "JOIN orders ON users.id = orders.user_id",
            "SELECT users.name, orders.amount",
            "FROM users"
        ],
        answer: "SELECT users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id",
        hint: "Standard JOIN syntax"
    }
];

export const ROUND1_PLACE = "LIBRARY - SECTION B";
export const ROUND1_CODE = "CRPT-7712"; // This would change per team in a real DB
