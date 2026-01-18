const OpenAI = require("openai");
const fs = require('fs');

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;



if (!client) {
  console.warn("Warning: OPENAI_API_KEY not found. AI features will be disabled.");
}

// Extract check-in data using GPT
async function extractCheckinData(rawInput) {
  if (!rawInput || rawInput.trim() === "") {
    return {
      mood: "😐",
      focus_area: "Unknown",
      alignment: "No data",
      takeaway: "No meaningful input provided."
    };
  }

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

Your job is to analyze the input and return ONLY valid JSON.
Do NOT include any extra text, explanations, or formatting.

Return a JSON object with EXACTLY these fields:
- mood: a single emoji representing the user's emotional state
- focus_area: the primary area they focused on (e.g. Academics, Rugby, Health, Social, Personal)
- alignment: one of ["Off track", "Neutral", "On track"]
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
    return {
      mood: "😐",
      focus_area: "Error",
      alignment: "Unknown",
      takeaway: "Error processing input."
    };
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
Provide a comforting and encouraging summary (max 3 sentences).
Highlight one key positive takeaway.`
        },
        {
          role: "user",
          content: `Here are my check-ins for the week:\n${checkinData}`
        }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "Error generating summary.";
  }
}

module.exports = { extractCheckinData, generateWeeklySummary, transcribeAudio };
