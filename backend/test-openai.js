const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const prompt = `
    You are an elite Cyber Security Analyst for an HR platform. Evaluate the authenticity of the candidate based on these scraped inputs:
    GitHub URL: https://github.com/torvalds
    GitHub Name: Linus Torvalds
    Public Repos: 6
    LinkedIn URL: None
    X URL: None
    Recent Repositories: [{"name":"linux","fork":false,"description":"Linux kernel source tree","language":"C"},{"name":"test-tlb","fork":false,"description":"TLB shootdown test","language":"C"}]
    
    Determine if this profile is genuine. Check for red flags.
    Also, provide a detailed mathematical analysis of the GitHub repositories. Evaluate code quality markers, commit frequency signals (based on repo updates), authenticity, and security. Provide detailed improvement suggestions.
    
    Return ONLY a JSON object exactly matching this schema:
    {
      "linkedinGenuine": boolean,
      "githubGenuine": boolean,
      "plagReport": "Detailed paragraph analysis of whether the overall footprint seems copied or authentic.",
      "overallAuthenticity": 90,
      "projectsAnalysis": [
        {
          "name": "linux",
          "url": "https://github.com/torvalds/linux",
          "authenticityScore": 95,
          "securityScore": 80,
          "codeQualityScore": 90,
          "language": "C",
          "securityNotes": "A short, sharp sentence on the security/authenticity posture.",
          "improvementSuggestions": ["suggestion 1", "suggestion 2"]
        }
      ]
    }
    `;
  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    console.log(aiResponse.choices[0].message.content);
  } catch (e) {
    console.error("OpenAI failed:", e.message);
  }
}
run();
