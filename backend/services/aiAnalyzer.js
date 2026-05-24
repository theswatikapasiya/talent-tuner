exports.generateAIReport = async (
  languages,
  domains,
  frameworks,
  fileCount,
  readme
) => {

  let complexity = "Beginner";

  if (fileCount > 20) complexity = "Intermediate";
  if (fileCount > 50) complexity = "Advanced";

  const skills = [];
  const strengths = [];
  const improvements = [];

  // detect skills from domains
  if (domains.includes("Blockchain")) {
    skills.push("Blockchain architecture");
    skills.push("Distributed ledger concepts");
  }

  if (domains.includes("Cybersecurity")) {
    skills.push("Security attack simulation");
    skills.push("Threat modelling");
  }

  if (languages.includes("MATLAB")) {
    skills.push("Scientific computing");
    skills.push("Algorithm design");
  }

  // analyze README text
  if (readme && readme.toLowerCase().includes("simulation")) {
    strengths.push("Implements simulation environment");
  }

  if (readme && readme.toLowerCase().includes("visualization")) {
    strengths.push("Includes data visualization");
  }

  // file analysis
  if (fileCount > 10) {
    strengths.push("Project has modular source files");
  }

  // improvement suggestions
  improvements.push("Add architecture diagram");
  improvements.push("Improve README documentation");
  improvements.push("Add experimental dataset");

  const projectType =
    domains.length > 0
      ? `${domains[0]} Project`
      : "Software Project";

  const summary =
    `This repository appears to implement a ${projectType} ` +
    `built using ${languages.join(", ")}. ` +
    `The project contains approximately ${fileCount} source files ` +
    `and demonstrates concepts related to ${domains.join(", ")}.`;

  return {
    projectType,
    summary,
    complexity,
    skills,
    strengths,
    improvements
  };

};