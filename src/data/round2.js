export const COLLEGE_DATA = {
    students: [
        { id: 101, name: 'Rahul', dept: 'CS', year: 3, gpa: 8.5, attendance: 92 },
        { id: 102, name: 'Priya', dept: 'ECE', year: 2, gpa: 9.1, attendance: 95 },
        { id: 103, name: 'Amit', dept: 'CS', year: 3, gpa: 7.8, attendance: 85 },
        { id: 104, name: 'Sneha', dept: 'MECH', year: 4, gpa: 8.2, attendance: 88 },
        { id: 105, name: 'Vikram', dept: 'CS', year: 2, gpa: 6.9, attendance: 75 },
        { id: 106, name: 'Anjali', dept: 'ECE', year: 3, gpa: 9.5, attendance: 98 }
    ],
    departments: [
        { code: 'CS', name: 'Computer Science', head: 'Dr. Sharma' },
        { code: 'ECE', name: 'Electronics', head: 'Dr. Verma' },
        { code: 'MECH', name: 'Mechanical', head: 'Dr. Rao' }
    ],
    assignments: [
        { id: 1, student_id: 101, subject: 'DB_MS', score: 88 },
        { id: 2, student_id: 102, subject: 'Circuits', score: 92 },
        { id: 3, student_id: 101, subject: 'OS', score: 75 },
        { id: 4, student_id: 104, subject: 'Thermo', score: 81 },
        { id: 5, student_id: 103, subject: 'DB_MS', score: 65 }
    ]
};

// Kept for backward compatibility if imported directly, but COLLEGE_DATA is main export
export const STUDENTS_TABLE = COLLEGE_DATA.students;

export const ROUND2_QUESTIONS = [
    {
        id: 1,
        text: "Identify the Target. Write a query to find the `id` and Score In dbms of the student named 'Rahul' and subject db_ms.",
        hint: "Filter by name , and subject DB_MS ",
        answer: "SELECT id, score FROM students JOIN assignments ON students.id = assignments.student_id WHERE students.name = 'Rahul' AND assignments.subject = 'DB_MS'",
        validation: {
            required: ['select', 'id', 'score', 'from', 'students', 'join', 'on', 'assignments', 'where', 'name', 'rahul', 'subject', 'db_ms'],
            forbidden: []
        }
    },
    {
        id: 2,
        text: "Track their Performance. Using the ID you found (101), find all assignment scores for this student from the `assignments` table.",
        hint: "Filter assignments by student_id",
        answer: "SELECT * FROM assignments WHERE student_id = 101",
        validation: {
            required: ['select', 'from', 'assignments', 'where', 'student_id', '101'],
            forbidden: []
        }
    },
    {
        id: 3,
        text: "Find the top scorers in each department with attendance > 90%",
        hint: "join , group by, order by, limit",
        answer: "SELECT name, score FROM students JOIN assignments ON students.id = assignments.student_id WHERE students.attendance > 90 ORDER BY assignments.score DESC",
        validation: {
            required: ['select', 'name', 'score', 'from', 'students', 'join', 'on', 'assignments', 'where', 'attendance', '90', 'order by', 'score', 'desc'],
            forbidden: []
        }
    },
    {
        id: 4,
        text: "Write a 3-table JOIN to show Rahul's Name, Department Head, and Assignment Subject.",
        hint: "JOIN students, departments, and assignments",
        answer: "SELECT students.name, departments.head, assignments.subject FROM students JOIN departments ON students.dept = departments.code JOIN assignments ON students.id = assignments.student_id WHERE students.id = 101",
        validation: {
            required: ['select', 'join', 'on', 'students', 'departments', 'assignments', 'where', 'id', '101'],
            forbidden: []
        }
    }
];

export const ROUND2_PLACE = "OPEN AUDI";
export const ROUND2_CODE = "CRPT-5521";

// Helper to normalize query for loose validation
export const normalizeQuery = (q) => {
    return q.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/["';]/g, '')
        .replace(/\s*\(\s*/g, '(') // Remove spaces around (
        .replace(/\s*\)\s*/g, ')') // Remove spaces around )
        .trim();
};
