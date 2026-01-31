# CODECRYPT - Scoring System Documentation

## 📊 Comprehensive Scoring Algorithm

CODECRYPT uses a sophisticated scoring system that rewards speed, accuracy, and completion.

---

## 🎯 Scoring Components

### 1. Base Points (Difficulty-Based)

Each round has a base point value based on its difficulty:

| Round | Difficulty | Base Points per Stage |
|-------|-----------|----------------------|
| Round 1 | Easy | 100 |
| Round 2 | Medium | 150 |
| Round 3 | Hard (Memory) | 200 |
| Round 4 | Very Hard | 250 |

### 2. Time Bonus (Speed Reward)

Teams earn bonus points for completing stages quickly:

**Formula**: `timeBonus = max(0, (timeLimit - timeTaken) * multiplier)`

| Round | Time Limit | Multiplier | Max Bonus |
|-------|-----------|-----------|-----------|
| Round 1 | 300s (5min) | 0.3 | 90 points |
| Round 2 | 600s (10min) | 0.2 | 120 points |
| Round 3 | 120s (2min) | 0.5 | 60 points |
| Round 4 | 180s (3min) | 0.4 | 72 points |

**Example**: Complete Round 3 stage in 60 seconds
- Time saved: 120 - 60 = 60s
- Bonus: 60 × 0.5 = **30 points**

### 3. Retry Penalty (Accuracy Reward)

Teams lose points for multiple attempts:

| Attempt | Penalty |
|---------|---------|
| 1st | 0 points |
| 2nd | -20 points |
| 3rd | -40 points |
| 4th+ | -60 points (capped) |

### 4. Completion Bonus (Finishing Reward)

Bonus awarded when all stages of a round are completed:

| Round | Completion Bonus |
|-------|-----------------|
| Round 1 | +100 points |
| Round 2 | +150 points |
| Round 3 | +200 points |
| Round 4 | +250 points |

---

## 🧮 Final Score Calculation

```
Stage Score = Base Points + Time Bonus - Retry Penalty
Round Score = Sum(All Stage Scores) + Completion Bonus
Total Score = Sum(All Round Scores)
```

---

## 📈 Score Examples

### Perfect Run (Fast, No Retries)

**Round 1** (5 stages):
- Per stage: 100 (base) + 50 (time) - 0 (retry) = 150
- Total stages: 150 × 5 = 750
- Completion bonus: +100
- **Round Total: 850 points**

**Round 2** (5 stages):
- Per stage: 150 (base) + 40 (time) - 0 (retry) = 190
- Total stages: 190 × 5 = 950
- Completion bonus: +150
- **Round Total: 1100 points**

**Round 3** (5 stages):
- Per stage: 200 (base) + 30 (time) - 0 (retry) = 230
- Total stages: 230 × 5 = 1150
- Completion bonus: +200
- **Round Total: 1350 points**

**Round 4** (3 stages):
- Per stage: 250 (base) + 60 (time) - 0 (retry) = 310
- Total stages: 310 × 3 = 930
- Completion bonus: +250
- **Round Total: 1180 points**

**TOTAL SCORE: ~4480 points**

---

### Average Run (Medium Speed, Some Retries)

**Round 1** (5 stages):
- Per stage: 100 (base) + 20 (time) - 20 (retry) = 100
- Total stages: 100 × 5 = 500
- Completion bonus: +100
- **Round Total: 600 points**

**Round 2** (5 stages):
- Per stage: 150 (base) + 30 (time) - 20 (retry) = 160
- Total stages: 160 × 5 = 800
- Completion bonus: +150
- **Round Total: 950 points**

**Round 3** (5 stages):
- Per stage: 200 (base) + 10 (time) - 40 (retry) = 170
- Total stages: 170 × 5 = 850
- Completion bonus: +200
- **Round Total: 1050 points**

**Round 4** (3 stages):
- Per stage: 250 (base) + 20 (time) - 40 (retry) = 230
- Total stages: 230 × 3 = 690
- Completion bonus: +250
- **Round Total: 940 points**

**TOTAL SCORE: ~3540 points**

---

### Slow Run (Slow, Many Retries)

**Round 1** (5 stages):
- Per stage: 100 (base) + 5 (time) - 40 (retry) = 65
- Total stages: 65 × 5 = 325
- Completion bonus: +100
- **Round Total: 425 points**

**Round 2** (5 stages):
- Per stage: 150 (base) + 10 (time) - 60 (retry) = 100
- Total stages: 100 × 5 = 500
- Completion bonus: +150
- **Round Total: 650 points**

**Round 3** (5 stages):
- Per stage: 200 (base) + 0 (time) - 60 (retry) = 140
- Total stages: 140 × 5 = 700
- Completion bonus: +200
- **Round Total: 900 points**

**Round 4** (3 stages):
- Per stage: 250 (base) + 5 (time) - 60 (retry) = 195
- Total stages: 195 × 3 = 585
- Completion bonus: +250
- **Round Total: 835 points**

**TOTAL SCORE: ~2810 points**

---

## 🎮 Strategy Tips

### Maximize Your Score

1. **Speed Matters**: Complete stages quickly to earn time bonuses
2. **Accuracy First**: Avoid retries to prevent penalties
3. **Complete Rounds**: Always finish rounds for completion bonuses
4. **Practice**: Familiarize yourself with SQL syntax beforehand

### Penalty Avoidance

- Read questions carefully before answering
- Use hints when available
- Double-check your answers
- Don't rush on complex questions

---

## 🔍 Backend Implementation

### Configuration (gameService.js)

```javascript
const ROUND_CONFIG = {
    1: { basePoints: 100, timeLimit: 300, timeMultiplier: 0.3, completionBonus: 100 },
    2: { basePoints: 150, timeLimit: 600, timeMultiplier: 0.2, completionBonus: 150 },
    3: { basePoints: 200, timeLimit: 120, timeMultiplier: 0.5, completionBonus: 200 },
    4: { basePoints: 250, timeLimit: 180, timeMultiplier: 0.4, completionBonus: 250 }
};

const RETRY_PENALTY = {
    0: 0,    // 1st attempt
    1: 20,   // 2nd attempt
    2: 40,   // 3rd attempt
    3: 60    // 4th+ attempt (capped)
};
```

### Scoring Logic (server.js)

```javascript
// 1. Get retry count
const retryCount = await countFailedAttempts(teamId, round, stage);
const retryPenalty = RETRY_PENALTY[Math.min(retryCount, 3)];

// 2. Calculate time bonus
const timeTaken = calculateTime(startTime, endTime);
const config = ROUND_CONFIG[round];
const timeBonus = max(0, (config.timeLimit - timeTaken) * config.timeMultiplier);

// 3. Calculate stage score
const stageScore = config.basePoints + timeBonus - retryPenalty;

// 4. Award completion bonus (if last stage)
if (isLastStage) {
    totalScore += config.completionBonus;
}
```

---

## 📊 Leaderboard Ranking

Teams are ranked by:
1. **Total Score** (primary)
2. **Progress** (rounds completed)
3. **Total Time** (tiebreaker)

---

## 🐛 Debugging

All scoring calculations are logged to the backend console:

```
[SCORING] Team TM-001 Round 3 Stage 2:
  Base: 200, Time Bonus: 25, Retry Penalty: -20, Total: 205
  Retry Count: 1, Time Taken: 95s
```

Use these logs to verify scoring accuracy during testing.
