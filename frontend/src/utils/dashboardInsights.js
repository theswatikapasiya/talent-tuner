import { calculateJobCompatibility } from "./jobMatcher";

export const generateDashboardInsights = (projects, jobs) => {
  // 1. Profile Overview Metrics
  const totalProjects = projects ? projects.length : 0;
  const skillFrequency = {};
  
  if (projects) {
    projects.forEach(p => {
      if (p.techStack && typeof p.techStack === 'string') {
        const skills = p.techStack.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
        skills.forEach(s => {
          skillFrequency[s] = (skillFrequency[s] || 0) + 1;
        });
      }
    });
  }

  const sortedSkills = Object.entries(skillFrequency).sort((a, b) => b[1] - a[1]);
  const strongestSkills = sortedSkills.slice(0, 4).map(s => s[0]);
  
  // Calculate a mock diversity score based on unique skills vs total projects
  const uniqueSkillsCount = Object.keys(skillFrequency).length;
  const diversityScore = totalProjects > 0 ? Math.min(Math.round((uniqueSkillsCount / (totalProjects * 2)) * 100), 100) : 0;

  // 2. Career Intelligence Metrics
  let topJobs = [];
  let avgCompatibility = 0;
  const missingSkillFreq = {};

  if (jobs && jobs.length > 0 && totalProjects > 0) {
    const scoredJobs = jobs.map(job => {
      const match = calculateJobCompatibility(projects, job.requiredSkills);
      
      // Track missing skills for market trends
      match.missing.forEach(m => {
        const mLower = m.toLowerCase();
        missingSkillFreq[mLower] = (missingSkillFreq[mLower] || 0) + 1;
      });
      
      return { ...job, matchScore: match.score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    topJobs = scoredJobs.slice(0, 3);
    
    const totalScore = scoredJobs.reduce((sum, j) => sum + j.matchScore, 0);
    avgCompatibility = Math.round(totalScore / scoredJobs.length);
  }

  const sortedMissing = Object.entries(missingSkillFreq).sort((a, b) => b[1] - a[1]);
  const missingTrends = sortedMissing.slice(0, 4).map(s => s[0]);

  // 3. Deterministic AI Insights Generator
  const insights = [];
  if (totalProjects === 0) {
    insights.push("Upload your development projects to unlock deep AI intelligence.");
  } else {
    // Domain inference
    if (strongestSkills.some(s => ["react", "vue", "angular", "html", "css", "javascript", "tailwind"].includes(s))) {
      insights.push("Frontend development appears to be your strongest technical area.");
    }
    if (strongestSkills.some(s => ["node", "python", "java", "django", "express", "c++", "go"].includes(s))) {
      insights.push("Strong backend foundation detected in your portfolio.");
    }
    if (strongestSkills.some(s => ["solidity", "web3", "blockchain", "ethereum", "rust"].includes(s))) {
      insights.push("High-value Web3 and Blockchain repositories detected.");
    }
    
    // Gap analysis
    if (missingTrends.some(s => ["aws", "docker", "kubernetes", "ci/cd", "cloud", "azure", "gcp"].includes(s))) {
      insights.push("Backend deployment and DevOps skills are trending in the market. Consider upskilling.");
    }
    
    // Performance alignment
    if (avgCompatibility < 50 && totalProjects > 0 && jobs?.length > 0) {
      insights.push("Current portfolio has low alignment with current job postings. Review the missing skills trends.");
    } else if (avgCompatibility >= 75) {
      insights.push("Excellent market alignment. Your profile is highly competitive for current roles.");
    }
  }

  if (insights.length === 0) {
    insights.push("Keep building and adding projects to generate more specific intelligence insights.");
  }

  return {
    profile: {
      totalProjects,
      strongestSkills,
      diversityScore
    },
    career: {
      topJobs,
      avgCompatibility,
      missingTrends
    },
    insights
  };
};
