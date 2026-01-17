/**
 * AI Service for processing check-ins
 * - Transcription: Uses OpenAI Whisper for voice notes
 * - Extraction: Uses GPT to extract mood, focus area, alignment, and takeaway
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

/**
 * Transcribe voice note using OpenAI Whisper
 * @param {string} filePath - Path to the voice file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeVoiceNote(filePath) {
  try {
    // Construct full file path
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Voice file not found: ${fullPath}`);
    }

    // Transcribe using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(fullPath),
      model: 'whisper-1',
      language: 'en'
    });

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe voice note');
  }
}

/**
 * Extract insights from check-in text using GPT
 * Returns: mood, focus area, alignment, takeaway
 * 
 * TODO: Fine-tune prompts based on your app's tone and requirements
 */
async function extractCheckInInsights(text) {
  try {
    const prompt = `You are analyzing a daily check-in from a life tracking app. Extract the following information:

Check-in text: "${text}"

Extract:
1. Mood: Choose ONE emoji - 😞 (negative/down), 😐 (neutral), or 🙂 (positive/happy)
2. Focus Area: Choose ONE - "Academics", "Athletics", "Social", "Personal Growth", or "None" if not clear
3. Alignment: Choose ONE - "On track" (making progress toward goals), "Neutral" (status quo), or "Off track" (struggling/regressing)
4. Takeaway: ONE sentence (max 20 words) summarizing a key insight or learning from this check-in

Respond in JSON format only:
{
  "mood": "emoji",
  "focusArea": "area name",
  "alignment": "alignment status",
  "takeaway": "sentence"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency in MVP
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured insights from daily check-ins. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate and normalize response
    const validMoods = ['😞', '😐', '🙂'];
    const validFocusAreas = ['Academics', 'Athletics', 'Social', 'Personal Growth', 'None'];
    const validAlignments = ['On track', 'Neutral', 'Off track'];

    return {
      mood: validMoods.includes(parsed.mood) ? parsed.mood : '😐',
      focusArea: validFocusAreas.includes(parsed.focusArea) ? parsed.focusArea : 'None',
      alignment: validAlignments.includes(parsed.alignment) ? parsed.alignment : 'Neutral',
      takeaway: parsed.takeaway || 'No specific takeaway noted.'
    };
  } catch (error) {
    console.error('AI extraction error:', error);
    // Return defaults if AI fails
    return {
      mood: '😐',
      focusArea: 'None',
      alignment: 'Neutral',
      takeaway: 'Unable to process check-in.'
    };
  }
}

/**
 * Process a check-in (transcribe if voice, then extract insights)
 * @param {string} rawInput - Text input from user
 * @param {string} voiceFilePath - Path to voice file (if voice input)
 * @param {string} inputType - 'text' or 'voice'
 * @returns {Promise<Object>} - { transcribedText, mood, focusArea, alignment, takeaway }
 */
async function processCheckIn(rawInput, voiceFilePath, inputType) {
  let textToAnalyze = rawInput;

  // Step 1: Transcribe if voice note
  if (inputType === 'voice' && voiceFilePath) {
    try {
      const transcribedText = await transcribeVoiceNote(voiceFilePath);
      textToAnalyze = transcribedText;
    } catch (error) {
      console.error('Transcription failed, using raw input:', error);
      // Fall back to raw input if transcription fails
    }
  }

  // Step 2: Extract insights from text
  const insights = await extractCheckInInsights(textToAnalyze);

  return {
    transcribedText: textToAnalyze,
    ...insights
  };
}

module.exports = {
  transcribeVoiceNote,
  extractCheckInInsights,
  processCheckIn
};