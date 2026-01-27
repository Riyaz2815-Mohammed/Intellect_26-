# CODECRYPT - Supabase Setup Guide

## Why Supabase?

✅ **No local database needed** - Cloud-hosted PostgreSQL  
✅ **Built-in authentication** - Secure team login  
✅ **Real-time subscriptions** - Live leaderboard updates  
✅ **Auto-generated APIs** - REST and GraphQL  
✅ **Free tier** - Perfect for college events  
✅ **Easy email integration** - Built-in SMTP  

---

## Step 1: Create Supabase Project

### 1.1 Sign Up
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Click "New Project"

### 1.2 Project Settings
- **Name**: `codecrypt-intellect26`
- **Database Password**: Choose a strong password (save it!)
- **Region**: Choose closest to your location
- **Pricing Plan**: Free tier is sufficient

⏱ Wait 2-3 minutes for project to initialize

---

## Step 2: Setup Database Schema

### 2.1 Open SQL Editor
1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**

### 2.2 Run Schema
1. Copy entire content from `database/supabase_schema.sql`
2. Paste into SQL Editor
3. Click **Run** (or press Ctrl+Enter)

✅ You should see: "Success. No rows returned"

### 2.3 Verify Tables
1. Click **Table Editor** (left sidebar)
2. You should see:
   - teams
   - team_progress
   - submissions
   - physical_codes
   - event_config

---

## Step 3: Get API Credentials

### 3.1 Project Settings
1. Click **Settings** (gear icon, left sidebar)
2. Click **API**

### 3.2 Copy Credentials
You'll need:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠ Keep secret!)

---

## Step 4: Configure Email (SMTP)

### 4.1 Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable **Confirm email** (for faster testing)

### 4.2 Custom SMTP (Optional)
For production, use custom SMTP:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure with Gmail:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your_email@gmail.com
   Password: your_app_password
   Sender email: your_email@gmail.com
   Sender name: CODECRYPT - Intellect '26
   ```

---

## Step 5: Update Frontend Configuration

Create `src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Step 6: Install Supabase Client

```bash
cd e:/tmp
npm install @supabase/supabase-js
```

---

## Step 7: Test Connection

Create `src/test-supabase.js`:

```javascript
import { supabase } from './config/supabase'

async function testConnection() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Connection failed:', error)
  } else {
    console.log('✅ Connected! Sample team:', data)
  }
}

testConnection()
```

Run: `node src/test-supabase.js`

---

## Step 8: Update GameContext to Use Supabase

Replace the mock `login` function:

```javascript
import { supabase } from '../config/supabase'

const login = async (id, code) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('team_id', id)
      .eq('access_code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      dispatch({ type: ACTION.SET_ERROR, payload: 'Invalid credentials' })
      return
    }

    dispatch({ 
      type: ACTION.LOGIN, 
      payload: { id: data.team_id, name: data.team_name } 
    })
    
    dispatch({ 
      type: ACTION.START_ROUND, 
      payload: { round: data.current_round } 
    })
  } catch (error) {
    dispatch({ type: ACTION.SET_ERROR, payload: 'Server error' })
  }
}
```

---

## Step 9: Implement Submit Answer with Supabase

```javascript
const submitAnswer = async (answer) => {
  const result = GameService.validateSubmission(state.round, state.stage, answer)

  // Log submission
  await supabase.from('submissions').insert({
    team_id: state.teamId,
    round: state.round,
    stage: state.stage,
    submitted_answer: answer,
    is_correct: result.success,
    points_awarded: result.points || 0,
    error_message: result.message
  })

  if (result.success) {
    // Update team score and progress
    const newScore = state.score + (result.points || 0)
    const nextStage = state.stage + 1

    await supabase
      .from('teams')
      .update({ 
        total_score: newScore, 
        current_stage: nextStage 
      })
      .eq('team_id', state.teamId)

    // Mark stage completed
    await supabase.from('team_progress').upsert({
      team_id: state.teamId,
      round: state.round,
      stage: state.stage,
      status: 'completed',
      completed_at: new Date().toISOString()
    })

    // Round 4: Send email
    if (state.round === 4 && state.stage === 1 && result.triggerEmail) {
      await sendAdvantageEmail(state.teamId)
    }

    dispatch({ type: ACTION.NEXT_STAGE, payload: { points: result.points } })
  } else {
    dispatch({ type: ACTION.SET_ERROR, payload: result.message })
  }
}
```

---

## Step 10: Email Function (Supabase Edge Function)

### Create Edge Function for Email

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login:
```bash
supabase login
```

3. Link project:
```bash
supabase link --project-ref your-project-ref
```

4. Create function:
```bash
supabase functions new send-advantage-email
```

5. Edit `supabase/functions/send-advantage-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { teamId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get team email
  const { data: team } = await supabase
    .from('teams')
    .select('email, team_name')
    .eq('team_id', teamId)
    .single()

  // Generate code
  const code = `INT26-R4-${Math.floor(1000 + Math.random() * 9000)}`

  // Store code
  await supabase.from('physical_codes').upsert({
    team_id: teamId,
    round: 4,
    code: code,
    is_used: false
  })

  // Send email (using Resend or SendGrid)
  const emailHTML = `
    <h1>CODECRYPT - Advantage Code</h1>
    <p>Congratulations, ${team.team_name}!</p>
    <p>You have successfully completed Round 4.</p>
    <h2 style="color: #00ff41;">Your Advantage Code:</h2>
    <h1 style="font-family: monospace; background: #000; color: #00ff41; padding: 20px;">
      ${code}
    </h1>
    <p>Enter this code on the CODECRYPT platform to unlock the final round.</p>
  `

  // Send via Resend (example)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CODECRYPT <noreply@yourdomain.com>',
      to: [team.email],
      subject: 'CODECRYPT – Advantage Code',
      html: emailHTML
    })
  })

  return new Response(JSON.stringify({ success: true, code }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

6. Deploy:
```bash
supabase functions deploy send-advantage-email
```

---

## Step 11: Call Email Function from Frontend

```javascript
async function sendAdvantageEmail(teamId) {
  const { data, error } = await supabase.functions.invoke('send-advantage-email', {
    body: { teamId }
  })
  
  if (error) {
    console.error('Email send failed:', error)
  } else {
    console.log('✅ Email sent successfully')
  }
}
```

---

## Quick Reference

### Supabase Client Operations

```javascript
// SELECT
const { data } = await supabase.from('teams').select('*')

// INSERT
await supabase.from('teams').insert({ team_id: 'TM-001', ... })

// UPDATE
await supabase.from('teams').update({ score: 100 }).eq('team_id', 'TM-001')

// DELETE
await supabase.from('teams').delete().eq('team_id', 'TM-001')

// UPSERT (insert or update)
await supabase.from('teams').upsert({ team_id: 'TM-001', ... })
```

### Real-time Leaderboard

```javascript
const channel = supabase
  .channel('leaderboard')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'teams'
  }, (payload) => {
    console.log('Leaderboard updated!', payload)
    // Refresh leaderboard
  })
  .subscribe()
```

---

## Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key
```

Access in code:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
```

---

## Advantages Over MySQL

| Feature | MySQL (Local) | Supabase |
|---------|---------------|----------|
| Setup Time | 30+ minutes | 5 minutes |
| Hosting | Need server | Cloud (free) |
| Scaling | Manual | Automatic |
| Backups | Manual | Automatic |
| Real-time | Need Socket.io | Built-in |
| Auth | Custom code | Built-in |
| APIs | Build yourself | Auto-generated |

---

## Troubleshooting

### Can't connect to Supabase
- Check project URL and API key
- Verify project is not paused (free tier pauses after 7 days inactivity)
- Check browser console for CORS errors

### RLS blocking queries
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
  ```
- Or use service_role key (backend only!)

### Email not sending
- Check SMTP settings
- Verify email provider credentials
- Check Supabase logs in Dashboard → Logs

---

## Production Checklist

- [ ] Enable RLS on all tables
- [ ] Use service_role key only in Edge Functions
- [ ] Setup custom domain for emails
- [ ] Enable email confirmation (optional)
- [ ] Setup database backups
- [ ] Monitor usage in Dashboard
- [ ] Add rate limiting
- [ ] Test with multiple teams

---

**Status: ✅ Supabase is MUCH easier than MySQL for this use case!**

No local database, no backend server needed, just frontend + Supabase! 🚀
