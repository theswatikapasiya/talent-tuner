exports.analyzeCode = (files) => {

  const algorithms = new Set();
  const skills = new Set();

  files.forEach(file => {

    const name = file.toLowerCase();

    // Cryptography detection
    if (name.includes("hash")) {
      algorithms.add("Hashing Algorithm");
      skills.add("Cryptography");
    }

    // Blockchain detection
    if (name.includes("blockchain")) {
      algorithms.add("Blockchain Verification");
      skills.add("Distributed Systems");
    }

    // Simulation detection
    if (name.includes("simulate")) {
      algorithms.add("System Simulation");
      skills.add("Simulation Modeling");
    }

    // Visualization
    if (name.includes("visualize")) {
      skills.add("Data Visualization");
    }

    // Performance analysis
    if (name.includes("performance")) {
      skills.add("Performance Evaluation");
    }

  });

  return {
    algorithms: [...algorithms],
    codeSkills: [...skills]
  };

};