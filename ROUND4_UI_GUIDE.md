# 🎨 ROUND 4 UI VISUAL GUIDE

## PHASE 1: MATCH THE LOGIC

```
┌─────────────────────────────────────────────────────────────────┐
│  ADVANTAGE ROUND - PHASE 1: MATCH THE LOGIC                     │
│  Match each SQL query to its correct output                     │
│  ⏱ No time limit • 📊 All tables visible • ✅ All matches must be correct │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 Reference Tables                                             │
├─────────────────────────────────────────────────────────────────┤
│  TABLE: PROJECTS                                                 │
│  ┌────────┬──────────┬─────────┬────────┬──────────┬──────────┐│
│  │ ID     │ NAME     │ TEAM_ID │ BUDGET │ STATUS   │ PRIORITY ││
│  ├────────┼──────────┼─────────┼────────┼──────────┼──────────┤│
│  │ P-001  │ WebApp   │ T1      │ 50000  │ Active   │ High     ││
│  │ P-002  │ MobileApp│ T2      │ 75000  │ Active   │ Critical ││
│  │ ...    │ ...      │ ...     │ ...    │ ...      │ ...      ││
│  └────────┴──────────┴─────────┴────────┴──────────┴──────────┘│
│                                                                  │
│  TABLE: TEAMS                                                    │
│  ┌────┬───────┬──────────────┬────────────┐                    │
│  │ ID │ NAME  │ LEAD         │ DEPARTMENT │                    │
│  ├────┼───────┼──────────────┼────────────┤                    │
│  │ T1 │ Alpha │ Sarah Chen   │ Engineering│                    │
│  │ T2 │ Beta  │ Mike Johnson │ Product    │                    │
│  │ ...│ ...   │ ...          │ ...        │                    │
│  └────┴───────┴──────────────┴────────────┘                    │
│                                                                  │
│  TABLE: TASKS                                                    │
│  ┌─────────┬────────────┬───────────┬───────┬───────────┐      │
│  │ ID      │ PROJECT_ID │ TITLE     │ HOURS │ COMPLETED │      │
│  ├─────────┼────────────┼───────────┼───────┼───────────┤      │
│  │ TSK-001 │ P-001      │ Design UI │ 40    │ true      │      │
│  │ TSK-002 │ P-001      │ Backend   │ 60    │ true      │      │
│  │ ...     │ ...        │ ...       │ ...   │ ...       │      │
│  └─────────┴────────────┴───────────┴───────┴───────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│  🔍 SQL Queries              │  📤 Query Outputs                │
├──────────────────────────────┼──────────────────────────────────┤
│  Query A                     │  Output 1                        │
│  ┌────────────────────────┐  │  ┌──────┬──────────────┐        │
│  │ SELECT t.name,         │  │  │ NAME │ PROJECT_COUNT│        │
│  │ COUNT(p.id) as count   │  │  ├──────┼──────────────┤        │
│  │ FROM teams t           │  │  │ Alpha│ 2            │        │
│  │ JOIN projects p        │  │  │ Beta │ 2            │        │
│  │ WHERE p.status='Active'│  │  │ Gamma│ 2            │        │
│  │ GROUP BY t.name        │  │  └──────┴──────────────┘        │
│  │ HAVING COUNT(p.id)>=2  │  │                                  │
│  └────────────────────────┘  │  Output 2                        │
│  [Select output... ▼]        │  ┌──────────┬────────┐          │
│                              │  │ NAME     │ BUDGET │          │
│  Query B                     │  ├──────────┼────────┤          │
│  ┌────────────────────────┐  │  │ Security │ 90000  │          │
│  │ SELECT name, budget    │  │  │ Analytics│ 80000  │          │
│  │ FROM projects          │  │  │ MobileApp│ 75000  │          │
│  │ WHERE priority='Crit.' │  │  └──────────┴────────┘          │
│  │ AND budget > 70000     │  │                                  │
│  │ ORDER BY budget DESC   │  │  Output 3                        │
│  └────────────────────────┘  │  ┌──────┬──────┬───────────┐    │
│  [Select output... ▼]        │  │ TEAM │ LEAD │ AVG_BUDGET│    │
│                              │  ├──────┼──────┼───────────┤    │
│  Query C                     │  │ Gamma│ Alex │ 67500     │    │
│  [...]                       │  └──────┴──────┴───────────┘    │
│  [Select output... ▼]        │                                  │
│                              │  Output 4                        │
│  Query D                     │  [...]                           │
│  [...]                       │                                  │
│  [Select output... ▼]        │  Output 5                        │
│                              │  [...]                           │
│  Query E                     │                                  │
│  [...]                       │                                  │
│  [Select output... ▼]        │                                  │
└──────────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              [SUBMIT MATCHES (5/5)]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 2: FIX THE SYSTEM

```
┌─────────────────────────────────────────────────────────────────┐
│  ADVANTAGE ROUND - PHASE 2: FIX THE SYSTEM                      │
│  Identify and correct the mistakes in these broken queries      │
│  ⏱ No time limit • 📊 Tables visible • ✅ All corrections must be correct │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 Reference Tables                                             │
│  [Same 3 tables as Phase 1]                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Q1: Incorrect WHERE Logic                                      │
├─────────────────────────────────────────────────────────────────┤
│  BROKEN QUERY:                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ SELECT * FROM projects                                    │  │
│  │ WHERE status = "Active" OR priority = "Critical"          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  (Red error box)                                                 │
│                                                                  │
│  This query should find projects that are BOTH Active AND       │
│  Critical priority. What operator should replace OR?            │
│                                                                  │
│  HINT: Think about logical operators                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Enter your correction...                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Q2: Wrong Aggregation Function                                 │
├─────────────────────────────────────────────────────────────────┤
│  BROKEN QUERY:                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ SELECT team_id, SUM(budget)                               │  │
│  │ FROM projects GROUP BY team_id                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  We want the AVERAGE budget per team, not the total.           │
│  What function should replace SUM?                              │
│                                                                  │
│  HINT: Which function calculates the mean?                      │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Enter your correction...                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

[Q3, Q4, Q5 follow same pattern...]

┌─────────────────────────────────────────────────────────────────┐
│              [SUBMIT ALL CORRECTIONS]                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## COLOR SCHEME

### **Phase 1**
- **Tables:** Dark background with cyan borders
- **Queries:** Secondary background, code font
- **Dropdowns:** Primary border, green accent
- **Outputs:** Tertiary background, compact tables
- **Incorrect:** Red border + red background tint

### **Phase 2**
- **Tables:** Same as Phase 1
- **Broken Queries:** Red error box with red text
- **Task Text:** White primary text
- **Hints:** Muted gray italic
- **Input Fields:** Primary border, green accent
- **Incorrect:** Red border on input

---

## RESPONSIVE BEHAVIOR

### **Desktop (> 1024px)**
- 2-column grid for Phase 1 (queries | outputs)
- Full table width
- Side-by-side layout

### **Tablet (768px - 1024px)**
- 2-column grid maintained
- Smaller font sizes
- Horizontal scroll on tables

### **Mobile (< 768px)**
- Single column stack
- Queries first, then outputs
- Full-width dropdowns
- Horizontal scroll on tables

---

## INTERACTION STATES

### **Dropdown Selection**
- Default: "Select output..."
- Selected: Shows "Output 1", "Output 2", etc.
- Hover: Slight highlight
- Focus: Green border glow

### **Submit Button**
- Disabled: Gray, "SUBMIT MATCHES (0/5)"
- Enabled: Green, "SUBMIT MATCHES (5/5)"
- Hover: Brighter green
- Click: Pulse animation

### **Error State**
- Red border on incorrect query/question
- Red background tint
- Error persists until corrected

---

## ACCESSIBILITY

✅ Semantic HTML (tables, forms, buttons)
✅ ARIA labels on dropdowns
✅ Keyboard navigation support
✅ High contrast colors
✅ Clear focus indicators
✅ Screen reader friendly table structure

---

**This visual guide shows the expected UI layout for Round 4.**
