# Quick Setup Guide for M-T Growth Gateway

## 🚀 Getting Started

Your project code is all here! Follow these steps to get it running for your presentation.

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** > **API**
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

3. Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### Step 3: Set Up Supabase Database

Your database migrations are in `supabase/migrations/`. If your Supabase project is still active:

1. **Option A: If Supabase project still exists**
   - The migrations should already be applied
   - Just verify your database tables exist

2. **Option B: If you need to recreate**
   - Run migrations manually in Supabase SQL Editor
   - Or use Supabase CLI: `supabase db push`

### Step 4: Set Up Supabase Edge Function (AI Assistant)

The AI Financial Assistant function needs an OpenAI API key:

1. Go to Supabase Dashboard > **Edge Functions**
2. Find `ai-financial-assistant` function
3. Go to **Settings** > **Secrets**
4. Add secret: `OPENAI_API_KEY` = your OpenAI API key

**Note:** The function uses model `gpt-5-mini-2025-08-07` - you may need to update this to a valid model like `gpt-4o-mini` or `gpt-3.5-turbo` if that model doesn't exist.

### Step 5: Run the Application

```bash
npm run dev
```

The app will start at `http://localhost:8080`

## 📋 Project Features

✅ **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
✅ **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
✅ **Features**:
- Public website (home, about, products, branches, contact)
- Staff login and authentication
- Staff dashboard with loan management
- AI Financial Assistant (chat interface)
- Database with loan applications, profiles, user roles

## 🔑 Important Routes

- `/` - Homepage
- `/staff-login` - Staff authentication
- `/staff-dashboard` - Main staff dashboard
- `/staff-dashboard/ask-ai` - AI Financial Assistant

## 🐛 Troubleshooting

### Issue: "Missing environment variables"
- Make sure `.env` file exists with correct Supabase credentials

### Issue: "Cannot connect to Supabase"
- Verify your Supabase project is active
- Check if your project URL and keys are correct
- Ensure your Supabase project hasn't been paused (free tier pauses after inactivity)

### Issue: "AI Assistant not working"
- Check if Edge Function is deployed
- Verify `OPENAI_API_KEY` secret is set in Supabase
- Check browser console for errors
- Update the model name in `supabase/functions/ai-financial-assistant/index.ts` if needed

### Issue: "Database tables missing"
- Run the migration file manually in Supabase SQL Editor
- Or use: `supabase db push` (if you have Supabase CLI)

## 📝 For Your Presentation

**Key Points to Highlight:**
1. ✅ Full-stack application with React frontend
2. ✅ Supabase backend (PostgreSQL + Auth + Edge Functions)
3. ✅ AI-powered financial assistant
4. ✅ Role-based access control (admin, loan_officer, client)
5. ✅ Real-time database operations
6. ✅ Modern UI with shadcn/ui components

## 🚨 Quick Fixes

If the AI model name is wrong, update line 206 and 244 in:
`supabase/functions/ai-financial-assistant/index.ts`

Change `gpt-5-mini-2025-08-07` to `gpt-4o-mini` or `gpt-3.5-turbo`

