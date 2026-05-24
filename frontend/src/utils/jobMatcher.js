/**
 * Rule-based Job Matching Engine
 * 
 * Future Scalability: When backend AI is ready, this entire file can be deprecated 
 * and replaced by an API call to `/api/ai/match` without needing to change the UI components.
 */

export const calculateJobCompatibility = (userProjects, jobRequiredSkills) => {
  // 1. Safe Fallbacks for missing data
  if (!jobRequiredSkills || (typeof jobRequiredSkills !== "string" && !Array.isArray(jobRequiredSkills))) {
    return { score: 0, matched: [], missing: [], recommendations: ["Job missing specific skill requirements."] };
  }

  let requiredArray = [];
  if (Array.isArray(jobRequiredSkills)) {
    requiredArray = jobRequiredSkills.filter(s => s);
  } else {
    requiredArray = jobRequiredSkills.split(",").map(s => s.trim()).filter(s => s);
  }

  if (requiredArray.length === 0) {
    return { score: 100, matched: [], missing: [], recommendations: ["No specific skills required. Open to all."] };
  }

  if (!userProjects || userProjects.length === 0) {
    return { 
      score: 0, 
      matched: [], 
      missing: requiredArray, 
      recommendations: ["Upload projects to unlock compatibility scoring."] 
    };
  }

  // 2. Aggregate Developer Skills from Projects
  const userSkillSet = new Set();
  userProjects.forEach(project => {
    if (project.techStack) {
      if (Array.isArray(project.techStack)) {
        project.techStack.forEach(skill => userSkillSet.add(skill.trim().toLowerCase()));
      } else if (typeof project.techStack === "string") {
        project.techStack.split(",").forEach(skill => {
          userSkillSet.add(skill.trim().toLowerCase());
        });
      }
    }
  });

  // 3. Process Overlap
  const matched = [];
  const missing = [];

  requiredArray.forEach(reqSkill => {
    if (userSkillSet.has(reqSkill.toLowerCase())) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  // 4. Calculate Score
  const score = Math.round((matched.length / requiredArray.length) * 100);

  // 5. Generate Rule-Based AI Recommendations
  const recommendations = [];
  if (score >= 80) {
    recommendations.push("🔥 Strong technical alignment detected.");
  } else if (score >= 50) {
    recommendations.push("⚡ Moderate match. Upskilling recommended.");
  } else {
    recommendations.push("⚠️ Low compatibility based on current portfolio.");
  }

  // Contextual Insights based on missing keywords
  const missingLower = missing.map(m => m.toLowerCase());
  
  if (missingLower.some(m => ["react", "vue", "angular", "frontend", "html", "css"].includes(m))) {
    recommendations.push("Focus on frontend frameworks.");
  }
  if (missingLower.some(m => ["node", "express", "django", "spring", "backend", "python", "java", "php"].includes(m))) {
    recommendations.push("Missing backend architecture skills.");
  }
  if (missingLower.some(m => ["sql", "postgres", "mongodb", "database", "mysql"].includes(m))) {
    recommendations.push("Database experience required.");
  }
  if (missingLower.some(m => ["aws", "docker", "kubernetes", "cloud", "azure"].includes(m))) {
    recommendations.push("Cloud deployment/DevOps skills needed.");
  }
  if (missingLower.some(m => ["blockchain", "solidity", "web3", "smart contracts"].includes(m))) {
    recommendations.push("Web3 / Blockchain experience detected as gap.");
  }

  return { score, matched, missing, recommendations };
};
