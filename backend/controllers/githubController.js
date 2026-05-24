const securityScanner = require("../services/securityScanner");
const codeAnalyzer = require("../services/codeAnalyzer");
const githubService = require("../services/githubService");
const repoScanner = require("../services/repoScanner");
const skillExtractor = require("../services/skillExtractor");
const qualityAnalyzer = require("../services/repoQualityAnalyzer");
const aiAnalyzer = require("../services/aiAnalyzer");

exports.analyzeRepo = async (req, res) => {

  try {

    const { repoUrl } = req.body;

    const repoPath = repoUrl.replace("https://github.com/", "");

    const repoData = await githubService.getRepoData(repoPath);
    const languages = await githubService.getLanguages(repoPath);
    const readme = await githubService.getReadme(repoPath);

    const scanResult = await repoScanner.scanRepository(repoPath);

    const files = scanResult.files || [];
    const codeInsights = codeAnalyzer.analyzeCode(files);
    const securityReport = securityScanner.scanSecrets(files);
    const dependencies = scanResult.dependencies || [];

    const skillData =
      skillExtractor.extractSkills(languages, dependencies, files, readme);

    const skills = skillData.skills || [];
    const frameworks = skillData.frameworks || [];
    const domains = skillData.domains || [];

    const quality =
      qualityAnalyzer.analyzeRepoQuality(files, readme, dependencies);

    const aiReport = await aiAnalyzer.generateAIReport(
  languages,
  domains,
  frameworks,
  files.length,
  readme
);

    const score =
      quality.qualityScore + (skills.length * 5) + (frameworks.length * 5);

    res.json({
  repo: repoData.name,
  stars: repoData.stargazers_count,
  forks: repoData.forks_count,
  languages,
  dependencies,
  files,
  skills,
  frameworks,
  domains,
  algorithms: codeInsights.algorithms,
  codeSkills: codeInsights.codeSkills,
  quality,
  aiReport,
  security: securityReport,
  score
});

  } catch (error) {

    console.error("Analyzer Error:", error);

    res.status(500).json({
      error: "Repository analysis failed"
    });

  }

};