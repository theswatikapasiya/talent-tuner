const prisma = require("../lib/prisma");

exports.createProject = async (req, res) => {
  try {
    const { title, githubUrl, techStack, intelligenceScore, securityScore, complexity, aiSummary, domains } = req.body;

    let techStackArray = techStack || [];
    if (typeof techStack === "string") {
      techStackArray = techStack.split(",").map(s => s.trim()).filter(s => s);
    }
    
    let domainsArray = domains || [];
    if (typeof domains === "string") {
      domainsArray = domains.split(",").map(s => s.trim()).filter(s => s);
    }

    const payload = {
      title,
      githubUrl,
      techStack: techStackArray,
      userId: req.user.id,
      intelligenceScore: intelligenceScore || null,
      securityScore: securityScore || null,
      complexity: complexity || null,
      aiSummary: aiSummary || null,
      domains: domainsArray
    };

    const existingProject = await prisma.project.findFirst({
      where: {
        userId: req.user.id,
        githubUrl: githubUrl
      }
    });

    let project;
    if (existingProject) {
      project = await prisma.project.update({
        where: { id: existingProject.id },
        data: payload
      });
    } else {
      project = await prisma.project.create({
        data: payload
      });
    }

    res.status(201).json({
      message: existingProject ? "Intelligence updated successfully" : "Project added successfully",
      project
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {

    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id
      }
    });

    res.json({
      message: "Projects fetched successfully",
      projects
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};