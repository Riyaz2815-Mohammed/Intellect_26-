# 🎮 CODECRYPT - Game Master Reference Guide

## 📋 Quick Reference

### Physical Location Codes
| Round | Location | Access Code |
|-------|----------|-------------|
| Round 1 | **CANTEEN** | `CRPT-7712` |
| Round 2 | **OPEN AUDI** | `CRPT-5521` |
| Round 4 | **OVAL** | `CRPT-8124` |

### Email Advantage
- **Trigger**: Completing Round 3 (Flash/Memory)
- **Reward**: Email with code for next round in team's sequence
- **Purpose**: Skip physical location visit for one round

---

## 🎯 Round 1: SQL Syntax (Drag & Drop)

**Location**: CANTEEN  
**Code**: `CRPT-7712`  
**Stages**: 4 SQL reconstruction challenges

### Answers

**Stage 1:**
```sql
SELECT name FROM students WHERE marks > 80
```

**Stage 2:**
```sql
SELECT * FROM logs WHERE status = 'error' ORDER BY created_at DESC
```

**Stage 3:**
```sql
SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5
```

**Stage 4:**
```sql
SELECT users.name, orders.amount FROM users JOIN orders ON users.id = orders.user_id
```

---

## 🎯 Round 2: SQL Logic & Reasoning

**Location**: OPEN AUDI  
**Code**: `CRPT-5521`  
**Stages**: 4 SQL query challenges with college database

### Database Schema
**Students Table:**
- id: 101-106
- name, dept, year, gpa, attendance

**Departments Table:**
- code (CS, ECE, MECH)
- name, head

**Assignments Table:**
- id, student_id, subject, score

### Answers

**Stage 1:** Find Rahul's DBMS score
```sql
SELECT id, score FROM students 
JOIN assignments ON students.id = assignments.student_id 
WHERE students.name = 'Rahul' AND assignments.subject = 'DB_MS'
```

**Stage 2:** Track performance (ID 101)
```sql
SELECT * FROM assignments WHERE student_id = 101
```

**Stage 3:** Top scorers with attendance > 90%
```sql
SELECT name, score FROM students 
JOIN assignments ON students.id = assignments.student_id 
WHERE students.attendance > 90 
ORDER BY assignments.score DESC
```

**Stage 4:** 3-table JOIN
```sql
SELECT students.name, departments.head, assignments.subject 
FROM students 
JOIN departments ON students.dept = departments.code 
JOIN assignments ON students.id = assignments.student_id 
WHERE students.id = 101
```

---

## 🎯 Round 3: Flash/Memory Analysis

**Stages**: 5 flash memory challenges  
**Special**: Completing this round triggers email advantage

### Events Table (Flash Data)
| id | name | users | cpu_load | error_rate | status |
|----|------|-------|----------|------------|--------|
| E-101 | CodeCrypt | 120 | 45 | 0.5 | STABLE |
| E-102 | HackRush | 260 | 92 | 12.4 | CRITICAL |
| E-103 | DataQuest | 150 | 55 | 1.2 | STABLE |
| E-104 | LogicLoop | 230 | 78 | 4.5 | WARNING |
| E-105 | CyberWall | 80 | 30 | 0.1 | STABLE |
| E-106 | NetStorm | 310 | 98 | 18.2 | CRASHED |

### Answers

**Stage 1:** Root cause analysis
- **Answer**: `NetStorm - High Error Rate` (or High CPU Load, or High Users)
- **Validation**: Must include "NetStorm" and a reason (cpu/load/error/high)

**Stage 2:** Retype efficiency query
```sql
SELECT name, (cpu_load/users) as efficiency 
FROM events 
WHERE status = "CRITICAL" 
ORDER BY error_rate DESC
```

**Stage 3:** CyberWall status
- **Answer**: `stable`

**Stage 4:** LogicLoop warning reason
- **Answer**: `High Error Rate` (or High CPU load, or High users)
- **Validation**: Must include "error" or "rate" or "high" or "4.5"

**Stage 5:** Execute query mentally
- **Query**: `SELECT name FROM events WHERE (status = "CRITICAL" OR status = "CRASHED") AND cpu_load > 75 and users < 300`
- **Answer**: `HackRush`

---

## 🎯 Round 4: SQL Advantage Round

**Location**: OVAL  
**Code**: `CRPT-8124`  
**Stages**: 3 (Phase 1: Matching, Phase 2: Fixing, Phase 3: Code Entry)

### Phase 1: Match the Logic (Query ↔ Output)

**Correct Mappings:**
- Query A (Q1) → Output 3 (O3)
- Query B (Q2) → Output 5 (O5)
- Query C (Q3) → Output 1 (O1)
- Query D (Q4) → Output 4 (O4)
- Query E (Q5) → Output 2 (O2)

**Answer Format**: `Q1:O3, Q2:O5, Q3:O1, Q4:O4, Q5:O2`

### Phase 2: Fix the System

**Question 1:** Logic Error (OR → AND)
```sql
SELECT * FROM projects WHERE priority = "Critical" AND budget > 50000
```

**Question 2:** Missing JOIN condition
```sql
SELECT p.name, t.title FROM projects p JOIN tasks t ON p.id = t.project_id
```

**Question 3:** Missing GROUP BY
```sql
SELECT team_id, COUNT(*) FROM projects GROUP BY team_id
```

**Question 4:** Subquery needs MAX()
```sql
SELECT name FROM projects WHERE budget > (SELECT MAX(budget) FROM projects WHERE team_id = "T2")
```

**Question 5:** WHERE → HAVING for aggregates
```sql
SELECT team_id, COUNT(*) FROM projects GROUP BY team_id HAVING COUNT(*) > 1
```

### Phase 3: Code Entry
- Teams enter physical location code: `CRPT-8124`
- Or email code (if received after Round 3)

---

## 🏆 Scoring System

### Points Breakdown
- **Round 1**: ~100 points per stage (4 stages)
- **Round 2**: ~100 points per stage (4 stages)
- **Round 3**: ~100 points per stage (5 stages)
- **Round 4**: 
  - Phase 1: 150 points
  - Phase 2: 150 points

### Time Bonus
- **Formula**: `(600 - time_taken_seconds) × 0.2`
- **Max Time**: 600 seconds (10 minutes)
- **Example**: Complete in 300s → Bonus = (600-300) × 0.2 = 60 points

### Leaderboard Sorting
1. **Total Score** (highest first)
2. **Progress** (furthest round/stage)
3. **Time Taken** (fastest wins)

---

## 📧 Email System

### Round 3 Completion Email
**Subject**: `🎁 ADVANTAGE CODE - Round X Access`

**Content**:
- Congratulations message
- Code for next round in team's sequence
- No physical location visit needed

**Example**:
```
Team Alpha,
Congratulations! You completed Round 3!
Your code for Round 1: CRPT-7712
No need to visit CANTEEN - you've earned this advantage!
```

---

## 🔄 Round Sequences

Teams get different round orders to prevent location overlap:

| Team # | Sequence |
|--------|----------|
| Team 1 | 1 → 2 → 3 → 4 |
| Team 2 | 2 → 4 → 1 → 3 |
| Team 3 | 3 → 1 → 4 → 2 |
| Team 4 | 4 → 3 → 2 → 1 |

**Note**: Sequence rotates based on last team created (Last + 1 logic)

---

## 🛠️ Admin Panel Access

### View All Codes
```
GET /api/admin/codes
```

### View Team Progress
```
GET /api/admin/teams
```

### View Submissions
```
GET /api/admin/submissions
```

### Reset Team (if needed)
```
POST /api/admin/teams/:teamId/reset
```

---

## ⚠️ Common Issues & Solutions

### Issue: Email not sent after Round 3
**Solution**: Check backend logs for `[EMAIL SUCCESS]` or `[EMAIL FAILED]`

### Issue: Phase skipping
**Solution**: Fixed with idempotency check + button disable logic

### Issue: Scores not updating
**Solution**: Check database column is `video_time_taken` not `time_taken_seconds`

### Issue: Leaderboard shows 0:00 time
**Solution**: Ensure submissions table has `video_time_taken` column

---

## 📞 Support

For technical issues during the event:
1. Check backend logs (`npm run dev` in backend folder)
2. Check Admin Panel for team status
3. Verify database connection
4. Check email service (EmailJS) configuration

---

**Last Updated**: 2026-01-31  
**Version**: 1.0  
**Event**: CODECRYPT Intellect '26
