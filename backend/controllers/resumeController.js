const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
const ytSearch = require("yt-search");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeResume = async (req, res) => {
  try {
    const { category, role, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    if (!category || !role) {
      return res.status(400).json({ error: "Category and role are required" });
    }

    // Parse PDF text
    const pdfData = await pdfParse(file.buffer);
    const resumeText = pdfData.text;

    // Build the prompt for OpenAI
    const prompt = `
You are an expert AI Resume Analyzer and Technical Recruiter.
Analyze the following resume against the target role.

Target Category: ${category}
Target Role: ${role}
Job Description: ${description || "Not provided"}

Resume Text:
"""
${resumeText}
"""

You must return a JSON object with EXACTLY the following structure (do not include Markdown wrappers like \`\`\`json, just return the raw JSON):
{
  "atsScore": 85, // Number 0-100
  "hiringProbability": 75, // Number 0-100
  "detailedFeedback": [
    "Feedback point 1",
    "Feedback point 2"
  ],
  "improvements": [
    "Improvement suggestion 1",
    "Improvement suggestion 2"
  ],
  "projectUpdates": [
    "Project suggestion 1",
    "Project suggestion 2"
  ],
  "lineByLineAnalysis": [
    { "section": "Experience", "comment": "Comment on experience" }
  ]
}
    `;

    let aiResponseText;
    let analysis;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      aiResponseText = chatCompletion.choices[0].message.content.trim();
      if (aiResponseText.startsWith("\`\`\`json")) {
          aiResponseText = aiResponseText.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
      }
      analysis = JSON.parse(aiResponseText);
    } catch (err) {
      console.warn("OpenAI API failed (quota exceeded or network error). Using advanced custom semantic analysis.", err.message);
      
      // CUSTOM AI ANALYZER
      const lowerText = resumeText.toLowerCase();
      const words = lowerText.match(/\w+/g) || [];
      const wordCount = words.length;

      // 1. Role Keyword Mapping
      const roleKeywords = {
        "Frontend Developer": ["react", "vue", "angular", "javascript", "typescript", "html", "css", "webpack", "responsive", "ui", "ux", "rest api"],
        "Backend Developer": ["node", "python", "java", "ruby", "go", "sql", "mongodb", "postgres", "api", "microservices", "docker", "aws"],
        "Full Stack Developer": ["react", "node", "javascript", "typescript", "sql", "mongodb", "aws", "docker", "api", "frontend", "backend"],
        "Mobile Developer": ["swift", "kotlin", "react native", "flutter", "ios", "android", "mobile", "ui"],
        "Data Scientist": ["python", "r", "sql", "machine learning", "pandas", "numpy", "tensorflow", "pytorch", "statistics", "data analysis", "visualization"],
        "Machine Learning Engineer": ["python", "tensorflow", "pytorch", "deep learning", "nlp", "computer vision", "aws", "docker", "kubernetes", "model deployment"],
        "Data Analyst": ["sql", "excel", "tableau", "power bi", "python", "r", "data visualization", "statistics", "reporting"],
        "AI Engineer": ["python", "pytorch", "tensorflow", "llm", "nlp", "generative ai", "neural networks", "machine learning", "deep learning"],
        "DevOps Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", "linux", "bash"],
        "Cloud Architect": ["aws", "azure", "gcp", "architecture", "microservices", "serverless", "kubernetes", "docker", "security", "networking"],
        "Site Reliability Engineer": ["linux", "python", "go", "kubernetes", "docker", "monitoring", "prometheus", "grafana", "incident response", "terraform"],
        "Security Analyst": ["security", "siem", "wireshark", "network", "firewall", "vulnerability", "incident response", "linux"],
        "Penetration Tester": ["kali", "metasploit", "burp suite", "nmap", "owasp", "penetration testing", "vulnerability", "security"],
        "Security Engineer": ["security", "python", "aws", "iam", "encryption", "firewall", "compliance", "linux", "network"],
        "Product Manager": ["agile", "scrum", "jira", "roadmap", "strategy", "user stories", "stakeholder", "analytics", "market research"],
        "UX/UI Designer": ["figma", "sketch", "adobe xd", "wireframing", "prototyping", "user research", "usability", "ui", "ux", "design thinking"],
        "Product Designer": ["figma", "prototyping", "user research", "interaction design", "visual design", "user testing"]
      };

      const expectedKeywords = roleKeywords[role] || ["software", "development", "team", "project", "communication", "agile"];
      const foundKeywords = expectedKeywords.filter(kw => lowerText.includes(kw));
      const missingKeywords = expectedKeywords.filter(kw => !lowerText.includes(kw));
      const keywordScore = Math.round((foundKeywords.length / expectedKeywords.length) * 100);

      // 2. Section Detection
      const hasExperience = lowerText.includes("experience") || lowerText.includes("work history") || lowerText.includes("employment");
      const hasEducation = lowerText.includes("education") || lowerText.includes("university") || lowerText.includes("degree");
      const hasProjects = lowerText.includes("project") || lowerText.includes("portfolio");
      const hasSkills = lowerText.includes("skill") || lowerText.includes("technologies") || lowerText.includes("core competencies");

      let atsScore = 30; // Base score
      if (hasExperience) atsScore += 15;
      if (hasEducation) atsScore += 10;
      if (hasProjects) atsScore += 10;
      if (hasSkills) atsScore += 10;
      
      // Keyword density contribution (max 25)
      atsScore += Math.floor(keywordScore * 0.25);

      // 3. Job Description Semantic Matching
      let descScore = 0;
      if (description && description.length > 20) {
        const descLower = description.toLowerCase();
        // Extract words longer than 4 chars from description as pseudo-keywords
        const descWords = [...new Set(descLower.match(/\w{5,}/g) || [])];
        const matchedDescWords = descWords.filter(w => lowerText.includes(w));
        descScore = Math.round((matchedDescWords.length / (descWords.length || 1)) * 100);
        atsScore += Math.floor(descScore * 0.15); // contribute up to 15 points
      } else {
        // If no description, give some length-based points
        if (wordCount > 200 && wordCount < 800) atsScore += 10;
      }

      atsScore = Math.min(100, Math.max(0, atsScore));
      
      const hiringProbability = Math.max(0, atsScore - Math.floor(Math.random() * 15) - 5); // Slightly lower than ATS

      // 4. Detailed Feedback Generation
      const detailedFeedback = [];
      detailedFeedback.push(`Overall Keyword Match: Your resume contains ${foundKeywords.length} out of ${expectedKeywords.length} core keywords typical for a ${role}.`);
      
      if (missingKeywords.length > 0) {
        detailedFeedback.push(`CRITICAL MISSING KEYWORDS: Your resume lacks important industry terms like: ${missingKeywords.slice(0, 5).join(", ")}. ATS systems scan for these specifically.`);
      } else {
        detailedFeedback.push("Great job! You have included a strong set of core keywords for this role.");
      }

      if (wordCount < 150) {
        detailedFeedback.push(`Length Issue: Your resume is very short (${wordCount} words). Elaborate on your accomplishments using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).`);
      } else if (wordCount > 1000) {
        detailedFeedback.push(`Length Issue: Your resume is too long (${wordCount} words). Recruiters prefer concise 1-2 page resumes. Focus on relevance.`);
      } else {
        detailedFeedback.push("Resume length is optimal and falls within the standard acceptable word count.");
      }

      if (description) {
        detailedFeedback.push(`Job Description Match: We found approximately ${descScore}% overlap between your resume vocabulary and the job description. ${descScore < 50 ? "You need to heavily tailor your resume to the specific job description." : "You have a solid foundational alignment with the job."}`);
      }

      // 5. Improvements
      const improvements = [];
      if (!hasExperience) improvements.push("Add a dedicated 'Experience' section. Even if you lack professional work, include internships or substantial volunteer work.");
      if (!hasEducation) improvements.push("Add a clear 'Education' section. Include your degree, university, and graduation date.");
      if (!hasProjects) improvements.push("Include a 'Projects' section to demonstrate practical application of your skills.");
      if (!hasSkills) improvements.push("Create a discrete 'Skills' section so ATS parsers can easily extract your technical proficiencies.");
      
      improvements.push("Enhance bullet points with quantifiable metrics (e.g., 'reduced load time by 30%', 'managed a team of 5'). Most resumes lack concrete numbers.");
      if (missingKeywords.length > 0) {
        improvements.push(`Organize your skills section to prominently feature: ${missingKeywords.slice(0, 3).join(", ")} if you have experience with them.`);
      }

      // 6. Project Updates
      const projectUpdates = [];
      if (missingKeywords.length > 0) {
        projectUpdates.push(`Build or update a project that extensively uses **${missingKeywords[0]}**. This is a major gap in your current profile for a ${role}.`);
      }
      projectUpdates.push("Ensure every project listed has a live link or a GitHub repository link.");
      projectUpdates.push("For each project, explicitly list the tech stack used (e.g., 'Tech Stack: React, Node.js, MongoDB').");
      projectUpdates.push("Describe your individual contribution and the final impact of the project, not just what the project is.");

      // 7. Line-by-Line / Section Analysis
      const lineByLineAnalysis = [
        { 
          "section": "Experience / Work History", 
          "comment": hasExperience 
            ? "Experience section detected. Make sure to use strong action verbs (e.g., Developed, Orchestrated, Spearheaded) instead of passive phrasing." 
            : "No formal Experience section detected. This severely impacts ATS parsing." 
        },
        { 
          "section": "Technical Skills", 
          "comment": hasSkills 
            ? `Skills section detected. Keyword alignment is at ${keywordScore}%. Try to incorporate missing keywords smoothly.` 
            : "Missing Skills section. ATS systems rely heavily on a distinct comma-separated skills list." 
        },
        { 
          "section": "Projects & Portfolio", 
          "comment": hasProjects 
            ? "Projects section found. This is excellent for demonstrating practical capabilities. Ensure metrics are visible." 
            : "Missing Projects section. This is critical for tech roles to prove hands-on experience." 
        },
        {
          "section": "Formatting & Readability",
          "comment": `Word count is ${wordCount}. ${wordCount < 200 ? "Too sparse." : wordCount > 800 ? "Too dense." : "Good balance of detail and brevity."}`
        }
      ];

      analysis = {
        atsScore,
        hiringProbability,
        detailedFeedback,
        improvements,
        projectUpdates,
        lineByLineAnalysis
      };
    }

    // Search YouTube for pro tips
    let videos = [];
    try {
      const searchResult = await ytSearch(`${role} interview tips pro resume enhance`);
      videos = searchResult.videos.slice(0, 3).map(v => ({
        title: v.title,
        url: v.url,
        thumbnail: v.thumbnail,
        timestamp: v.timestamp
      }));
    } catch (err) {
      console.warn("YouTube search failed. Skipping videos.", err.message);
    }

    res.json({
      analysis,
      videos
    });

  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: `Failed to analyze resume: ${error.message}` });
  }
};
