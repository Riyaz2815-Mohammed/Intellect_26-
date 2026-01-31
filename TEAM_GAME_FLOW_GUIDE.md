# 🎮 CODECRYPT: Team Game Flow Guide

This guide explains how the Round Robin sequence system works for managing multiple teams and batches.

## 🔄 Round Sequence Logic
The system automatically assigns a unique round path to each new team to prevent location overcrowding.

**The Rotation Cycle:**
1. **Team 1:** Sequence 1 (SQL -> Physical -> Memory -> Advanced)
2. **Team 2:** Sequence 2 (Physical -> Advanced -> SQL -> Memory)
3. **Team 3:** Sequence 3 (Memory -> SQL -> Advanced -> Physical)
4. **Team 4:** Sequence 4 (Advanced -> Memory -> Physical -> SQL)

...and then it repeats!

## 👥 How to Handle Batches

### **Scenario A: Continuous Flow (Recommended)**
You can simply keep adding teams. The system will automatically handle the distribution.

- **Batch 1:** Create Teams 1-4 (Assigned Seq 1, 2, 3, 4)
- **Batch 2:** Create Teams 5-8 (Assigned Seq 1, 2, 3, 4)
- **Batch 3:** Create Teams 9-12 (Assigned Seq 1, 2, 3, 4)

**Advantage:** You keep all data in the system and the Leaderboard shows everyone.

### **Scenario B: Clear & Restart**
If you want to clear the system for a fresh batch (e.g., Morning vs Afternoon session):

1. Go to **Admin Panel**.
2. **Delete** all existing teams.
3. Start creating new teams for the new batch.
4. The first new team will **automatically start at Sequence 1**.

**Note:** Only do this if you have saved/exported the scores for the previous batch, as deleting is permanent!

## 📋 Admin Panel "Round Key"
Use the legend at the top of the Admin Panel to identify which round corresponds to which number:
- **1:** SQL Basics
- **2:** Physical Access
- **3:** Memory Analysis
- **4:** Advanced Queries

## 🛑 Troubleshooting "Duplicate Sequences"
The system uses the **Last Created Team** to decide the next sequence.
- If you see multiple teams with the same sequence during testing, it's likely because you deleted teams randomly.
- **Solution:** Just keeps creating teams. It will self-correct and rotate to the next available sequence automatically.
