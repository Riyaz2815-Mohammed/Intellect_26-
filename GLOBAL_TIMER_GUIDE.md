# Global Game Timer - Implementation Guide

## ⏱️ How It Works

The global game timer tracks the **total time from when a team clicks "START MISSION" until they complete all 4 rounds**.

---

## 🚀 Timer Flow

### 1. **Timer Starts**
- **When**: Team clicks "🚀 START MISSION" button in the Lobby
- **Where**: `LobbyScreen.jsx` (line 128-136)
- **What happens**:
  - Stores current timestamp in `localStorage.gameStartTime`
  - Only starts once (first click only)
  - Persists across page refreshes

```javascript
if (!localStorage.getItem('gameStartTime')) {
    const startTime = Date.now();
    localStorage.setItem('gameStartTime', startTime.toString());
    console.log('[TIMER] Game started at:', new Date(startTime).toISOString());
}
```

### 2. **Timer Runs**
- Timer continues running in the background
- Stored in localStorage (survives page refreshes)
- No active countdown or display during gameplay
- Independent of individual round/stage timers

### 3. **Timer Stops & Calculates**
- **When**: Team reaches the Completion Screen (all 4 rounds done)
- **Where**: `CompletionScreen.jsx` (line 23-38)
- **What happens**:
  - Retrieves `gameStartTime` from localStorage
  - Calculates: `totalTime = (endTime - startTime) / 1000` (in seconds)
  - Displays formatted time on completion screen
  - Clears timer from localStorage

```javascript
const gameStartTime = localStorage.getItem('gameStartTime');
if (gameStartTime) {
    const startTime = parseInt(gameStartTime);
    const endTime = Date.now();
    totalGameTime = Math.floor((endTime - startTime) / 1000);
    
    console.log('[TIMER] Total Time:', formatTime(totalGameTime));
    localStorage.removeItem('gameStartTime');
}
```

### 4. **Timer Cleanup**
- **On Logout**: Timer is cleared from localStorage
- **On Completion**: Timer is automatically removed
- **On New Game**: Fresh timer starts

---

## 📊 Timer Display

### Completion Screen Shows:
```
┌─────────────────────────────────┐
│  🎉 MISSION ACCOMPLISHED!       │
│                                 │
│  Total Time: 45:32              │
│  Total Score: 4,250             │
│  Position: #3 🥉                │
└─────────────────────────────────┘
```

---

## 🔍 Implementation Details

### Files Modified:

1. **`src/screens/LobbyScreen.jsx`**
   - Added timer start logic to START MISSION button
   - Stores timestamp on first click only

2. **`src/screens/CompletionScreen.jsx`**
   - Calculates total game time
   - Displays formatted time
   - Clears timer after calculation

3. **`src/context/GameContext.jsx`**
   - Clears timer on logout
   - Ensures clean state reset

---

## 💡 Key Features

✅ **Persistent**: Survives page refreshes (stored in localStorage)
✅ **Accurate**: Millisecond precision, displayed in MM:SS format
✅ **Simple**: No database changes required
✅ **Clean**: Automatically clears after use
✅ **Debug-friendly**: Console logs for tracking

---

## 🧪 Testing

### Test Scenario 1: Normal Flow
1. Team logs in → Sees lobby
2. Clicks "START MISSION" → Timer starts (check console)
3. Completes all 4 rounds → Timer stops
4. Completion screen shows total time
5. Timer is cleared from localStorage

### Test Scenario 2: Page Refresh
1. Start mission → Timer starts
2. Refresh page mid-game
3. Timer continues (persisted in localStorage)
4. Complete game → Correct total time shown

### Test Scenario 3: Logout
1. Start mission → Timer starts
2. Logout before completing
3. Timer is cleared
4. Login again → Fresh timer on next start

---

## 🐛 Debugging

### Check Timer Status:
```javascript
// In browser console
localStorage.getItem('gameStartTime')
// Returns: "1738423456789" (timestamp) or null
```

### View Timer Logs:
```javascript
// Console logs:
[TIMER] Game started at: 2026-02-01T14:30:00.000Z
[TIMER] Game completed!
[TIMER] Start: 2026-02-01T14:30:00.000Z
[TIMER] End: 2026-02-01T15:15:32.000Z
[TIMER] Total Time: 45:32
```

---

## 📈 Time Format

```javascript
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Examples:
formatTime(90)   // "1:30"
formatTime(3665) // "61:05"
formatTime(45)   // "0:45"
```

---

## 🎯 Advantages of This Approach

1. **No Database Changes**: Works with existing schema
2. **Client-Side**: Fast and responsive
3. **Persistent**: Survives refreshes
4. **Simple**: Easy to understand and maintain
5. **Accurate**: Precise to the second

---

## ⚠️ Important Notes

- Timer starts **only once** per game session
- Timer is **independent** of stage/round timers (used for scoring)
- Timer **persists** across page refreshes
- Timer **clears** on logout or completion
- Timer is **client-side** (not stored in database)

---

## 🔄 Future Enhancements (Optional)

If you want to store the timer in the database later:

1. Add `game_started_at` and `game_completed_at` columns to `teams` table
2. Send timer data to backend on completion
3. Use for leaderboard sorting or analytics

But for now, the localStorage approach works perfectly! ✅
