// Skill extraction engine

exports.extractSkills = (languages, dependencies, files, readme) => {

  const skills = new Set();
  const frameworks = new Set();
  const domains = new Set();

  // Language skills
  languages.forEach(lang => skills.add(lang));

  // Dependency based frameworks
  dependencies.forEach(dep => {

    if (dep.includes("react")) frameworks.add("React");
    if (dep.includes("next")) frameworks.add("Next.js");
    if (dep.includes("express")) frameworks.add("Express");
    if (dep.includes("tensorflow")) frameworks.add("TensorFlow");
    if (dep.includes("pytorch")) frameworks.add("PyTorch");
    if (dep.includes("flask")) frameworks.add("Flask");
    if (dep.includes("django")) frameworks.add("Django");
    if (dep.includes("web3")) frameworks.add("Web3");
    if (dep.includes("solidity")) frameworks.add("Solidity");

  });

  // File based skills
  files.forEach(file => {

    if (file.endsWith(".py")) skills.add("Python");
    if (file.endsWith(".js")) skills.add("JavaScript");
    if (file.endsWith(".ts")) skills.add("TypeScript");
    if (file.endsWith(".sol")) skills.add("Blockchain");
    if (file.endsWith(".m")) skills.add("MATLAB");

  });

  // Domain detection using README
  if (readme.toLowerCase().includes("machine learning")) domains.add("AI / ML");
  if (readme.toLowerCase().includes("blockchain")) domains.add("Blockchain");
  if (readme.toLowerCase().includes("iot")) domains.add("IoT");
  if (readme.toLowerCase().includes("security")) domains.add("Cybersecurity");
  if (readme.toLowerCase().includes("simulation")) domains.add("Scientific Computing");
  if (readme.toLowerCase().includes("blockchain")) domains.add("Blockchain");
if (readme.toLowerCase().includes("security")) domains.add("Cybersecurity");
if (readme.toLowerCase().includes("iot")) domains.add("IoT");
  return {
    skills: Array.from(skills),
    frameworks: Array.from(frameworks),
    domains: Array.from(domains)
  };

};