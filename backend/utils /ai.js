// backend/utils/ai.js

// Mock function to "analyze" a check-in
async function extractCheckinData(rawInput) {
  // In reality, you'd call OpenAI GPT here
  return {
    mood: "🙂", // could be based on text sentiment
    focus_area: "Academics", // could detect keywords
    alignment: "On track", // simple mock
    takeaway: rawInput.split('.').slice(0,1).join('.') // first sentence as takeaway
  };
}

// Mock function to generate weekly summary
async function generateWeeklySummary(checkins) {
  if (!checkins || checkins.length === 0) return "No check-ins this week.";

  let summary = "This week, you stayed on track with your goals:\n";

  checkins.forEach((c, i) => {
    summary += `- ${c.date}: Mood=${c.mood}, Focus=${c.focus_area}, Alignment=${c.alignment}\n`;
  });

  return summary;
}

module.exports = { extractCheckinData, generateWeeklySummary };
