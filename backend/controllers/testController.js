// Generic dynamic templates to guarantee 15 unique questions per category
const dynamicTemplates = {
  easy: [
    "What is the primary purpose of {tech}?",
    "Which of the following best describes {tech}?",
    "In the context of this domain, what does {tech} solve?",
    "What is the most basic function of {tech}?",
    "How do you initialize a new {tech} project?",
    "What is the default configuration for {tech}?",
    "Which command is commonly used to start {tech}?",
    "What is the main advantage of using {tech}?",
    "Identify the correct syntax for a basic {tech} operation.",
    "What is the core data structure used by {tech}?",
    "Which industry standard relies heavily on {tech}?",
    "What is the most common use case for {tech}?",
    "How does {tech} handle basic input?",
    "What is the simplest way to deploy {tech}?",
    "Which alternative is most similar to {tech}?"
  ],
  medium: [
    "Explain the event loop or lifecycle mechanism inside {tech}.",
    "How does {tech} handle concurrent requests?",
    "What is the time complexity of the core algorithm in {tech}?",
    "How do you securely manage state in {tech}?",
    "Identify the correct syntax for middleware integration in {tech}.",
    "How do you handle error propagation in {tech}?",
    "What is the optimal caching strategy for {tech}?",
    "How do you configure rolling updates for {tech}?",
    "Explain how backpropagation or iterative updating works in {tech}.",
    "What is the main bottleneck when scaling {tech}?",
    "How do you securely manage secrets within {tech}?",
    "What is the recommended approach for testing {tech} components?",
    "How does {tech} detect anomalies or edge cases?",
    "What is the most common architectural pattern used with {tech}?",
    "How do you optimize the initialization phase of {tech}?"
  ],
  hard: [
    "Architect a high-throughput system using {tech}. Which bottleneck occurs first?",
    "How would you optimize memory leaks in a distributed {tech} cluster?",
    "Explain the internal garbage collection heuristics of {tech}.",
    "Design a multi-region failover strategy for {tech}. How is latency minimized?",
    "How does {tech} handle out-of-core memory datasets during intensive operations?",
    "Explain the vanishing gradient or recursive depth problem within {tech}.",
    "How do you mitigate split-brain scenarios in a {tech} environment?",
    "Analyze a polymorphic exploit chain targeting {tech}.",
    "How do you bypass an advanced Web Application Firewall using {tech}?",
    "Explain the internal consensus algorithm used by {tech} nodes.",
    "How do you align stakeholders when implementing a breaking change in {tech}?",
    "What causes a race condition during multi-threaded execution in {tech}?",
    "How do you implement an Envoy sidecar proxy for {tech} traffic routing?",
    "What is the indicator of compromise (IoC) when {tech} is breached?",
    "Measure the statistical significance of an edge case failure in {tech}."
  ]
};

const domainTechs = {
  "Software Engineering": ["React", "Node.js", "Docker", "SQL", "GraphQL", "TypeScript", "Redux", "Express", "Webpack", "Jest", "MongoDB", "Redis", "Kafka", "RabbitMQ", "Nginx"],
  "Data Science & AI": ["TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Keras", "Hadoop", "Spark", "XGBoost", "Matplotlib", "Seaborn", "NLTK", "OpenCV", "SciPy", "Statsmodels"],
  "Cloud & DevOps": ["AWS", "Kubernetes", "Docker", "Terraform", "Ansible", "Jenkins", "Prometheus", "Grafana", "GitLab CI", "CircleCI", "Azure", "GCP", "Vault", "Consul", "ArgoCD"],
  "Cybersecurity": ["Wireshark", "Metasploit", "Nmap", "Burp Suite", "Kali", "Snort", "Splunk", "Nessus", "Aircrack-ng", "John the Ripper", "Hydra", "OWASP ZAP", "Ghidra", "Radare2", "Suricata"],
  "Product & Design": ["Figma", "Jira", "Agile", "Scrum", "User Research", "Prototyping", "A/B Testing", "Sketch", "InVision", "Miro", "Trello", "Asana", "Kanban", "Design Thinking", "Wireframing"]
};

const generateQuestion = (domain, difficulty, index) => {
  const techs = domainTechs[domain] || ["Technology"];
  // Map the index to a specific tech and template to guarantee uniqueness
  const tech = techs[index % techs.length];
  const template = dynamicTemplates[difficulty][index % 15];
  
  const questionText = template.replace(/{tech}/g, tech);

  const correctOption = `Valid functional property of ${tech}`;
  const allOptions = [
    correctOption,
    `Incorrect assumption about ${tech}`,
    `Deprecated legacy feature of ${tech}`,
    `Unrelated domain concept`
  ].sort(() => Math.random() - 0.5);

  return {
    id: `${domain.substring(0,3)}-${difficulty}-${index}`,
    text: questionText,
    options: allOptions,
    correctAnswer: correctOption
  };
};

const prisma = require("../lib/prisma");

// In-memory registry to lock a User ID to a specific device/IP during active testing phases
const activeUserDevices = new Map();

exports.generateTests = async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    const tests = {
      easy: Array.from({ length: 15 }, (_, i) => generateQuestion(domain, "easy", i)),
      medium: Array.from({ length: 15 }, (_, i) => generateQuestion(domain, "medium", i)),
      hard: Array.from({ length: 15 }, (_, i) => generateQuestion(domain, "hard", i))
    };

    res.json({ tests });
  } catch (error) {
    console.error("Test generation error:", error);
    res.status(500).json({ error: "Failed to generate tests" });
  }
};

exports.submitResult = async (req, res) => {
  try {
    const { domain, testCategory, score, timeTaken, status } = req.body;
    const userId = req.user.id;

    // Fetch user to check if banned
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account is banned due to multiple violations." });
    }

    // Check if user already took this exact domain+category test
    const existing = await prisma.testResult.findFirst({
      where: { userId, domain, testCategory, status: "completed" }
    });

    if (existing && status !== "cheated") {
      return res.status(400).json({ error: "You have already completed this test." });
    }

    let warnings = user.warnings;
    let isBanned = user.isBanned;

    if (status === "cheated") {
      warnings += 1;
      if (warnings >= 3) {
        isBanned = true;
      }
      await prisma.user.update({
        where: { id: userId },
        data: { warnings, isBanned }
      });
    }

    const result = await prisma.testResult.create({
      data: {
        userId,
        domain,
        testCategory,
        score,
        timeTaken,
        status
      }
    });

    res.json({
      success: true,
      result,
      warnings,
      isBanned,
      message: status === "cheated" ? "Violation detected. Warning issued." : "Test completed successfully."
    });

  } catch (error) {
    console.error("Result submission error:", error);
    res.status(500).json({ error: "Failed to submit result: " + error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    // Live ranking logic: highest score first, then lowest time taken
    const results = await prisma.testResult.findMany({
      where: { domain, status: "completed" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeTaken: 'asc' }
      ],
      take: 50 // Top 50 live
    });

    // Remove duplicates (only keep user's best score) if needed, but since we restrict to one completed test per category, 
    // users might have 3 results (easy, medium, hard). We can aggregate them.
    
    // Aggregate by user
    const userScores = {};
    results.forEach(r => {
      if (!userScores[r.userId]) {
        userScores[r.userId] = {
          name: r.user.name,
          totalScore: 0,
          totalTime: 0,
          testsCompleted: 0
        };
      }
      userScores[r.userId].totalScore += r.score;
      userScores[r.userId].totalTime += r.timeTaken;
      userScores[r.userId].testsCompleted += 1;
    });

    const leaderboard = Object.values(userScores).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTime - b.totalTime;
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

exports.checkStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isBanned) {
      return res.json({ isBanned: true });
    }

    // Generate a unique fingerprint for this request
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
    const userAgent = req.headers['user-agent'] || 'unknown-agent';
    const deviceFingerprint = `${ip}-${userAgent}`;

    // Check if the user is locked to another device
    if (activeUserDevices.has(userId)) {
      const lockedDevice = activeUserDevices.get(userId);
      // If the fingerprint doesn't match, block the request!
      if (lockedDevice !== deviceFingerprint) {
        return res.status(403).json({ error: "CONCURRENT_DEVICE_DETECTED", message: "This account is currently active on another device. Multi-device testing is strictly prohibited." });
      }
    } else {
      // Lock the user to this device for the duration of the testing session
      activeUserDevices.set(userId, deviceFingerprint);
      
      // Auto-release the device lock after 1 hour to prevent permanent lockouts
      setTimeout(() => {
        if (activeUserDevices.get(userId) === deviceFingerprint) {
          activeUserDevices.delete(userId);
        }
      }, 60 * 60 * 1000);
    }

    res.json({ isBanned: false, warnings: user.warnings });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
};
