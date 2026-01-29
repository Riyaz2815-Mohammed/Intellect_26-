
// Round 5 Variant Data

// Common Phase 1 Question
export const PHASE1_QUESTION = {
    text: "SYSTEM LOCKED. To restore the relational integrity between the 'Events' log and 'Operations' metrics, which SQL operation must be executed to merge these datasets based on their common 'event_id'?",
    keywords: ["JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "NATURAL JOIN"],
    hint: "It combines rows from two or more tables."
};

// Common Table Schemas
const TABLES_SCHEMA = {
    events: ["event_id", "event_name", "participants", "budget"],
    performance: ["event_id", "avg_score", "difficulty"],
    operations: ["event_id", "volunteers", "risk_level"]
};

// Variant Data
export const VARIANTS = {
    // Variant A - Node Atlas
    A: {
        node: "NODE ATLAS",
        place: "LIBRARY",
        data: {
            events: [
                { event_id: 101, event_name: "CodeRush", participants: 150, budget: 5000 },
                { event_id: 102, event_name: "HackNight", participants: 300, budget: 15000 },
                { event_id: 103, event_name: "AI Summit", participants: 50, budget: 8000 }
            ],
            performance: [
                { event_id: 101, avg_score: 8.5, difficulty: "MEDIUM" },
                { event_id: 102, avg_score: 6.2, difficulty: "HARD" },
                { event_id: 103, avg_score: 9.1, difficulty: "EASY" }
            ],
            operations: [
                { event_id: 101, volunteers: 10, risk_level: "LOW" },
                { event_id: 102, volunteers: 50, risk_level: "HIGH" },
                { event_id: 103, volunteers: 5, risk_level: "LOW" }
            ]
        },
        challenges: [
            // 3 Challenges Only: Scramble, Fix, Reasoning
            { id: "A1", type: "SCRAMBLE", question: "List events with budget > 6000", fragments: ["SELECT event_name", "FROM events", "WHERE budget > 6000"], answer: "SELECT event_name FROM events WHERE budget > 6000" },
            { id: "A2", type: "FIX", question: "Fix: SELECT * FROM performance ORDER BY difficulty DESC", broken: "SELECT * FROM performance ORDER BY difficulty DESC", answer: "SELECT * FROM performance ORDER BY avg_score DESC" },
            { id: "A3", type: "REASONING", question: "Which event is the most efficient (High Score / Low Cost)?", answer: "CodeRush" }
        ],
        finalDecision: {
            question: "Based on budget efficiency, participant capacity, and risk, which SINGLE event should be the flagship?",
            options: ["CodeRush", "HackNight", "AI Summit"],
            answer: "CodeRush"
        }
    },

    // Variant B - Node Orion
    B: {
        node: "NODE ORION",
        place: "OPEN AUDITORIUM",
        data: {
            events: [
                { event_id: 201, event_name: "RoboWar", participants: 200, budget: 20000 },
                { event_id: 202, event_name: "CircuitFix", participants: 100, budget: 5000 },
                { event_id: 203, event_name: "DroneRace", participants: 40, budget: 12000 }
            ],
            performance: [
                { event_id: 201, avg_score: 7.5, difficulty: "HARD" },
                { event_id: 202, avg_score: 8.8, difficulty: "MEDIUM" },
                { event_id: 203, avg_score: 5.5, difficulty: "HARD" }
            ],
            operations: [
                { event_id: 201, volunteers: 30, risk_level: "HIGH" },
                { event_id: 202, volunteers: 15, risk_level: "LOW" },
                { event_id: 203, volunteers: 20, risk_level: "HIGH" }
            ]
        },
        challenges: [
            // 3 Challenges Only: Scramble, Fix, Reasoning
            { id: "B1", type: "SCRAMBLE", question: "Events with high cost", fragments: ["SELECT ", "event_name", "FROM ", "events", "WHERE ", "budget", ">= ", "15000"], answer: "SELECT event_name FROM events WHERE budget >= 15000" },
            { id: "B2", type: "FIX", question: "Fix: SELECT * FROM operations WHERE volunteers = 0", broken: "SELECT * FROM operations WHERE volunteers = 0", answer: "SELECT * FROM operations WHERE volunteers > 0" },
            { id: "B3", type: "REASONING", question: "Which event is risky and expensive?", answer: "RoboWar" }
        ],
        finalDecision: {
            question: "Considering safety and cost-effectiveness, which event should be canceled?",
            options: ["RoboWar", "CircuitFix", "DroneRace"],
            answer: "DroneRace"
        }
    },

    // Variant C - Node Vega
    C: {
        node: "NODE VEGA",
        place: "INNOVATION LAB",
        data: {
            events: [
                { event_id: 301, event_name: "WebDev", participants: 500, budget: 2000 },
                { event_id: 302, event_name: "AppDev", participants: 450, budget: 3000 },
                { event_id: 303, event_name: "CyberSec", participants: 100, budget: 6000 }
            ],
            performance: [
                { event_id: 301, avg_score: 9.2, difficulty: "EASY" },
                { event_id: 302, avg_score: 8.9, difficulty: "MEDIUM" },
                { event_id: 303, avg_score: 6.5, difficulty: "HARD" }
            ],
            operations: [
                { event_id: 301, volunteers: 10, risk_level: "LOW" },
                { event_id: 302, volunteers: 12, risk_level: "LOW" },
                { event_id: 303, volunteers: 25, risk_level: "MEDIUM" }
            ]
        },
        challenges: [
            // 3 Challenges Only: Scramble, Fix, Reasoning
            { id: "C1", type: "SCRAMBLE", question: "Massive events check", fragments: ["SELECT event_name", "FROM events", "WHERE participants > 400"], answer: "SELECT event_name FROM events WHERE participants > 400" },
            { id: "C2", type: "FIX", question: "Fix: SELECT avg_score FROM performance WHERE score > 10", broken: "SELECT avg_score FROM performance WHERE score > 10", answer: "SELECT avg_score FROM performance WHERE avg_score < 10" },
            { id: "C3", type: "REASONING", question: "Which event has the best ROI?", answer: "WebDev" }
        ],
        finalDecision: {
            question: "Which event generated the most engagement despite low cost?",
            options: ["WebDev", "AppDev", "CyberSec"],
            answer: "WebDev"
        }
    },

    // Variant D - Node Nova
    D: {
        node: "NODE NOVA",
        place: "MAIN STAGE",
        data: {
            events: [
                { event_id: 401, event_name: "Esports", participants: 1000, budget: 25000 },
                { event_id: 402, event_name: "VR Exp", participants: 50, budget: 20000 },
                { event_id: 403, event_name: "LanParty", participants: 200, budget: 1000 }
            ],
            performance: [
                { event_id: 401, avg_score: 9.8, difficulty: "EASY" },
                { event_id: 402, avg_score: 9.5, difficulty: "EASY" },
                { event_id: 403, avg_score: 8.0, difficulty: "MEDIUM" }
            ],
            operations: [
                { event_id: 401, volunteers: 100, risk_level: "MEDIUM" },
                { event_id: 402, volunteers: 5, risk_level: "LOW" },
                { event_id: 403, volunteers: 2, risk_level: "HIGH" }
            ]
        },
        challenges: [
            // 3 Challenges Only: Scramble, Fix, Reasoning
            { id: "D1", type: "SCRAMBLE", question: "High budget outliers", fragments: ["SELECT event_name", "FROM events", "WHERE budget > 15000"], answer: "SELECT event_name FROM events WHERE budget > 15000" },
            { id: "D2", type: "FIX", question: "Fix: SELECT risk FROM operations WHERE volunteers = 'NONE'", broken: "SELECT risk FROM operations WHERE volunteers = 'NONE'", answer: "SELECT risk_level FROM operations WHERE volunteers = 0" },
            { id: "D3", type: "REASONING", question: "Which event burns the most cash per person?", answer: "VR Exp" }
        ],
        finalDecision: {
            question: "Which event is logically unsustainable due to budget vs impact?",
            options: ["Esports", "VR Exp", "LanParty"],
            answer: "VR Exp"
        }
    },
};
