# 🧪 ROUND 4 TESTING GUIDE

## Quick Test Checklist

### ✅ Phase 1: Match the Logic

1. **Navigate to Round 4**
   - Complete Rounds 1-3 first OR use admin panel to jump to Round 4

2. **Verify Initial Display**
   - [ ] Title shows "ADVANTAGE ROUND - PHASE 1: MATCH THE LOGIC"
   - [ ] Subtitle shows "Match each SQL query to its correct output"
   - [ ] Info banner shows "⏱ No time limit • 📊 All tables visible • ✅ All matches must be correct"

3. **Check Tables Section**
   - [ ] "📊 Reference Tables" header visible
   - [ ] TABLE: PROJECTS displays with 7 rows
   - [ ] TABLE: TEAMS displays with 3 rows
   - [ ] TABLE: TASKS displays with 8 rows
   - [ ] All columns properly aligned
   - [ ] Horizontal scroll works if needed

4. **Check Queries Section (Left Column)**
   - [ ] "🔍 SQL Queries" header visible
   - [ ] 5 queries displayed (Query A through Query E)
   - [ ] Each query shows SQL code in code block
   - [ ] Each query has dropdown selector
   - [ ] Dropdown shows "Select output..." initially

5. **Check Outputs Section (Right Column)**
   - [ ] "📤 Query Outputs" header visible
   - [ ] 5 outputs displayed (Output 1 through Output 5)
   - [ ] Each output shows multi-row table
   - [ ] All outputs properly formatted

6. **Test Matching Interaction**
   - [ ] Click dropdown on Query A
   - [ ] Dropdown shows all 5 output options
   - [ ] Select "Output 1"
   - [ ] Selection persists
   - [ ] Submit button updates: "SUBMIT MATCHES (1/5)"

7. **Test Submit Button States**
   - [ ] Button disabled when < 5 matches
   - [ ] Button enabled when all 5 matched
   - [ ] Button shows count: "(5/5)"

8. **Test Incorrect Submission**
   - [ ] Match queries incorrectly (e.g., Q1→O2)
   - [ ] Click SUBMIT MATCHES
   - [ ] Incorrect queries get red border
   - [ ] Error message appears
   - [ ] Can retry with different selections

9. **Test Correct Submission**
   - [ ] Match all queries correctly:
     - Query A → Output 1
     - Query B → Output 2
     - Query C → Output 3
     - Query D → Output 4
     - Query E → Output 5
   - [ ] Click SUBMIT MATCHES
   - [ ] Success message appears
   - [ ] Phase 2 unlocks

---

### ✅ Phase 2: Fix the System

1. **Verify Initial Display**
   - [ ] Title shows "ADVANTAGE ROUND - PHASE 2: FIX THE SYSTEM"
   - [ ] Subtitle shows "Identify and correct the mistakes in these broken queries"
   - [ ] Info banner shows "⏱ No time limit • 📊 Tables always visible • ✅ All corrections must be correct"

2. **Check Tables Section**
   - [ ] Same 3 tables displayed
   - [ ] All data intact from Phase 1

3. **Check Question 1**
   - [ ] Title: "Q1: Incorrect WHERE Logic"
   - [ ] "BROKEN QUERY:" label visible
   - [ ] Query shown in red error box
   - [ ] Task description clear
   - [ ] Hint displayed in italic gray
   - [ ] Input field present
   - [ ] Placeholder: "Enter your correction..."

4. **Verify All 5 Questions**
   - [ ] Q1: Incorrect WHERE Logic (answer: AND)
   - [ ] Q2: Wrong Aggregation (answer: AVG)
   - [ ] Q3: Faulty Subquery (answer: MAX)
   - [ ] Q4: GROUP BY / HAVING Misuse (answer: HAVING)
   - [ ] Q5: Conceptual Logic Flaw (answer: DESC)

5. **Test Input Interaction**
   - [ ] Type in Q1 input field
   - [ ] Text appears in code font
   - [ ] Can clear and retype
   - [ ] Submit button disabled until all 5 filled

6. **Test Incorrect Submission**
   - [ ] Enter wrong answers (e.g., "OR" for Q1)
   - [ ] Click SUBMIT ALL CORRECTIONS
   - [ ] Incorrect questions get red border
   - [ ] Error message appears
   - [ ] Can retry with different answers

7. **Test Correct Submission**
   - [ ] Enter all correct answers:
     - Q1: AND
     - Q2: AVG
     - Q3: MAX
     - Q4: HAVING
     - Q5: DESC
   - [ ] Click SUBMIT ALL CORRECTIONS
   - [ ] Success message appears
   - [ ] Message mentions email
   - [ ] Email code stage unlocks

---

### ✅ Email Code Entry

1. **Verify Display**
   - [ ] Title: "ADVANTAGE CODE VERIFICATION"
   - [ ] Email icon: 📧 CHECK YOUR EMAIL
   - [ ] Location shown: "📍 LOCATION: ADMIN DESK"
   - [ ] Hint: "Code format: INT26-R4-XXXX"

2. **Test Code Entry**
   - [ ] Input field accepts text
   - [ ] Can type code format
   - [ ] Submit button enabled

3. **Test Invalid Code**
   - [ ] Enter wrong code (e.g., "WRONG")
   - [ ] Click EXECUTE
   - [ ] Error: "INVALID ADVANTAGE CODE"

4. **Test Valid Code**
   - [ ] Enter valid code (e.g., "INT26-R4-1234")
   - [ ] Click EXECUTE
   - [ ] Success message appears
   - [ ] Round complete stage unlocks

---

### ✅ Round Complete

1. **Verify Display**
   - [ ] Title: "ADVANTAGE SECURED"
   - [ ] Message: "You have earned an advantage for the Final Round!"
   - [ ] Hint: "Prepare for the ultimate challenge."

---

## 🐛 Known Issues to Check

### **Phase 1**
- [ ] Tables overflow properly on small screens
- [ ] Dropdowns work on mobile
- [ ] Grid layout doesn't break
- [ ] All 5 queries visible without scroll

### **Phase 2**
- [ ] Broken queries display correctly
- [ ] Input fields don't overlap
- [ ] Error boxes have proper contrast
- [ ] All questions fit on screen

### **General**
- [ ] No console errors
- [ ] No React warnings
- [ ] Smooth transitions between stages
- [ ] Data persists on refresh (if implemented)

---

## 📊 Validation Testing

### **Phase 1 Validation**
```javascript
// Correct mapping
{
  Q1: 'O1',
  Q2: 'O2',
  Q3: 'O3',
  Q4: 'O4',
  Q5: 'O5'
}
```

### **Phase 2 Validation**
```javascript
// Correct answers (case-insensitive)
['AND', 'AVG', 'MAX', 'HAVING', 'DESC']

// Also accepts
['and', 'avg', 'max', 'having', 'desc']
['And', 'Avg', 'Max', 'Having', 'Desc']
```

---

## 🎯 Edge Cases to Test

1. **Empty Submissions**
   - [ ] Can't submit Phase 1 with 0 matches
   - [ ] Can't submit Phase 2 with empty fields

2. **Partial Submissions**
   - [ ] Can't submit Phase 1 with 3/5 matches
   - [ ] Can't submit Phase 2 with 3/5 answers

3. **Whitespace Handling**
   - [ ] "  AND  " should work in Phase 2
   - [ ] "and " should work
   - [ ] " and" should work

4. **Case Sensitivity**
   - [ ] "and", "AND", "And" all work
   - [ ] "avg", "AVG", "Avg" all work
   - [ ] Same for all answers

5. **Retry Behavior**
   - [ ] Can retry Phase 1 multiple times
   - [ ] Can retry Phase 2 multiple times
   - [ ] Error highlighting clears on correct submission

---

## 🚀 Performance Testing

1. **Load Time**
   - [ ] Phase 1 loads in < 1 second
   - [ ] Tables render quickly
   - [ ] No lag when selecting dropdowns

2. **Interaction Speed**
   - [ ] Dropdown opens instantly
   - [ ] Input fields respond immediately
   - [ ] Submit button updates quickly

3. **Memory Usage**
   - [ ] No memory leaks
   - [ ] Tables don't cause performance issues
   - [ ] Smooth scrolling

---

## 📱 Responsive Testing

### **Desktop (1920x1080)**
- [ ] 2-column grid displays properly
- [ ] Tables fit without horizontal scroll
- [ ] All text readable

### **Laptop (1366x768)**
- [ ] Layout maintains integrity
- [ ] Dropdowns work
- [ ] Submit button visible

### **Tablet (768x1024)**
- [ ] 2-column grid still works
- [ ] Tables may need horizontal scroll
- [ ] Touch interactions work

### **Mobile (375x667)**
- [ ] Single column stack
- [ ] Tables scroll horizontally
- [ ] Dropdowns work with touch
- [ ] Submit button accessible

---

## ✅ Final Checklist

- [ ] All Phase 1 features working
- [ ] All Phase 2 features working
- [ ] Email code entry working
- [ ] Round completion working
- [ ] No console errors
- [ ] No visual bugs
- [ ] Responsive on all devices
- [ ] Validation logic correct
- [ ] Error handling works
- [ ] Retry functionality works

---

## 🎉 Success Criteria

**Phase 1 is successful when:**
- All 3 tables display correctly
- All 5 queries and outputs visible
- Matching works with dropdowns
- Validation correctly identifies wrong matches
- Correct submission unlocks Phase 2

**Phase 2 is successful when:**
- All 3 tables display correctly
- All 5 broken queries visible
- Input fields accept corrections
- Validation correctly identifies wrong answers
- Correct submission triggers email and unlocks code entry

**Overall Round 4 is successful when:**
- Teams can complete both phases
- Email system works (or backup location)
- Code entry validates correctly
- Round completion unlocks Round 5

---

**Happy Testing! 🚀**
