# Timer System - Current Status & Fixes Needed

## 🎯 Two Separate Timers

### 1. **Global Game Timer** (START MISSION → Completion)
**Purpose**: Track total time from game start to finish
**Status**: ✅ Code implemented, ❌ Not displaying correctly

**How it works**:
- Starts: When "START MISSION" clicked in Lobby
- Stores: `localStorage.gameStartTime` (timestamp)
- Stops: On CompletionScreen load
- Displays: Total time on completion screen

**Current Issue**: Shows "0:00" instead of actual time

**Possible causes**:
1. Timer not being set in localStorage
2. Timer being cleared before calculation
3. `formatTime` function issue
4. `gameStartTime` not persisting

---

### 2. **Per-Stage Timer** (For scoring bonuses)
**Purpose**: Calculate time bonus for each stage
**Status**: ✅ Fixed (removed database error)

**How it works**:
- Starts: On first submission to a stage
- Stores: `team_progress.started_at` in database
- Calculates: Time bonus based on speed

**Fixed Issues**:
- ❌ Database error: `time_taken_seconds` column doesn't exist → ✅ FIXED
- ❌ Timer not starting on first attempt → ✅ FIXED
- ❌ Time bonus showing 0 → ✅ FIXED

---

## 🔍 Debugging Steps for Global Timer

### Check 1: Is timer being set?
```javascript
// In browser console after clicking START MISSION:
localStorage.getItem('gameStartTime')
// Should return: "1738423456789" (timestamp)
// If null: Timer not being set
```

### Check 2: Is timer persisting?
```javascript
// After completing game, BEFORE completion screen loads:
localStorage.getItem('gameStartTime')
// Should still have value
// If null: Timer cleared too early
```

### Check 3: Console logs
```javascript
// Should see in console:
[TIMER] Game started at: 2026-02-02T00:00:00.000Z
[TIMER] Game completed!
[TIMER] Start: 2026-02-02T00:00:00.000Z
[TIMER] End: 2026-02-02T00:45:32.000Z
[TIMER] Total Time: 45:32
```

---

## 🐛 Potential Issues

### Issue 1: `formatTime` not defined when called
**Line 34 in CompletionScreen.jsx** calls `formatTime(totalGameTime)`
But `formatTime` is defined on **line 77**

**Fix**: Move `formatTime` definition before `fetchLeaderboard`

### Issue 2: Timer cleared before display
**Line 37** clears timer: `localStorage.removeItem('gameStartTime')`
This happens BEFORE `setTeamData` (line 51-54)

**Potential race condition**: If React re-renders, timer might be gone

**Fix**: Only clear timer AFTER successfully setting teamData

### Issue 3: Timer not set on first click
**Condition**: `if (!localStorage.getItem('gameStartTime'))`
This only sets timer if it doesn't exist

**Problem**: If user clicks START MISSION multiple times, only first click counts
**Status**: This is actually correct behavior ✅

---

## ✅ Recommended Fixes

### Fix 1: Move formatTime function
```javascript
// Move formatTime BEFORE fetchLeaderboard
const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const fetchLeaderboard = async () => {
    // ... rest of code
};
```

### Fix 2: Don't clear timer immediately
```javascript
// Store timer value first, then clear
const gameStartTime = localStorage.getItem('gameStartTime');
let totalGameTime = 0;

if (gameStartTime) {
    const startTime = parseInt(gameStartTime);
    const endTime = Date.now();
    totalGameTime = Math.floor((endTime - startTime) / 1000);
    
    console.log('[TIMER] Total Time:', formatTime(totalGameTime));
    // DON'T clear yet - wait until after state is set
}

// ... fetch leaderboard ...

setTeamData({
    ...currentTeam,
    total_time: totalGameTime || currentTeam?.total_time || 0
});

// NOW clear timer after data is set
if (gameStartTime) {
    localStorage.removeItem('gameStartTime');
}
```

### Fix 3: Add error handling
```javascript
try {
    const gameStartTime = localStorage.getItem('gameStartTime');
    if (gameStartTime) {
        const startTime = parseInt(gameStartTime);
        if (isNaN(startTime)) {
            console.error('[TIMER] Invalid start time:', gameStartTime);
        } else {
            // ... calculate time ...
        }
    } else {
        console.warn('[TIMER] No start time found in localStorage');
    }
} catch (error) {
    console.error('[TIMER] Error calculating time:', error);
}
```

---

## 📝 Testing Checklist

- [ ] Click START MISSION
- [ ] Check console for: `[TIMER] Game started at:`
- [ ] Check localStorage: `gameStartTime` should have value
- [ ] Complete all 4 rounds
- [ ] On completion screen, check console for timer logs
- [ ] Verify "Total Time" shows actual time (not 0:00)
- [ ] Verify timer is cleared from localStorage after display

---

## 🚀 Next Steps

1. Apply Fix 1: Move `formatTime` before `fetchLeaderboard`
2. Apply Fix 2: Clear timer after setting state
3. Apply Fix 3: Add error handling
4. Test with real gameplay
5. Commit fixes
