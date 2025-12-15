# 🚀 QUICK START - Get Running in 5 Minutes

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create .env File
Create a file named `.env` in the root folder with:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key_here
```

**Where to get these:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

## Step 3: Start the App
```bash
npm run dev
```

Visit: http://localhost:8080

## ⚠️ If Supabase Project is Paused/Deleted

If your Supabase project was paused or deleted:

1. **Create a new Supabase project** at https://app.supabase.com
2. **Run the migration**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/20251202101432_remix_migration_from_pg_dump.sql`
   - Paste and run it
3. **Deploy the Edge Function**:
   - Install Supabase CLI: `npm install -g supabase`
   - Login: `supabase login`
   - Link project: `supabase link --project-ref your-project-ref`
   - Deploy function: `supabase functions deploy ai-financial-assistant`
   - Set secret: `supabase secrets set OPENAI_API_KEY=your-openai-key`

## ✅ What's Already Done

- ✅ All frontend code is here
- ✅ Database schema/migrations included
- ✅ AI assistant function code included
- ✅ Fixed OpenAI model name (was incorrect)

## 🎯 For Presentation Demo

**Test Accounts Needed:**
- Create a staff user in Supabase Auth
- Assign role in `user_roles` table (role: 'admin' or 'loan_officer')

**Quick Test:**
1. Visit `/staff-login`
2. Login with staff credentials
3. Go to `/staff-dashboard`
4. Try `/staff-dashboard/ask-ai` for AI assistant

