exports.analyzeRepoQuality = (files, readme, dependencies) => {

  let score = 0;

  if (readme.length > 200) score += 20;
  if (files.length > 10) score += 20;
  if (dependencies.length > 5) score += 20;

  let documentation = readme.length > 100 ? "Good" : "Poor";
  let structure = files.length > 10 ? "Organized" : "Basic";

  return {
    documentation,
    structure,
    qualityScore: score
  };

};