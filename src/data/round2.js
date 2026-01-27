export const AGENTS_TABLE = [
    { id: 'A-01', codename: 'KESTREL', clearance: 5, status: 'ACTIVE' },
    { id: 'A-02', codename: 'HAWK', clearance: 3, status: 'INACTIVE' },
    { id: 'A-05', codename: 'FALCON', clearance: 4, status: 'ACTIVE' },
    { id: 'A-09', codename: 'OSPREY', clearance: 5, status: 'COMPROMISED' },
    { id: 'A-12', codename: 'EAGLE', clearance: 2, status: 'ACTIVE' },
];

export const ACCESS_LOGS_TABLE = [
    { log_id: 101, agent_id: 'A-05', sector: 'DATA_CENTER', result: 'GRANTED' },
    { log_id: 102, agent_id: 'A-01', sector: 'ARMORY', result: 'DENIED' },
    { log_id: 103, agent_id: 'A-09', sector: 'DATA_CENTER', result: 'GRANTED' },
    { log_id: 104, agent_id: 'A-05', sector: 'COMMAND', result: 'GRANTED' },
    { log_id: 105, agent_id: 'A-02', sector: 'ARMORY', result: 'GRANTED' },
    { log_id: 106, agent_id: 'A-05', sector: 'DATA_CENTER', result: 'DENIED' },
    { log_id: 107, agent_id: 'A-05', sector: 'ARCHIVES', result: 'GRANTED' },
];

export const ROUND2_QUESTIONS = [
    {
        id: 1,
        text: "Review the tables. Identify the AGENT_ID of the 'ACTIVE' agent with Clearance Level 4.",
        hint: "Filter AGENTS by status and clearance.",
        answer: "A-05"
    },
    {
        id: 2,
        text: "Using the AGENT_ID found in the previous step, calculate the total number of logs where access was 'GRANTED' for this agent.",
        hint: "Filter ACCESS_LOGS by agent_id and result.",
        answer: "3"
    },
    {
        id: 3,
        text: "For the logs identified in the previous step (Granted access for that agent), calculate the SUM of their LOG_IDs.",
        hint: "Sum(101 + ... + ...)",
        answer: "312" // 101 + 104 + 107 = 312
    }
];
