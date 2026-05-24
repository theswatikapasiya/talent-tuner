const axios = require("axios");

const BASE_URL = "https://api.github.com/repos";

async function scanDirectory(repoPath, path = "") {

  const url = `${BASE_URL}/${repoPath}/contents/${path}`;

  const response = await axios.get(url);

  let files = [];
  let dependencies = [];

  for (const item of response.data) {

    if (item.type === "file") {

      files.push(item.name);

      // detect dependency files
      if (item.name === "package.json") dependencies.push("node");
      if (item.name === "requirements.txt") dependencies.push("python");
      if (item.name === "pom.xml") dependencies.push("java");
      if (item.name === "Dockerfile") dependencies.push("docker");

    }

    if (item.type === "dir") {

      const sub = await scanDirectory(repoPath, item.path);

      files = files.concat(sub.files);
      dependencies = dependencies.concat(sub.dependencies);

    }

  }

  return { files, dependencies };

}

exports.scanRepository = async (repoPath) => {

  try {

    const result = await scanDirectory(repoPath);

    return result;

  } catch (error) {

    return { files: [], dependencies: [] };

  }

};