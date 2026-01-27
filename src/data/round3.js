export const EVENTS_TABLE = [
    { event_name: 'CodeCrypt', participants: 120 },
    { event_name: 'HackRush', participants: 90 },
    { event_name: 'DataQuest', participants: 150 },
    { event_name: 'LogicLoop', participants: 60 },
];

export const FLASH_QUERY = `SELECT event_name
FROM events
WHERE participants >= 100;`;

export const ROUND3_QUESTIONS = [
    {
        id: 1,
        type: 'TABLE_FLASH',
        flashDuration: 20, // seconds - increased for better memorization
        flashData: EVENTS_TABLE,
        prompt: "As an organizer, which event is most risky to conduct immediately and why?",
        hint: "Think about participation numbers",
        // Validation: Must contain event name + reasoning keyword
        validateFn: (input) => {
            const normalized = input.toLowerCase().trim();
            // Must mention LogicLoop AND some reasoning (lowest/least/minimum/risky)
            const hasEvent = normalized.includes('logicloop');
            const hasReasoning = normalized.includes('lowest') ||
                normalized.includes('least') ||
                normalized.includes('minimum') ||
                normalized.includes('60') ||
                normalized.includes('small');
            return hasEvent && hasReasoning;
        }
    },
    {
        id: 2,
        type: 'QUERY_FLASH',
        flashDuration: 20, // seconds - increased for better memorization
        flashData: FLASH_QUERY,
        prompt: "Re-type the exact SQL query you just saw.",
        hint: "Recall the SELECT statement",
        answer: FLASH_QUERY
    },
    {
        id: 3,
        type: 'LOGICAL_DECISION',
        prompt: "You are allowed to conduct only ONE low-risk event immediately. Choose the event that: (1) Has participants ≥ 100, (2) Requires minimal operational risk",
        hint: "Consider both criteria carefully",
        answer: "CodeCrypt"
    }
];

export const ROUND3_PLACE = "OPEN AUDITORIUM";
export const ROUND3_CODE = "CRPT-9384"; // Team-specific in real implementation
