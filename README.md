# 🔐 CODECRYPT // INTELLECT '26
 **The Ultimate Technical CTF Platform**

CodeCrypt is a high-fidelity, cinematic technical event platform designed for Intellect '26. It features a hacker-themed interface, real-time parallel game logic, and a multi-round competitive format ranging from SQL puzzles to physical code retrieval missions.

---

## 🚀 Quick Start (Dev Mode)

### 1. Prerequisites
- Node.js (v18+)
- MySQL (Optional, for backend)

### 2. Install & Run
```bash
# 1. Install Dependencies
npm install
cd backend && npm install && cd ..

# 2. Start Everything (Frontend + Backend)
npm run dev
# OR start separately:
# Terminal 1: npm run dev
# Terminal 2: node backend/server.js
```

### 3. Access the App
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Admin Panel**: Login with `admin` / `admin123`
- **Player Access**:
  - **Team A**: User: `CodeWarriors` | Code: `WAR-001`
  - **Team B**: User: `ByteBusters` | Code: `BYT-002`

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
- **Mechanic**: 20s Flash Timer.

### Round 4: The Advantage (Reasoning)
- **Type**: Complex SQL Debugging
- **Goal**: Match queries to outputs and fix broken logic.
- **Reward**: Advantage keyword for the final round.

### Round 5: Critical System Failure (Final)
- **Type**: Parallel Data Recovery
- **Goal**: Restore unique system nodes (Atlas, Orion, Vega, Nova).
- **Final**: Physical Run to unique location -> Code Injection -> First Team Wins.

---

## 🛠️ Setup Guide

### Backend & Database (MySQL)
The system uses a local MySQL database for team authentication and state.
👉 **[Read the Backend Setup Guide](docs/BACKEND_SETUP.md)**

## 📊 Database Schema (MySQL)

**Table: `teams`**
- `id` (INT, PK, Auto Increment)
- `team_id` (VARCHAR, Unique) - e.g. "TM-101"
- `team_name` (VARCHAR) - e.g. "CodeWarriors"
- `email` (VARCHAR)
- `login_code` (VARCHAR) - Secret for login
- `access_code` (VARCHAR)
- `round` (INT) - Current Round (1-5)
- `stage` (INT) - Current Stage
- `score` (INT) - Total Points
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

This schema is automatically created by the `backend/schema.sql` file.

---

## 🛑 Admin Control Panel
The Admin Panel is the control center for the event.
- **Access**: Click the distinct "ADMIN" button in the bottom-right corner.
- **Features**:
  - **Live Dashboard**: See current round/stage for all teams.
  - **Game Control**: Force jump teams to specific rounds (e.g., for testing).
  - **Emergency Override**: Reset game, unlock stages.
  - **Logs**: View submission history.

---

## 📂 Project Structure
```
/src
  /components  # Reusable UI widgets (DragDrop, Terminal, etc.)
  /context     # Global State (GameContext)
  /data        # Round-specific Data (Questions, Answers, Variants)
  /screens     # Main Views (Login, Lobby, Game, Admin)
  /services    # API Logic (GameService, SupabaseClient)
/backend       # Express Server (Emails, Auth)
/docs          # Technical Documentation
```

---

_Built for INTELLECT '26. System Status: ONLINE._
