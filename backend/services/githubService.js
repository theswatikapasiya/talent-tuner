const axios = require("axios");

const BASE_URL = "https://api.github.com/repos";

/*
Fetch repository basic information
*/
exports.getRepoData = async (repoPath) => {

  const response = await axios.get(`${BASE_URL}/${repoPath}`);

  return response.data;

};


/*
Fetch repository languages
*/
exports.getLanguages = async (repoPath) => {

  const response = await axios.get(`${BASE_URL}/${repoPath}/languages`);

  return Object.keys(response.data);

};


/*
Fetch README content
*/
exports.getReadme = async (repoPath) => {

  try {

    const response = await axios.get(
      `${BASE_URL}/${repoPath}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3.raw"
        }
      }
    );

    return response.data;

  } catch (error) {

    return "";

  }

};