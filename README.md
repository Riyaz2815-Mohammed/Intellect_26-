# 🔐 CODECRYPT // INTELLECT '26
 **The Ultimate Technical CTF Platform**

CodeCrypt is a high-fidelity, cinematic technical event platform designed for Intellect '26. It features a hacker-themed interface, real-time parallel game logic, and a multi-round competitive format ranging from SQL puzzles to physical code retrieval missions.

---

## 🚀 Quick Start (Dev Mode)

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Supabase Connection URL)

### 2. Install & Run
```bash
# 1. Install Dependencies
npm install
cd backend && npm install && cd ..

# 2. Start Everything (Frontend + Backend)
npm run dev
# OR start separately:
# Terminal 1: npm run dev
# Terminal 2: cd backend && npm run dev
```

### 3. Access the App
- **Frontend**: [http://localhost:5173](http://localhost:5173) (or network IP)
- **Admin Panel**: Login with `admin` / `admin123` via `/admin` route or Lock Button
- **Player Access**:
  - Teams are created dynamically via Admin Panel.
  - Login Code is generated per team.

---

## 🎮 Game Structure

### Round 1: The Fragmentation (SQL Logic)
- **Type**: Drag & Drop Query Builder
- **Goal**: Reconstruct corrupted SQL queries.
- **Unlock**: Physical location code.

### Round 2: Data Forensics (Analysis)
- **Type**: Data Analysis & Query Writing
- **Goal**: Analyze student/college datasets to find outliers.
- **Unlock**: Access to Round 3.

### Round 3: Memory Stream (Flash)
- **Type**: High-Pressure Flash Memory
- **Goal**: Memorize disappearing tables/queries and answer in seconds.
- **Final Stage**: Email Access Code Entry.

### Round 4: The Advantage (Reasoning)
- **Type**: SQL Debugging & Logic
- **Phase 1**: Match Logic (Match Queries to Outputs).
- **Phase 2**: Fix the System (Repair Broken SQL Queries).
- **Reward**: Advantage keyword for the final round.

### Round 5: Critical System Failure (Final)
- **Type**: Parallel Data Recovery
- **Goal**: Restore unique system nodes (Atlas, Orion, Vega, Nova).
- **Final**: Physical Run to unique location -> Code Injection -> First Team Wins.

---

## 🛠️ Setup Guide

### Backend & Database (PostgreSQL)
The system uses a PostgreSQL database (hosted on Supabase) for team authentication, state management, and leaderboards.
- Connection string is managed in `backend/.env`.
- Database schema located in `database/supabase_schema.sql`.

---

## 📊 Database Features
- **Teams**: Stores credentials, current progress (Round/Stage), and scores.
- **Submissions**: Logs every attempt with timestamp, accuracy, and time taken.
- **Physical Codes**: Manages one-time-use codes for physical challenges.

---

## 🛑 Admin Control Panel
The Admin Panel is the control center for the event.
- **Access**: Click the distinct "ADMIN" button in the bottom-right corner.
- **Features**:
  - **Team Management**: Create teams, resend credentials, and **permanently delete teams**.
  - **Live Dashboard**: See real-time activity and submission logs.
  - **Override System**: Force jump teams to specific rounds/stages.
  - **Winning Page**: View the **Live Leaderboard** instantly via the "🏆 View Leaderboard" button.

## 🏆 Live Leaderboard
- **Visibility**: Hidden from players until they complete the game (Round 100).
- **Admin Access**: Always visible via Admin Panel.
- **Metrics**: Ranks based on Score, Progress (Round/Stage), and Time Taken.

---

## 📂 Project Structure
```
/src
  /components  # Reusable UI widgets
  /context     # Global State (GameContext)
  /data        # Round-specific Data (Questions, Answers)
  /screens     # Main Views (Login, Lobby, Game, Admin, Leaderboard)
  /services    # API Logic (GameService)
/backend       # Express Server (PostgreSQL, Emails, Auth, Leaderboard API)
/database      # SQL Schemas
```

---

_Built for INTELLECT '26. System Status: ONLINE._
