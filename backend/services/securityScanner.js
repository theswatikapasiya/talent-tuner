exports.scanSecrets = (files) => {
  const findings = [];

  files.forEach(file => {
    const name = file.toLowerCase();

    if (name.includes("api") && name.includes("key")) {
      findings.push("Possible API key exposure");
    }

    if (name.includes("password")) {
      findings.push("Possible password stored in code");
    }

    if (name.includes("secret")) {
      findings.push("Potential secret key exposure");
    }

    if (name.includes("private")) {
      findings.push("Possible private key file detected");
    }

    if (name.includes(".env")) {
      findings.push("Environment file detected (may contain secrets)");
    }
  });

  let securityScore = 100;
  securityScore -= findings.length * 10;
  if (securityScore < 0) securityScore = 0;

  return {
    findings,
    securityScore
  };
};