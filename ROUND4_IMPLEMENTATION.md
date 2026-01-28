# ROUND 4 IMPLEMENTATION - CODECRYPT INTELLECT '26

## Overview
Round 4 is the **ADVANTAGE ROUND** - a calm, untimed challenge that tests SQL reasoning and debugging skills.

## Structure
- **Phase 1:** Match the Logic (Query → Output Matching)
- **Phase 2:** Fix the System (Debugging Broken Queries)
- **Email Code Entry:** Team receives advantage code via email
- **Completion:** Round 5 unlocks

---

## PHASE 1: MATCH THE LOGIC

### Objective
Match 5 SQL queries to their correct outputs by analyzing the logic.

### Tables (Always Visible)
1. **PROJECTS** - 7 projects with team_id, budget, status, priority
2. **TEAMS** - 3 teams with lead, department
3. **TASKS** - 8 tasks linked to projects with hours, completion status

### Queries (5 Total)
1. **Query A:** JOIN with GROUP BY + HAVING (teams with 2+ active projects)
2. **Query B:** WHERE with multiple conditions + ORDER BY (critical projects > 70k budget)
3. **Query C:** JOIN + AVG aggregation + LIMIT (team with highest avg budget)
4. **Query D:** LEFT JOIN + GROUP BY + HAVING (active projects with 2+ tasks)
5. **Query E:** JOIN + SUM + GROUP BY (total budget by department for active/on-hold)

### Outputs (5 Multi-Row Results)
- Each output contains **multiple rows** to require careful analysis
- Outputs look similar enough to require SQL reasoning
- Correct mapping: Q1→O1, Q2→O2, Q3→O3, Q4→O4, Q5→O5

### SQL Concepts Covered
- ✅ GROUP BY + HAVING
- ✅ Subqueries
- ✅ JOINs (INNER, LEFT)
- ✅ Compound WHERE logic
- ✅ Aggregations (COUNT, AVG, SUM)
- ✅ ORDER BY + LIMIT

### Validation
- All 5 matches must be correct
- No partial credit
- Retry allowed
- Points: 150

---

## PHASE 2: FIX THE SYSTEM

### Objective
Identify and correct mistakes in 5 broken SQL queries.

### Question Types (All 5 Mandatory Types Covered)

#### Q1: Incorrect WHERE Logic
- **Broken:** `OR` used instead of `AND`
- **Answer:** "AND"
- **Concept:** Logical operators

#### Q2: Wrong Aggregation
- **Broken:** `SUM` used instead of `AVG`
- **Answer:** "AVG"
- **Concept:** Aggregation functions

#### Q3: Faulty Subquery
- **Broken:** Subquery returns multiple rows without aggregation
- **Answer:** "MAX"
- **Concept:** Subquery safety

#### Q4: GROUP BY / HAVING Misuse
- **Broken:** Aggregate function in WHERE instead of HAVING
- **Answer:** "HAVING"
- **Concept:** Filtering groups

#### Q5: Conceptual Logic Flaw
- **Broken:** ORDER BY ASC finds lowest instead of highest
- **Answer:** "DESC"
- **Concept:** Sort direction

### Answer Format
- **Controlled inputs** - not full query rewrites
- Provide: corrected clause, operator, or keyword
- Case-insensitive validation
- Whitespace-insensitive

### Validation
- All 5 answers must be correct
- Retry allowed
- On success: Email sent with advantage code
- Points: 150

---

## EMAIL CODE SYSTEM

### Code Format
`INT26-R4-XXXX` (where XXXX is 4-digit random number)

### Generation
```javascript
generateRound4Code(teamId)
// Returns: "INT26-R4-3847" (example)
```

### Delivery
- SMTP email to team
- Backup: Physical code at ADMIN DESK
- Admin can regenerate/resend

---

## GAME FLOW

```
Stage 1: Phase 1 (Match the Logic)
   ↓ (All correct)
Stage 2: Phase 2 (Fix the System)
   ↓ (All correct → Email sent)
Stage 3: Email Code Entry
   ↓ (Code verified)
Stage 4: Round Complete
   ↓
Round 5 Unlocked
```

---

## UI REQUIREMENTS

### Phase 1 UI
- **Type:** `QUERY_MATCHING`
- Queries displayed on left (read-only)
- Outputs displayed on right
- Dropdown or drag-and-drop matching
- All 3 tables always visible
- Progress indicator (X/5 matched)
- Clean, calm design

### Phase 2 UI
- **Type:** `QUERY_FIXING`
- Each question shows:
  - Broken query (read-only)
  - Task description
  - Input field for correction
  - Hint
- All 3 tables always visible
- Progress indicator (X/5 answered)

---

## ADMIN FEATURES

### Required Admin Functions
1. View team's query mappings (Phase 1)
2. View team's submitted fixes (Phase 2)
3. Re-send advantage email
4. Regenerate code
5. Force unlock Round 5
6. View all team codes

---

## VARIANT HANDLING

### Same Across Variants
- Schema structure
- Question types
- Logical difficulty
- Validation rules

### Different Per Variant
- Table data values
- Specific numbers in outputs
- Team names, project names

### Variants: A, B, C, D
- Each team gets one variant
- Prevents direct copying
- Fair difficulty across all variants

---

## KEY DESIGN PRINCIPLES

✅ **No Time Pressure** - Calm, strategic round
✅ **No Physical Movement** - Pure SQL reasoning
✅ **No SQL Execution** - Static validation only
✅ **Multi-Row Outputs** - Requires careful analysis
✅ **Controlled Inputs** - Specific corrections, not full rewrites
✅ **Earned Advantage** - Reward for SQL maturity

---

## FILES MODIFIED

1. **`src/data/round4.js`**
   - ROUND4_TABLES (projects, teams, tasks)
   - PHASE1_QUERIES, PHASE1_OUTPUTS
   - PHASE2_QUESTIONS
   - Validation functions

2. **`src/services/GameService.js`**
   - Updated imports
   - Phase 1 validation (matching)
   - Phase 2 validation (fixing)
   - getStageData for both phases

3. **`src/screens/GameScreen.jsx`** (TO BE CREATED)
   - QueryMatchingComponent
   - QueryFixingComponent

---

## NEXT STEPS

1. Create UI components for Phase 1 (Query Matching)
2. Create UI components for Phase 2 (Query Fixing)
3. Implement drag-and-drop or dropdown matching
4. Add email sending functionality
5. Create admin panel for code management
6. Test all validation logic
7. Create variant data (A, B, C, D)

---

## SUCCESS METRICS

- Teams should spend 15-25 minutes on Round 4
- Phase 1 should require careful SQL analysis
- Phase 2 should test SQL debugging skills
- Email system should be reliable
- Admin should have full control
