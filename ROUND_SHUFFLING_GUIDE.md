# 🔄 Round Shuffling System (Anti-Collision)

## 🎯 The Goal
To prevent "Place Conflict" (overcrowding) at physical locations, teams are assigned different **Round Paths**. Everyone plays the same rounds, but in a different order.

## 🚦 System Rules

1.  **Round 5 is ALWAYS Final** (The "Grand Finale").
2.  **Round 4 is Fixed** (The "Pre-Final" / Advantage Round).
3.  **Rounds 1, 2, 3 are Shuffled** (The "Circuit").

## 🗺️ The Paths

We have 3 distinct paths assigned based on Team ID:

### **Path A (Standard)**
1.  **Round 1** (Physical: Library)
2.  **Round 2** (Virtual)
3.  **Round 3** (Physical: Auditorium)
4.  **Round 4** → **Round 5**

### **Path B (Shift 1)**
1.  **Round 2** (Virtual)
2.  **Round 3** (Physical: Auditorium)
3.  **Round 1** (Physical: Library)
4.  **Round 4** → **Round 5**

### **Path C (Shift 2)**
1.  **Round 3** (Physical: Auditorium)
2.  **Round 1** (Physical: Library)
3.  **Round 2** (Virtual)
4.  **Round 4** → **Round 5**

## 🧪 How It Works in Code

### **1. Assignment (`GameContext.jsx`)**
When a team logs in, we calculate a simple hash of their Team ID:
```javascript
const sum = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
const pathIndex = sum % 3; // 0, 1, or 2
```

### **2. Dynamic Transitions**
Instead of hardcoding `if (round === 1) goto 2`, the system now asks:
> "I just finished Round X. What is the next round in my assigned path?"

```javascript
// Example for Path C [3, 1, 2]
Finished Round 3? -> Next is Round 1
Finished Round 1? -> Next is Round 2
Finished Round 2? -> Path Complete -> Go to Round 4
```

## 🎮 Testing

1.  **Login as `TM-001`**:
    *   Might get Path A `[1, 2, 3]`
    *   Start -> Round 1

2.  **Login as `TM-002`**:
    *   Might get Path B `[2, 3, 1]`
    *   Start -> Round 2

**Note:** You can check the console logs to see which path was assigned:
`Game State Updated: { ..., roundPath: [2, 3, 1] }`
