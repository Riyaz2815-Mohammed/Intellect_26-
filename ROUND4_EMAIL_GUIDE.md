# Round 4 Email Integration - Complete Guide

## ✅ What's Implemented

### 1. **Email Collection on Login**
- Added "TEAM EMAIL" field to login form
- Email is required and validated
- Email stored in game state (`teamEmail`)

### 2. **Automatic Email Sending**
- When team answers all 5 Round 4 questions correctly
- Code is auto-generated: `INT26-R4-XXXX` (random 4 digits)
- Email is "sent" (currently logged to console)
- Code is stored in localStorage for validation

### 3. **Code Validation**
- Team enters code from "email"
- Code is validated against stored code
- Case-insensitive matching
- One-time use per team

### 4. **Admin Panel Helper**
- Shows generated code when in Round 4
- Easy copy-paste for testing
- Console log shows email details

---

## 🎮 How to Test

### Step 1: Login with Email
1. Go to http://localhost:5173
2. Enter:
   - Team ID: `TM-001`
   - Access Code: `test123`
   - Team Email: `your@email.com`
3. Click "Initialize Uplink"

### Step 2: Jump to Round 4
1. Open Admin Panel (bottom-right, always visible)
2. Set Round: `4`, Stage: `1`
3. Click "JUMP TO"

### Step 3: Answer Questions
Answer all 5 questions correctly:
- Q1: `3`
- Q2: `67000`
- Q3: `3`
- Q4: `450`
- Q5: `Engineering`

### Step 4: Check Console
1. Press F12 → Console tab
2. You'll see:
   ```
   📧 EMAIL SENT TO: your@email.com
   🔐 ADVANTAGE CODE: INT26-R4-1234
   👥 TEAM: test123 (TM-001)
   ```

### Step 5: Get Code from Admin Panel
1. Look at Admin Panel (bottom)
2. You'll see a green box with:
   ```
   📧 ROUND 4 CODE:
   INT26-R4-1234
   ```

### Step 6: Enter Code
1. Copy the code
2. Paste into the input field
3. Click "SUBMIT"
4. Round 4 complete!

---

## 🔧 Current Implementation (Testing Mode)

### What Happens Now:
1. ✅ Email is collected on login
2. ✅ Code is generated when questions are correct
3. ✅ Code is logged to console
4. ✅ Code is shown in admin panel
5. ✅ Code is validated when entered
6. ❌ **Email is NOT actually sent** (just logged)

### For Production:
You need to add a backend API endpoint to actually send emails.

---

## 📧 Adding Real SMTP Email Sending

### Option 1: Using Supabase Edge Function (Recommended)

Already documented in `SUPABASE_SETUP.md` - see "Step 10: Email Function"

### Option 2: Using Node.js Backend

Update `backend/server.js` to add this endpoint:

```javascript
const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Add endpoint
app.post('/api/send-advantage-code', async (req, res) => {
    const { teamId, teamEmail, teamName, code } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: teamEmail,
        subject: 'CODECRYPT – Advantage Code',
        html: `
            <h1>CODECRYPT - Advantage Code</h1>
            <p>Congratulations, ${teamName}!</p>
            <p>You have successfully completed Round 4.</p>
            <h2 style="color: #00ff41;">Your Advantage Code:</h2>
            <h1 style="font-family: monospace; background: #000; color: #00ff41; padding: 20px;">
                ${code}
            </h1>
            <p>Enter this code on the CODECRYPT platform to unlock the final round.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, code });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### Option 3: Using Third-Party Service (Easiest)

Use services like:
- **Resend** (https://resend.com) - Modern, developer-friendly
- **SendGrid** (https://sendgrid.com) - Enterprise-grade
- **Mailgun** (https://mailgun.com) - Reliable

Example with Resend:

```javascript
// In EmailService.js
async sendAdvantageCode(teamId, teamEmail, teamName) {
    const code = `INT26-R4-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'CODECRYPT <noreply@yourdomain.com>',
            to: [teamEmail],
            subject: 'CODECRYPT – Advantage Code',
            html: `
                <h1>CODECRYPT - Advantage Code</h1>
                <p>Congratulations, ${teamName}!</p>
                <h2 style="color: #00ff41;">Your Code: ${code}</h2>
            `
        })
    });

    const data = await response.json();
    
    if (data.id) {
        localStorage.setItem(`ROUND4_CODE_${teamId}`, code);
        return { success: true, code };
    } else {
        return { success: false, error: data.message };
    }
}
```

---

## 🎯 Email Template

The email sent to teams will look like this:

```
Subject: CODECRYPT – Advantage Code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CODECRYPT - Intellect '26

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Congratulations, [Team Name]!

You have successfully completed Round 4.

Your Advantage Code:
┌─────────────────┐
│  INT26-R4-1234  │
└─────────────────┘

Enter this code on the CODECRYPT platform 
to unlock the final round.

Good luck!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CODECRYPT Team | Intellect '26
```

---

## 🔐 Security Notes

### Current (Testing):
- ✅ Code is team-specific
- ✅ Code is validated before use
- ✅ Case-insensitive matching
- ⚠️ Code stored in localStorage (client-side)

### Production:
- ✅ Store codes in database (Supabase)
- ✅ Mark code as used after validation
- ✅ Add expiry time (e.g., 30 minutes)
- ✅ Rate limit email sending
- ✅ Log all code generation and validation

---

## 📊 Data Flow

```
Login (with email)
    ↓
State stores: teamId, teamName, teamEmail
    ↓
Round 4: Answer all 5 questions
    ↓
All correct? → EmailService.sendAdvantageCode()
    ↓
Generate code: INT26-R4-XXXX
    ↓
Log to console (testing)
OR
Send via SMTP (production)
    ↓
Store code in localStorage/database
    ↓
Team enters code
    ↓
EmailService.validateCode()
    ↓
Match? → Round 4 complete!
```

---

## 🧪 Testing Checklist

- [ ] Login with email works
- [ ] Email is stored in state
- [ ] Round 4 questions validate correctly
- [ ] Code is generated after all correct answers
- [ ] Code appears in console
- [ ] Code appears in admin panel
- [ ] Code can be copied and pasted
- [ ] Code validation works (correct code)
- [ ] Code validation fails (wrong code)
- [ ] Case-insensitive validation works
- [ ] Round 4 completes after correct code

---

## 🚀 Production Deployment

### Before Event:
1. Choose email service (Resend/SendGrid/Supabase)
2. Get API keys
3. Update `EmailService.js` with real API
4. Test email delivery
5. Check spam folder
6. Verify email template renders correctly

### During Event:
1. Monitor console for email logs
2. Check admin panel for generated codes
3. Have backup codes ready
4. Monitor email delivery rate

---

## 💡 Tips

- **For Testing**: Use your own email to verify the flow
- **For Event**: Use team's actual email addresses
- **Backup Plan**: Admin panel shows code if email fails
- **Console Logs**: Always check console for debugging

---

**Status: ✅ Email collection and code generation implemented!**

Ready for testing! Just add real SMTP for production. 🚀
