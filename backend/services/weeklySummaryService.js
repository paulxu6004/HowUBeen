/**
 * Weekly Summary Service
 * Generates weekly summaries using AI and schedules cron job
 */

const nodeCron = require('node-cron');
const OpenAI = require('openai');
const { getDatabase } = require('../db/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

/**
 * Generate weekly summary for a user using AI
 * Analyzes check-ins from the week and generates a summary
 */
async function generateWeeklySummary(userId, periodId, weekStartDate, weekEndDate) {
  const db = getDatabase();

  // Fetch all check-ins for the week
  const checkinsQuery = `
    SELECT * FROM checkins 
    WHERE user_id = ? 
    AND date >= ? 
    AND date <= ?
    ORDER BY date ASC
  `;

  return new Promise((resolve, reject) => {
    db.all(checkinsQuery, [userId, weekStartDate, weekEndDate], async (err, checkins) => {
      if (err) {
        return reject(err);
      }

      if (checkins.length === 0) {
        return reject(new Error('No check-ins found for this week'));
      }

      try {
        // Prepare check-ins data for AI
        const checkinsText = checkins.map(ci => {
          const date = new Date(ci.date).toLocaleDateString();
          return `Date: ${date}\nInput: ${ci.raw_input || 'No input'}\nMood: ${ci.mood || ci.emoji || 'N/A'}\nFocus: ${ci.focus_area || 'N/A'}\nAlignment: ${ci.alignment || 'N/A'}`;
        }).join('\n\n---\n\n');

        // Generate summary using GPT
        const prompt = `Analyze the following daily check-ins from a life tracking app and generate a weekly summary.

Week: ${weekStartDate} to ${weekEndDate}

Check-ins:
${checkinsText}

Generate a concise weekly summary paragraph (3-4 sentences) that includes:
1. Overall mood trend (how did mood change over the week?)
2. Dominant focus area (which area was most mentioned/important?)
3. Key takeaways or insights from the week

Write in a supportive, encouraging tone. Be specific about patterns you notice.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful life coach that generates insightful weekly summaries from daily check-ins. Be encouraging and specific.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        });

        const summaryText = response.choices[0].message.content;

        // Store summary in database
        const insertQuery = `
          INSERT INTO weekly_summaries (user_id, period_id, week_start_date, week_end_date, summary_text)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [userId, periodId, weekStartDate, weekEndDate, summaryText], function(err) {
          if (err) {
            return reject(err);
          }

          resolve({
            id: this.lastID,
            userId,
            periodId,
            weekStartDate,
            weekEndDate,
            summaryText,
            message: 'Weekly summary generated successfully'
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Setup cron job to automatically generate weekly summaries
 * Runs every Sunday at 9:00 AM
 * 
 * TODO: Adjust schedule based on your needs
 */
function setupWeeklySummaryCron() {
  // Cron expression: '0 9 * * 0' = Every Sunday at 9:00 AM
  // For testing, you can use '* * * * *' to run every minute (not recommended for production)
  
  nodeCron.schedule('0 9 * * 0', async () => {
    console.log('🔄 Running weekly summary generation...');
    
    try {
      const db = getDatabase();
      const today = new Date();
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - today.getDay()); // Go to last Sunday
      
      const weekStartDate = new Date(lastSunday);
      weekStartDate.setDate(lastSunday.getDate() - 6); // Go back 6 days to get Monday
      
      const weekStartStr = weekStartDate.toISOString().split('T')[0];
      const weekEndStr = lastSunday.toISOString().split('T')[0];

      // Get all active users with periods
      const usersQuery = `SELECT DISTINCT user_id FROM periods WHERE end_date >= ?`;
      
      db.all(usersQuery, [weekStartStr], async (err, users) => {
        if (err) {
          console.error('Error fetching users for weekly summary:', err);
          return;
        }

        for (const user of users) {
          try {
            // Get current active period for user
            const periodQuery = `
              SELECT id FROM periods 
              WHERE user_id = ? 
              AND start_date <= ? 
              AND end_date >= ?
              ORDER BY created_at DESC
              LIMIT 1
            `;

            db.get(periodQuery, [user.user_id, weekEndStr, weekStartStr], async (err, period) => {
              if (err || !period) {
                console.log(`No active period for user ${user.user_id}`);
                return;
              }

              // Check if summary already exists
              const existingQuery = `
                SELECT id FROM weekly_summaries 
                WHERE user_id = ? AND week_start_date = ? AND week_end_date = ?
              `;

              db.get(existingQuery, [user.user_id, weekStartStr, weekEndStr], async (err, existing) => {
                if (existing) {
                  console.log(`Summary already exists for user ${user.user_id}`);
                  return;
                }

                try {
                  await generateWeeklySummary(user.user_id, period.id, weekStartStr, weekEndStr);
                  console.log(`✓ Generated weekly summary for user ${user.user_id}`);
                } catch (summaryError) {
                  console.error(`Error generating summary for user ${user.user_id}:`, summaryError);
                }
              });
            });
          } catch (userError) {
            console.error(`Error processing user ${user.user_id}:`, userError);
          }
        }
      });
    } catch (error) {
      console.error('Weekly summary cron error:', error);
    }
  }, {
    timezone: 'America/Los_Angeles' // Adjust timezone as needed
  });
}

module.exports = {
  generateWeeklySummary,
  setupWeeklySummaryCron
};