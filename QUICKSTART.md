# Quick Start Guide

Get your Life Tracker app up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

## Step 2: Set Up Environment Variables

1. Copy the example env file:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Edit `backend/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   Get your API key from: https://platform.openai.com/api-keys

## Step 3: Start the Application

**Option A: Run both together** (recommended):
```bash
npm run dev
```

**Option B: Run separately**:

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Step 4: Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Step 5: Test the Flow

1. **Create a Period**: Go to http://localhost:3000/create-period
   - Fill in name, dates, and select up to 3 focus areas
   - Click "Create Period"

2. **Daily Check-in**: Go to http://localhost:3000/checkin
   - Write text or record a voice note (max 30 seconds)
   - Optionally select mood emoji
   - Submit check-in (AI will process it)

3. **View Timeline**: Go to http://localhost:3000/timeline
   - See all your check-ins with AI-extracted labels

4. **Weekly Summary**: Go to http://localhost:3000/weekly-summary
   - View AI-generated weekly summaries (generated every Sunday)

## Troubleshooting

### OpenAI API Errors
- Make sure your API key is correct in `backend/.env`
- Check your OpenAI account has credits
- Verify API key has access to GPT-4o-mini and Whisper

### Database Issues
- Database is auto-created on first server start
- To reset: Delete `backend/data/life_tracker.db`

### Port Already in Use
- Change `PORT` in `backend/.env` if 5000 is taken
- Frontend will auto-detect if 3000 is taken

### Voice Recording Not Working
- Ensure browser has microphone permissions
- HTTPS required for microphone in production
- Try in Chrome/Edge for best compatibility

## Next Steps

- Customize AI prompts in `backend/services/aiService.js`
- Adjust weekly summary schedule in `backend/services/weeklySummaryService.js`
- Add user authentication (currently hardcoded `user1`)
- Deploy to production (Vercel for frontend, Railway/Heroku for backend)

Happy tracking! 🚀
