# CODECRYPT Backend Setup Guide

## Prerequisites

1. **MySQL Server** (Already installed)
2. **Node.js** (v16 or higher)
3. **Gmail Account** (for sending emails)

---

## Step 1: Database Setup

### 1.1 Create Database

Open MySQL command line or MySQL Workbench:

```sql
CREATE DATABASE codecrypt;
```

### 1.2 Import Schema

```bash
cd e:/tmp/database
mysql -u root -p codecrypt < schema.sql
```

Or manually:
1. Open MySQL Workbench
2. Connect to your server
3. Open `schema.sql`
4. Execute the script

### 1.3 Verify Tables

```sql
USE codecrypt;
SHOW TABLES;
```

You should see:
- teams
- team_progress
- submissions
- physical_codes
- admin_users
- event_config

---

## Step 2: Email Configuration (Gmail)

### 2.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### 2.2 Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Click "Generate"
4. Copy the 16-character password

### 2.3 Configure Environment
Create `backend/.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codecrypt

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password

PORT=3001
```

---

## Step 3: Install Backend Dependencies

```bash
cd e:/tmp/backend
npm install
```

This installs:
- express (API server)
- mysql2 (MySQL driver)
- nodemailer (Email sending)
- bcrypt (Password hashing)
- cors (Cross-origin requests)
- dotenv (Environment variables)

---

## Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
CODECRYPT Backend running on port 3001
```

---

## Step 5: Test the System

### 5.1 Test Database Connection

Open browser or Postman:
```
GET http://localhost:3001/api/admin/teams
```

Should return sample teams.

### 5.2 Test Team Registration

```bash
POST http://localhost:3001/api/teams/register
Content-Type: application/json

{
  "teamId": "TM-TEST",
  "teamName": "Test Team",
  "email": "test@example.com",
  "accessCode": "test123"
}
```

### 5.3 Check Email

The team should receive a welcome email at the provided address.

---

## Step 6: Update Frontend to Use Backend

Update `src/context/GameContext.jsx`:

```javascript
const API_URL = 'http://localhost:3001/api';

const login = async (id, code) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: id, accessCode: code })
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch({ type: ACTION.LOGIN, payload: { id, name: data.team.name } });
      dispatch({ type: ACTION.START_ROUND, payload: { round: data.team.round } });
    } else {
      dispatch({ type: ACTION.SET_ERROR, payload: data.error });
    }
  } catch (error) {
    dispatch({ type: ACTION.SET_ERROR, payload: 'Server connection failed' });
  }
};
```

---

## Database Schema Overview

### Teams Table
- `team_id`: Unique identifier (TM-001, TM-002, etc.)
- `team_name`: Team display name
- `email`: For sending credentials and updates
- `access_code`: Login password
- `current_round`, `current_stage`: Progress tracking
- `total_score`: Points accumulated

### Physical Codes Table
- Auto-generated unique codes for each team
- Round 1 code (for location pickup)
- Round 3 code (for final verification)
- Tracks if code has been used

### Submissions Table
- Logs every answer attempt
- Tracks correct/incorrect submissions
- Stores error messages for debugging

---

## Email Templates

### Welcome Email (Sent on Registration)
- Team credentials
- Event details
- Login instructions

### Round Completion Email (Optional)
- Congratulations message
- Next round instructions
- Current leaderboard position

### Physical Code Email (Optional)
- Sent when team reaches location reveal
- Contains the code they need to find physically

---

## Admin Features

### View Leaderboard
```
GET http://localhost:3001/api/admin/leaderboard
```

### View All Teams
```
GET http://localhost:3001/api/admin/teams
```

### Override Team State (Emergency)
```
POST http://localhost:3001/api/admin/override
{
  "teamId": "TM-001",
  "round": 2,
  "stage": 1,
  "score": 100
}
```

---

## Production Deployment

### 1. Update Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_db_host
FRONTEND_URL=https://your-domain.com
```

### 2. Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start server.js --name codecrypt-backend
pm2 save
pm2 startup
```

### 3. Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.yourdom ain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Email Not Sending
1. Check Gmail App Password is correct
2. Verify 2FA is enabled
3. Check firewall/antivirus blocking port 587
4. Try alternative email service (Outlook, SendGrid)

### Database Connection Failed
1. Verify MySQL is running: `mysql -u root -p`
2. Check credentials in `.env`
3. Ensure database `codecrypt` exists
4. Check user permissions

### CORS Errors
1. Verify `FRONTEND_URL` in `.env`
2. Check backend is running on port 3001
3. Update CORS configuration in `server.js`

---

## Security Checklist

✅ Change default admin password
✅ Use strong JWT secret
✅ Enable HTTPS in production
✅ Sanitize all user inputs
✅ Rate limit API endpoints
✅ Use prepared statements (already done)
✅ Keep dependencies updated

---

## Support

For issues:
1. Check console logs: `npm run dev`
2. Check MySQL logs
3. Verify email configuration
4. Test with sample data first

Good luck with Intellect '26! 🚀
