# HowUBeen - Life Tracker / Accountability App

A hackathon MVP for tracking daily progress and staying accountable during life periods.

## Features

- **Life Periods**: Create periods with up to 3 focus areas (Academics, Athletics, Social, Personal Growth)
- **Daily Check-ins**: Submit text or voice notes (max 30 seconds) with optional mood emoji
- **AI Processing**: 
  - Voice transcription using OpenAI Whisper
  - Automatic extraction of mood, focus area, alignment, and takeaways using GPT
- **Weekly Summaries**: AI-generated weekly insights and trends
- **Timeline View**: Visualize all check-ins with AI labels

## Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite
- **AI**: OpenAI (Whisper for transcription, GPT-4o-mini for extraction and summaries)
- **Cron Jobs**: node-cron for weekly summary generation

## Project Structure

```
HowUBeen/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory (pages)
│   ├── components/   # React components (if any)
│   └── package.json
├── backend/          # Express backend API
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic (AI, summaries)
│   ├── db/          # Database setup
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

   Or manually:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Set up environment variables**:

   Create `backend/.env` file:
   ```env
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_PATH=./data/life_tracker.db
   NODE_ENV=development
   ```

3. **Initialize database**:
   ```bash
   cd backend
   npm run init-db
   ```

   (The database will be automatically created on first server start if you skip this)

### Running the Application

**Option 1: Run both frontend and backend together** (recommended):
```bash
npm run dev
```

**Option 2: Run separately**:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Periods
- `POST /api/periods` - Create a new period
- `GET /api/periods/:userId` - Get all periods for a user
- `GET /api/periods/:userId/current` - Get current active period

### Check-ins
- `POST /api/checkins` - Submit a daily check-in (text or voice)
- `GET /api/checkins/:userId` - Get all check-ins for a user
- `GET /api/checkins/:userId/:date` - Get check-in for a specific date

### Timeline
- `GET /api/timeline/:userId` - Get timeline of check-ins
- `GET /api/timeline/:userId/period/:periodId` - Get timeline for a specific period

### Weekly Summaries
- `GET /api/summaries/:userId` - Get all weekly summaries
- `GET /api/summaries/:userId/latest` - Get latest weekly summary
- `POST /api/summaries/generate` - Manually trigger summary generation

## Database Schema

### periods
- id, user_id, name, start_date, end_date, focus_areas (JSON), descriptions (JSON), created_at

### checkins
- id, user_id, period_id, date, raw_input, input_type, emoji, mood, focus_area, alignment, takeaway, voice_file_path, created_at

### weekly_summaries
- id, user_id, period_id, week_start_date, week_end_date, summary_text, created_at

## AI Integration

### Voice Transcription
- Uses OpenAI Whisper API (`whisper-1` model)
- Automatically transcribes voice notes to text

### Check-in Extraction
- Uses GPT-4o-mini for cost efficiency
- Extracts: mood (😞/😐/🙂), focus area, alignment (On track/Neutral/Off track), takeaway

### Weekly Summaries
- Uses GPT-4o-mini to generate summaries
- Analyzes mood trends, dominant focus areas, and key insights
- Automatically runs every Sunday at 9:00 AM (configurable via cron)

### Customizing AI Prompts

Edit the prompts in:
- `backend/services/aiService.js` - Check-in extraction prompt
- `backend/services/weeklySummaryService.js` - Weekly summary prompt

## MVP Notes

- **Authentication**: Currently uses hardcoded `user_id = 'user1'`. Add proper authentication for production.
- **Voice Recording**: Browser-based recording (MediaRecorder API). Ensure HTTPS in production.
- **File Storage**: Voice files stored locally. Consider cloud storage (S3, Firebase) for production.
- **Notifications**: Missed check-in notifications not implemented (optional feature).
- **Error Handling**: Basic error handling. Add more robust error handling for production.

## Development Tips

1. **Testing AI Integration**: 
   - Make sure your OpenAI API key is set correctly
   - Check API usage on [OpenAI Dashboard](https://platform.openai.com/usage)

2. **Cron Jobs**: 
   - Default schedule: Every Sunday at 9 AM
   - For testing, you can modify the cron expression in `backend/services/weeklySummaryService.js`

3. **Database**: 
   - SQLite database file stored in `backend/data/`
   - Delete the database file to reset

## Future Enhancements

- User authentication (JWT, OAuth)
- Multiple users support
- Notification system (email/SMS for missed check-ins)
- Data visualization charts
- Export data functionality
- Mobile app version

## License

MIT

## Hackathon Project

Built for nwHacks26 - Life Tracker / Accountability App MVP
