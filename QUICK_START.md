# CODECRYPT - Quick Start Guide

## 🚀 Running the Application

### The application is ALREADY RUNNING! ✅

Your dev server started automatically and is available at:
**http://localhost:5173**

Just open your browser and go to that URL!

---

## 📋 If You Need to Restart

### 1. Stop Current Server
Press `Ctrl + C` in the terminal running the dev server

### 2. Start Fresh
```bash
cd e:/tmp
npm run dev
```

The server will start on `http://localhost:5173`

---

## 🎮 Testing the Application

### Option 1: Quick Test (No Database)
The app works WITHOUT Supabase for testing!

1. **Open Browser**: http://localhost:5173
2. **Login**: 
   - Team ID: `TM-001`
   - Access Code: `warrior123`
3. **Use Admin Panel**:
   - Click "ADMIN" button (bottom-right)
   - Jump to any round to test

### Option 2: With Supabase (Full Features)

#### Step 1: Install Supabase Package
```bash
npm install @supabase/supabase-js
```

#### Step 2: Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Create new project (takes 2-3 minutes)

#### Step 3: Get API Keys
1. In Supabase Dashboard → Settings → API
2. Copy:
   - Project URL
   - anon/public key

#### Step 4: Create .env File
Create `e:/tmp/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 5: Run Database Schema
1. In Supabase Dashboard → SQL Editor
2. Copy content from `database/supabase_schema.sql`
3. Paste and Run

#### Step 6: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Each Round

### Round 1: SQL Reordering (Drag & Drop)
1. **Admin Panel** → Round: 1, Stage: 1
2. **Drag fragments** to correct order
3. **Submit** each query
4. **Answers**:
   - Q1: `SELECT name FROM students WHERE marks > 50;`
   - Q2: `SELECT AVG(salary) FROM employees WHERE dept = 'IT';`
   - Q3: `SELECT COUNT(*) FROM orders WHERE status = 'completed';`
   - Q4: `SELECT product, SUM(quantity) FROM sales GROUP BY product;`

### Round 2: Data Analysis
1. **Admin Panel** → Round: 2, Stage: 1
2. **Answers**:
   - Q1: `AGENT_007`
   - Q2: `2`
   - Q3: `AGENT_003`

### Round 3: Flash Memory (20 seconds)
1. **Admin Panel** → Round: 3, Stage: 1
2. **Watch table for 20 seconds**
3. **After lock, answer**:
   - Q1: `LogicLoop lowest`
   - Q2: `SELECT event_name FROM events WHERE participants >= 100;`
   - Q3: `CodeCrypt`
4. **Physical Code**: `CRPT-9384`

### Round 4: SQL Reasoning (No Time Limit)
1. **Admin Panel** → Round: 4, Stage: 1
2. **Answers**:
   - Q1: `3`
   - Q2: `67000`
   - Q3: `3`
   - Q4: `450`
   - Q5: `Engineering`
3. **Email Code**: `INT26-R4-XXXX` (any 4 digits for testing)

---

## 🎨 Features to Test

### ✅ Drag & Drop (Round 1)
- Drag SQL fragments from top pool
- Drop in correct order below
- Reset button to start over

### ✅ Flash Timer (Round 3)
- 20-second countdown
- Data disappears after timer
- Screen locks

### ✅ Multi-Question (Round 4)
- All 5 questions visible
- Tables always shown
- Wrong answers highlighted in red
- Retry unlimited times

### ✅ Retry Mechanism
- Wrong answer → Retry button appears
- Clear error messages
- No score penalty

### ✅ Admin Panel
- Jump to any round/stage
- Override team state
- Reset game
- View current state

---

## 🔧 Troubleshooting

### Port Already in Use
If you see "Port 5173 is already in use":
```bash
# Kill the process
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found
```bash
npm install
```

### Supabase Connection Error
1. Check `.env` file exists
2. Verify API keys are correct
3. Check Supabase project is not paused
4. Try without Supabase first (app works offline)

### Drag & Drop Not Working
- Make sure you're on Round 1
- Try refreshing the page
- Check browser console for errors

---

## 📱 Browser Compatibility

✅ **Recommended**: Chrome, Edge, Firefox (latest)  
⚠ **Not Tested**: Safari, IE  

---

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run dev

# Install dependencies
npm install

# Install Supabase
npm install @supabase/supabase-js

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Default Test Credentials

### Teams (if using Supabase):
| Team ID | Access Code | Email |
|---------|-------------|-------|
| TM-001 | warrior123 | team1@example.com |
| TM-002 | debug456 | team2@example.com |
| TM-003 | ninja789 | team3@example.com |

### Physical Codes:
| Team | Round 1 | Round 3 |
|------|---------|---------|
| TM-001 | CRPT-7712 | CRPT-9384 |
| TM-002 | CRPT-7713 | CRPT-9385 |
| TM-003 | CRPT-7714 | CRPT-9386 |

---

## 🎮 Admin Panel Shortcuts

1. **Open Admin**: Click "ADMIN" button (bottom-right corner)
2. **Jump to Round**: Set Round & Stage, click "JUMP TO"
3. **Reset**: Click "RESET GAME"
4. **Close**: Click "CLOSE" or click outside panel

---

## 📝 What Works Without Supabase

✅ All game logic  
✅ All validations  
✅ All UI features  
✅ Drag & drop  
✅ Flash timer  
✅ Admin panel  
✅ State persistence (localStorage)  

❌ Team login (uses mock data)  
❌ Email sending  
❌ Leaderboard  
❌ Multi-device sync  

---

## 🚀 For Live Event

### Before Event Day:
1. ✅ Setup Supabase
2. ✅ Run database schema
3. ✅ Register all teams
4. ✅ Test email sending
5. ✅ Deploy to production (Vercel/Netlify)

### On Event Day:
1. Share URL with teams
2. Monitor admin dashboard
3. Use admin overrides if needed
4. Check submission logs

---

## 💡 Tips

- **Use Admin Panel** for quick testing
- **Refresh page** to test state persistence
- **Open Console** (F12) to see debug logs
- **Test on mobile** for responsive design
- **Try wrong answers** to see error handling

---

## 🎉 You're Ready!

The application is **fully functional** and ready to test!

**Next Steps:**
1. Open http://localhost:5173 in your browser
2. Click around and explore
3. Use Admin Panel to jump between rounds
4. Test all features
5. Setup Supabase when ready for full deployment

**Need Help?**
- Check `COMPLETE_SYSTEM_GUIDE.md` for full documentation
- Check `SUPABASE_SETUP.md` for database setup
- Check `ROUND4_IMPLEMENTATION.md` for Round 4 details

Good luck with Intellect '26! 🚀
