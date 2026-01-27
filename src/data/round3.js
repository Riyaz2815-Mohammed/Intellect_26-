export const EVENTS_TABLE = [
    { id: 'E-101', name: 'CodeCrypt', users: 120, cpu_load: 45, error_rate: 0.5, status: 'STABLE' },
    { id: 'E-102', name: 'HackRush', users: 260, cpu_load: 92, error_rate: 12.4, status: 'CRITICAL' },
    { id: 'E-103', name: 'DataQuest', users: 150, cpu_load: 55, error_rate: 1.2, status: 'STABLE' },
    { id: 'E-104', name: 'LogicLoop', users: 230, cpu_load: 78, error_rate: 4.5, status: 'WARNING' },
    { id: 'E-105', name: 'CyberWall', users: 80, cpu_load: 30, error_rate: 0.1, status: 'STABLE' },
    { id: 'E-106', name: 'NetStorm', users: 310, cpu_load: 98, error_rate: 18.2, status: 'CRASHED' }
];

// Complex subquery remains for Q2 memory test
export const FLASH_QUERY = 'SELECT name, (cpu_load/users) as efficiency FROM events WHERE status = "CRITICAL" ORDER BY error_rate DESC';

// System Config for Q5 Retype
export const CONFIG_FLASH = '{"alert_threshold": 90, "mode": "strict", "retry_interval": 5000}';

const SCHEMA_DATA = [
    { Table: 'Users', Attributes: 'id (PK), role, department' },
    { Table: 'Logs', Attributes: 'log_id (PK), user_id (FK), action, timestamp' },
    { Table: 'Events', Attributes: 'event_id (PK), owner_id (FK), capacity' }
];

export const ROUND3_QUESTIONS = [
    {
        id: 1,
        type: 'TABLE_FLASH',
        flashDuration: 20,
        flashData: EVENTS_TABLE,
        prompt: "Root Cause Analysis: Which event triggered the system crash, and what was the primary indicator? (Format: Name - Indicator)",
        hint: "Look for CRASHED status and extreme metrics",
        validateFn: (input) => {
            const normalized = input.toLowerCase().trim();
            const hasName = normalized.includes('netstorm');
            const hasReason = normalized.includes('cpu') || normalized.includes('load') || normalized.includes('98') || normalized.includes('18') || normalized.includes('high');
            return hasName && hasReason;
        },
        answer: "NetStorm - HighError Rate "|| "NetStorm - High CPU Load" || "NetStorm - High Users" || "Netstrom - high load" || "Netstorm - high users" || "Netstorm - high error rate" || "Netstorm - high cpu load" || "Netstorm - high users" || "Netstorm - high error rate" || "Netstorm - high cpu load" || "Netstorm - high users" || "Netstorm - high error rate"
    },
    {
        // subquery
        id: 2,
        type: 'QUERY_FLASH',
        flashDuration: 15,
        flashData: FLASH_QUERY,
        prompt: "Forensic Reconstruction: Re-type the efficiency analysis query EXACTLY.",
        hint: "SELECT name, efficiency calculation...",
        answer: FLASH_QUERY
    },
    {
        id: 3,
        type: 'TABLE_FLASH',
        flashDuration: 15,
        flashData: EVENTS_TABLE,
        prompt: "Quick Audit: Which Event ID corresponds to the 'CyberWall' event?",
        hint: "Memorize the ID column",
        validateFn: (input) => {
            return input.toLowerCase().trim() === 'e-105';
        },
        answer: "E-105"
    },
    {
        id: 4,
        type: 'LOGICAL_DECISION',
        flashDuration: 15,
        flashData: EVENTS_TABLE,
        prompt: "Impact Assessment: 'HackRush' has entered CRITICAL status. Analyze the table to determine the CORRELATION: As 'User Count' increases, what specific metric degrades most severely?",
        validateFn: (input) => {
            const normalized = input.toLowerCase().trim();
            return normalized.includes('error') || normalized.includes('rate');
        },
        answer: "Error Rate (Increases with users)"
    },
    {
        id: 5,
        type: 'QUERY_FLASH',
        flashDuration: 15,
        flashData: CONFIG_FLASH,
        prompt: "Config Restoration: Re-type the JSON configuration string EXACTLY.",
        hint: "Mind the quotes and brackets",
        answer: CONFIG_FLASH
    }
];

export const ROUND3_PLACE = "RUDRA BLOCK";
export const ROUND3_CODE = "CRPT-9384"; // Team-specific in real implementation
