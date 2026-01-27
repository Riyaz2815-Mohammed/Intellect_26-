# CODECRYPT - Round 3 Implementation Summary

## Overview
Round 3 is a **PRESSURE + MEMORY + COORDINATION** round with timer-based visibility control and exactly ONE physical run.

## Flow Architecture

### STATE → TIMER → LOCK → INPUT → VALIDATION → NEXT STATE

```
Stage 1: TABLE_FLASH
├─ Show EVENTS table for 10 seconds
├─ Lock screen after timer expires
├─ Ask scenario question (Q1)
└─ Validate: keyword-based (event name + reasoning)

Stage 2: QUERY_FLASH
├─ Show SQL query for 10 seconds
├─ Lock screen after timer expires
├─ Ask to re-type query (Q2)
└─ Validate: normalized SQL comparison

Stage 3: LOGICAL_DECISION
├─ Ask decision question (Q3)
└─ Validate: exact match

Stage 4: LOCATION_REVEAL
├─ Display place: "OPEN AUDITORIUM"
├─ Team sends ONE member to get code
└─ Enter code to complete

Stage 5: ROUND_COMPLETE
└─ Success screen
```

## Implementation Details

### 1. Flash Challenge Component (`FlashChallengeContent`)
- **Timer State**: Countdown from `flashDuration` (10s)
- **Lock Mechanism**: When timer hits 0, data is hidden
- **Persistence**: State persists across refresh via localStorage
- **Visual Feedback**:
  - Active: Yellow border with countdown
  - Locked: Red border with "🔒 DATA LOCKED"

### 2. Question Types

#### Q1: TABLE_FLASH (Scenario Analysis)
```javascript
Table shown: EVENTS (event_name, participants)
Question: "Which event is most risky?"
Answer: Must contain "LogicLoop" + reasoning keyword
Validation: Custom function checking keywords
```

#### Q2: QUERY_FLASH (Memory Recall)
```sql
Query shown:
SELECT event_name
FROM events
WHERE participants >= 100;

Validation: normalizeSQL() comparison
```

#### Q3: LOGICAL_DECISION
```
Question: "Choose ONE low-risk event with participants ≥ 100"
Answer: "CodeCrypt"
Validation: Exact match (case-insensitive)
```

### 3. Validation Logic

**Round 3 Validation in GameService.js:**
- Q1: `validateFn(input)` - Custom keyword matching
- Q2: `normalizeSQL()` - Whitespace/case insensitive
- Q3: Exact string match
- Stage 4: Physical code validation

### 4. State Transitions

**Automatic Round Progression:**
```javascript
Round 1, Stage 5 → Round 2, Stage 1
Round 2, Stage 3 → Round 3, Stage 1
Round 3, Stage 4 → Round 3, Stage 5 (Complete)
```

### 5. Edge Cases Handled

✅ **Refresh Protection**: localStorage persistence
✅ **Timer Persistence**: Flash state NOT reset on refresh (once locked, stays locked)
✅ **No Re-view**: Data cannot be viewed again after lock
✅ **Admin Override**: Can force any round/stage
✅ **Error Handling**: Clear error messages for wrong answers
✅ **Retry Allowed**: Users can retry wrong answers

## Testing Instructions

### Manual Testing Flow:

1. **Start Application**
   ```
   npm run dev
   Navigate to http://localhost:5173/
   ```

2. **Skip to Round 3**
   - Click "ADMIN" button (bottom-right)
   - Set Round: 3, Stage: 1
   - Click "JUMP TO"

3. **Test Q1 (Table Flash)**
   - Watch table for 10 seconds
   - After lock, answer: "LogicLoop lowest"
   - Should accept and move to Q2

4. **Test Q2 (Query Flash)**
   - Watch query for 10 seconds
   - After lock, type: `SELECT event_name FROM events WHERE participants >= 100;`
   - Should accept and move to Q3

5. **Test Q3 (Logical Decision)**
   - Answer: "CodeCrypt"
   - Should reveal location

6. **Test Physical Code**
   - Enter: "CRPT-9384"
   - Should complete Round 3

### Admin Testing:

- **Force Unlock**: Admin can skip to any stage
- **Reset**: Admin can reset entire game
- **View State**: Admin panel shows current round/stage/score

## Security Considerations

✅ **No SQL Execution**: All validation is string-based
✅ **No Eval**: No dynamic code execution
✅ **Deterministic**: All answers are predefined
✅ **Safe Input**: Only alphanumeric + SQL chars allowed
✅ **One-time Codes**: Physical codes are team-specific (in real implementation)

## Performance

- **Timer Accuracy**: 1-second intervals
- **State Updates**: Optimized with useEffect dependencies
- **Render Optimization**: Conditional rendering based on type
- **Memory**: localStorage for persistence

## Known Limitations

1. **Physical Code**: Currently hardcoded (`CRPT-9384`)
   - In production: Should be team-specific from backend
   - Should be one-time use
   - Should be regenerable by admin

2. **Timer Sync**: Timer is client-side
   - In production: Should sync with server time
   - Should handle clock skew

3. **Concurrent Access**: No locking mechanism
   - In production: Should prevent multiple team members from different devices

## Files Modified

```
src/
├── data/
│   ├── round1.js (existing)
│   ├── round2.js (existing)
│   └── round3.js (NEW)
├── services/
│   └── GameService.js (updated)
├── screens/
│   └── GameScreen.jsx (updated with FlashChallengeContent)
└── context/
    └── GameContext.jsx (updated transitions)
```

## Next Steps (Round 4 - Future)

Round 4 could be:
- Live SQL injection defense
- Real-time debugging challenge
- Team coordination puzzle
- Final boss challenge

---

**Status**: ✅ Round 3 Implementation Complete
**Testing**: Manual testing required (browser unavailable in current environment)
**Production Ready**: Needs backend integration for team-specific codes
