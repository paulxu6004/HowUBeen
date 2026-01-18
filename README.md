# HowUBeen

HowUBeen is a daily accountability and safety application designed to help users track their well-being and stay aligned with their personal goals. It combines daily check-ins with automated safety monitoring to provide a supportive structure for students and individuals living alone.

## Project Overview

This project was built as an MVP to demonstrate the integration of meaningful AI analysis with practical safety features.

### Core Features

1.  **Safety Monitoring**
    *   **Inactivity Alerts**: The system monitors user activity. If a user fails to check in for 24 hours, a warning email is triggered.
    *   **Emergency Contact Notification**: After 48 hours of inactivity, the system automatically notifies the user's designated emergency contact.

2.  **Daily Accountability**
    *   **Goal Tracking**: Users define up to 3 specific focus areas for a set period.
    *   **Multi-modal Check-ins**: Users can submit daily updates via text or voice.
    *   **Progress Visualization**: A dashboard displays check-in consistency and historical data.

3.  **AI Analysis (Smart Insights)**
    *   **Goal Alignment**: The system analyzes daily entries against the user's specific goals to determine alignment (On Track / Neutral / Off Track).
    *   **Sentiment Analysis**: Extracts mood and key takeaways from unstructured text or voice transcripts.
    *   **Weekly Summaries**: Generates a consolidated report of the week's progress, highlighting patterns and areas for improvement.

## Technical Architecture

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Custom CSS
*   **API Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Server**: Express.js
*   **Database**: SQLite (Relational Data Model)
*   **Scheduling**: node-cron (for background safety checks)
*   **File Handling**: Multer (for audio uploads)

### AI Services
*   **LLM**: OpenAI GPT-4o-mini (Analysis & Summarization)
*   **Audio**: OpenAI Whisper-1 (Speech-to-Text)

## Local Setup

1.  **Prerequisites**
    *   Node.js (v18+)
    *   NPM

2.  **Installation**
    ```bash
    # Install Backend Dependencies
    cd backend
    npm install

    # Install Frontend Dependencies
    cd ../frontend
    npm install
    ```

3.  **Configuration**
    Create a `.env` file in the `backend` directory:
    ```
    PORT=5050
    OPENAI_API_KEY=your_key_here
    ```

4.  **Running the Application**
    *   **Backend**: `npm start` (Runs on port 5050)
    *   **Frontend**: `npm run dev` (Runs on port 5173)

## API Documentation

The backend exposes a RESTful API. Key endpoints include:

*   `POST /api/checkins`: Submit a new check-in (supports multipart/form-data for voice).
*   `GET /api/summary/:userId`: Retrieve AI-generated weekly insights.
*   `POST /api/periods`: Define new goal periods.
*   `GET /api/contacts/:userId`: Manage emergency contacts.

## License

MIT License
