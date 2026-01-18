const OpenAI = require("openai");
const fs = require('fs');

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;



if (!client) {
  console.warn("Warning: OPENAI_API_KEY not found. AI features will be disabled.");
}

// Extract check-in data using GPT
async function extractCheckinData(rawInput, goals = []) {
  if (!rawInput || rawInput.trim() === "") {
    return {
      mood: "😐",
      focus_area: "Unknown",
      alignment: "No data",
      takeaway: "No meaningful input provided."
    };
  }

  // Format goals for prompt
  const goalsList = goals.length > 0
    ? goals.map(g => `- ${g.goalName} (${g.focusArea})`).join('\n')
    : "No specific goals set.";

  if (!client) {
    return {
      mood: "😐",
      focus_area: "AI Unavailable",
      alignment: "Unknown",
      takeaway: "AI features disabled (missing API key)."
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an assistant that extracts structured information from a user's daily life check-in.
The user has the following active goals:
${goalsList}

Your job is to analyze the input and return ONLY valid JSON.
Do NOT include any extra text, explanations, or formatting.

Return a JSON object with EXACTLY these fields:
- mood: a single emoji representing the user's emotional state
- focus_area: the primary area they focused on (e.g. Academics, Rugby, Health, Social, Personal)
- alignment: one of ["Off track", "Neutral", "On track"] based on how well their day aligned with their goals.
- takeaway: one concise sentence summarizing the day

Rules:
- If the input is vague or contains little information, make a reasonable guess.
- If no meaningful information is present, set:
  mood = "😐"
  focus_area = "Unknown"
  alignment = "Neutral"
  takeaway = "No meaningful reflection provided."
- The output MUST be valid JSON and nothing else.`
        },
        {
          role: "user",
          content: rawInput
        }
      ],
      temperature: 0.2
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    // Print full error structure to debug
    if (error.response) {
      console.error("AI Error Status:", error.response.status);
      console.error("AI Error Data:", JSON.stringify(error.response.data));
    }

    // Fallback to Mock Data on Error (so app doesn't break)
    console.log("Falling back to Mock AI analysis due to API error.");
    return getMockData(goals);
  }
}

// Transcribe audio using Whisper
async function transcribeAudio(filePath) {
  if (!client) return null;
  try {
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
}

// Generate weekly summary using GPT
async function generateWeeklySummary(checkins) {
  if (!checkins || checkins.length === 0) return "No check-ins this week.";
  if (!client) return "AI Summary unavailable (missing API key).";

  const checkinData = checkins.map(c =>
    `- Date: ${c.date}, Mood: ${c.mood}, Focus: ${c.focus_area}, Alignment: ${c.alignment}, Note: ${c.text_note || 'N/A'}`
  ).join('\n');

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a supportive friend giving a weekly summary of a user's life check-ins.
Analyze the trends in mood, focus areas, and goal alignment.
Return ONLY valid JSON with exactly these three fields:
- wentWell: a short sentence on what went well.
- slipped: a short sentence on challenges or what slipped.
- patterns: a short sentence on observed patterns.
Do not include markdown formatting or explanations.`
        },
        {
          role: "user",
          content: `Here are my check-ins for the week:\n${checkinData}`
        }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    // Strip markdown code blocks if present
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Summary Generation Error:", error);
    // Fallback Mock Summary
    return {
      wentWell: "You've consistently tracked your journey this week.",
      slipped: "We didn't see enough data to find slipping points yet.",
      patterns: "You are building a habit of checking in!"
    };
  }
}

// Helper for Mock Data if API fails
function getMockData(goals) {
  // Pick a random goal to say they aligned with
  const goal = goals.length > 0 ? goals[0] : { goalName: "Daily Life", focusArea: "General" };
  return {
    mood: ["😊", "🙂", "😐"][Math.floor(Math.random() * 3)],
    focus_area: goal.focusArea,
    alignment: "On track",
    takeaway: `You made good progress on ${goal.goalName} today.`
  };
}


module.exports = { extractCheckinData, generateWeeklySummary, transcribeAudio };
