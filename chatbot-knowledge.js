// ============================================================
//  Prosen's AI — Structured Knowledge Base
//  Source: Prosenjit Mondol's portfolio & CV
//  IMPORTANT: Never invent facts. All data verified from portfolio.
// ============================================================

const PROSENJIT_KB = {

  // ── IDENTITY ──────────────────────────────────────────────
  identity: {
    name: "Prosenjit Mondol",
    nickname: "Prosen",
    title: "B.Sc. CSE Student & Research Assistant",
    affiliation: "Patuakhali Science & Technology University (PSTU), Bangladesh",
    labAffiliation: "Computation Informatics & Machine Intelligence Lab (CIMILab), University of Missouri, USA",
    labRole: "Research Assistant & Lab Systems Coordinator (Remote)",
    email: "prosenjit1156@gmail.com",
    phone: "+880 1315747034",
    portfolioUrl: "https://pronad1.github.io/Personal-Portfolio/",
    bio: `Prosenjit Mondol is a B.Sc. Computer Science and Engineering student at Patuakhali Science & Technology University (PSTU), Bangladesh, currently on the Dean's List with a CGPA of 3.656/4.00. He serves as a Research Assistant & Lab Systems Coordinator at the Computation Informatics & Machine Intelligence Lab (CIMILab), University of Missouri, USA (Remote), where he works on next-generation machine intelligence and computational systems for data-driven insights, intelligent decision-making, and real-world impact.`,
    openTo: "Research collaborations and opportunities in AI in Health, Health Informatics, HCI, Machine Learning, Image Processing, Computer Vision, and related areas.",
  },

  // ── RESEARCH INTERESTS ────────────────────────────────────
  researchInterests: [
    "AI in Health",
    "Health Informatics",
    "Computer Vision",
    "Medical Image Analysis",
    "Image Processing",
    "Machine Learning",
    "Human-Computer Interaction (HCI)",
    "Data Science",
    "Spinal Lesion Detection",
    "Stroke Lesion Segmentation",
    "Deep Learning for Medical Imaging",
    "Principled frameworks combining theoretical guarantees with practical applicability",
    "Trustworthy decision-making under distribution shift and model uncertainty",
  ],

  // ── EDUCATION ─────────────────────────────────────────────
  education: [
    {
      degree: "B.Sc. in Computer Science and Engineering",
      institution: "Patuakhali Science & Technology University (PSTU)",
      institutionUrl: "https://pstu.ac.bd",
      location: "Patuakhali, Bangladesh",
      period: "February 2023 – Present",
      creditsCompleted: "126.5 / 165",
      cgpa: "3.656 / 4.00",
      honor: "Dean's List",
    },
    {
      degree: "Higher Secondary Certificate (HSC) — Science",
      institution: "Naogaon Govt. College",
      location: "Naogaon, Bangladesh",
      period: "2019 – 2021",
      gpa: "5.00 / 5.00",
    },
    {
      degree: "Secondary School Certificate (SSC) — Science",
      institution: "Chakatitha High School",
      location: "Bangladesh",
      period: "2017 – 2019",
      gpa: "5.00 / 5.00",
    },
  ],

  // ── EXPERIENCE ────────────────────────────────────────────
  experience: [
    {
      role: "Research Assistant & Lab Systems Coordinator",
      organization: "Computation Informatics & Machine Intelligence Lab (CIMILab)",
      orgUrl: "https://pronad1.github.io/CIMILab/index.html",
      location: "University of Missouri, USA (Remote)",
      period: "August 2025 – Present",
      description: "Working on next-generation machine intelligence and computational systems for data-driven insights, intelligent decision-making, and real-world impact. Contributing to research in AI in Health, Medical Image Analysis, and computational informatics.",
    },
  ],

  // ── PUBLICATIONS ──────────────────────────────────────────
  publications: [
    {
      id: 1,
      title: "A Deep Learning Approach to Bangla License Plate Text Extraction using Easy OCR",
      venue: "International Conference on Power, Electronics, Communications, Computing, and Intelligent Infrastructure (ICPECCII 2026)",
      status: "Published",
      publisher: "IEEE Xplore (2026)",
      url: "https://ieeexplore.ieee.org/document/11662050",
      authorPosition: "Co-author",
      notes: "Published on IEEE Xplore in 2026. Presented at ICPECCII 2026.",
    },
    {
      id: 2,
      title: "A Sensitivity-Gated Cascade for Compute-Efficient Spinal Lesion Detection in Resource-Constrained Settings",
      venue: "3rd Medical Image Computing in Resource-Constrained Settings Workshop & Knowledge Interchange (MIRASOL), MICCAI 2026, Strasbourg, France",
      status: "Physically Presented",
      authorPosition: "First Author (2026)",
      posterUrl: "acheivement/[Prosenjit Mondol]_[74]_[MIRASOL]_poster.pdf",
      notes: "Physically presented at MICCAI 2026 in Strasbourg, France, through the MICCAI Ambassador Program. Prof. Dr. Pamela Guevara personally carried and presented our poster at the on-site poster session. This is a landmark achievement for Prosenjit as an undergraduate researcher.",
      openreviewUrl: "https://openreview.net/profile?id=%7EProsenjit_Mondol1",
    },
    {
      id: 3,
      title: "DSANet: A Grid-Search Optimized Heterogeneous Ensemble for Ischemic Stroke Lesion Segmentation",
      venue: "14th International Conference on Electrical and Computer Engineering (ICECE 2026), BUET, Dhaka, Bangladesh",
      status: "Under Review",
      authorPosition: "First Author (2026)",
      notes: "Submitted to ICECE 2026 at BUET. Currently under review as of November 2026.",
    },
  ],

  // ── PROJECTS ──────────────────────────────────────────────
  projects: [
    {
      name: "NeuroVision AI",
      icon: "🧠",
      description: "A cutting-edge medical imaging platform for diagnosing neurological and cardiovascular conditions using advanced deep learning. Integrates brain, spine, heart, and chest imaging pipelines with lesion detection, segmentation, Grad-CAM explainability, and enterprise-grade security.",
      tags: ["PyTorch", "Deep Learning", "Medical AI", "Grad-CAM"],
      githubUrl: "https://github.com/pronad1/NeuroVision",
      awards: "First Prize at PSTU IT Carnival 2025",
    },
    {
      name: "TrashBot",
      icon: "🤖",
      description: "AI-powered smart waste management system using Raspberry Pi 3B, computer vision, and IoT. Features YOLO-based real-time waste detection, deep learning classification, live web monitoring, and remote tracking for smart city applications.",
      tags: ["YOLO", "IoT", "Raspberry Pi", "OpenCV"],
      githubUrl: "https://github.com/pronad1/TrashBot",
      demoUrl: "https://youtube.com/shorts/o1WTMZHI7-w",
    },
    {
      name: "ReuseHub",
      icon: "♻️",
      description: "Community-driven sustainability platform built with Flutter 3.x and Firebase. Connects donors with seekers of reusable goods, facilitating a circular economy and reducing waste at a production-ready scale.",
      tags: ["Flutter", "Firebase", "Dart", "Mobile"],
      githubUrl: "https://github.com/pronad1/Flutter/tree/main/software",
      demoUrl: "https://youtu.be/6uswFRk_Srs",
    },
    {
      name: "Graph Craft",
      icon: "🕸️",
      description: "Web-based tool for visualizing and analyzing graphs interactively. Users input adjacency matrices and instantly see graph visualizations alongside analysis results including traversals and shortest paths.",
      tags: ["JavaScript", "Algorithms", "Data Structures", "Web"],
      githubUrl: "https://github.com/pronad1/Graph-Visualizations",
      liveUrl: "https://pronad1.github.io/Graph-Visualizations/",
    },
    {
      name: "Smart Vacuum Cleaner",
      icon: "🧹",
      description: "Autonomous floor-cleaning robot built on Arduino UNO. Uses ultrasonic sensors for obstacle detection and avoidance, enabling fully automated navigation and floor cleaning without human intervention.",
      tags: ["Arduino", "Robotics", "IoT", "Sensors"],
      githubUrl: "https://github.com/Prosenjit-Mondol/Ardiuno_UNO_Project",
      demoUrl: "https://www.youtube.com/watch?v=nY7cTv8nreg",
    },
    {
      name: "Job Portal",
      icon: "💼",
      description: "Dynamic job portal connecting job seekers with employers. Features job posting, user authentication, application management, and advanced search functionality using PHP, MySQL, HTML, and JavaScript.",
      tags: ["PHP", "MySQL", "Laravel", "Web"],
      githubUrl: "https://github.com/pronad1/Web-Project",
    },
    {
      name: "Blood Bank Project",
      icon: "🩸",
      description: "Java-based Blood Bank Management System designed to manage and streamline the process of blood donation and distribution. Maintains donor records, blood inventory, and blood requests from hospitals and healthcare institutions.",
      tags: ["Java", "OOP", "Management System", "Healthcare"],
      githubUrl: "https://github.com/pronad1/Blood_Bank_Project",
    },
  ],

  // ── TECHNICAL SKILLS ──────────────────────────────────────
  skills: {
    languages: ["Python", "C++", "R", "Java", "JavaScript", "PHP", "C#", "Dart", "C", "HTML/CSS"],
    mlFrameworks: ["PyTorch", "TensorFlow", "Keras", "Scikit-learn", "OpenCV", "Pandas", "NumPy"],
    visualization: ["Matplotlib", "Seaborn", "Plotly"],
    databases: ["MySQL", "Oracle", "SQL Server", "Firebase"],
    backendMobile: ["Laravel", "Flutter", ".NET", "REST APIs"],
    tools: ["Git", "LaTeX", "Jupyter", "VS Code", "Android Studio", "Kaggle", "Raspberry Pi", "Arduino"],
  },

  // ── AWARDS & HONOURS ──────────────────────────────────────
  awards: [
    {
      title: "PSTU Dean's Merit Award",
      description: "Awarded for academic excellence — ranked among the top students in a cohort of 84 at Patuakhali Science & Technology University.",
    },
    {
      title: "Rank #1 — Global Live Leaderboard, Glucose Prediction Challenge",
      description: "Secured Rank #1 on the Global Live Leaderboard in the Glucose Prediction Challenge (MetaboNet Consortium — Stanford, Harvard, UCSB, Pavia, etc.) with team team02w. (Sep 2026)",
      leaderboardUrl: "https://metabonetglucose-leaderboard.hf.space/",
      challengeUrl: "https://metabo-net.org/glucose-prediction-challenge",
    },
    {
      title: "First Prize — PSTU IT Carnival (NeuroVision AI Project)",
      description: "Won First Prize at PSTU IT Carnival 2025 for the NeuroVision AI medical imaging project.",
    },
    {
      title: "Aungkur Scholarship — PSTU",
      description: "Merit-based scholarship awarded by Patuakhali Science & Technology University to outstanding students demonstrating exceptional academic performance.",
    },
    {
      title: "Grameen Bank Scholarship",
      description: "Scholarship awarded by Grameen Bank in recognition of outstanding SSC (2019) results.",
    },
    {
      title: "MOUSUMI NGO Scholarship",
      description: "Scholarship awarded by MOUSUMI NGO in recognition of outstanding HSC (2021) results.",
    },
    {
      title: "Government Board Merit Scholarship (HSC & SSC)",
      description: "Government merit scholarships for outstanding results in both HSC (2021) and SSC (2019) examinations.",
    },
    {
      title: "PSTU Programming Contest — Top 5",
      description: "Ranked in the top 5 out of 50 teams at the PSTU Programming Contest 2025.",
    },
    {
      title: "ICPC 2023 Asia Dhaka Preliminary — Honourable Mention",
      description: "Received Honourable Mention at the ICPC 2023 Asia Dhaka Preliminary contest.",
    },
  ],

  // ── COMPETITIVE PROGRAMMING ───────────────────────────────
  competitiveProgramming: {
    problemsSolved: "1,500+",
    platforms: [
      { name: "Codeforces", handle: "prosenjit_mondol", url: "https://codeforces.com/profile/prosenjit_mondol" },
      { name: "HackerRank", handle: "prosenjit1156", url: "https://www.hackerrank.com/profile/prosenjit1156" },
      { name: "LeetCode", handle: "prosenjit_mondol", url: "https://leetcode.com/u/prosenjit_mondol/" },
      { name: "Beecrowd", handle: "Prosenjit", url: "https://judge.beecrowd.com/en/profile/793803" },
    ],
    contests: [
      "ICPC Dhaka Regional Preliminary (2023–2025)",
      "BitFest KUET (2024)",
      "PSTU IT Carnival Hackathon (2026)",
    ],
    nasaSpaceApps: {
      event: "NASA Space Apps Challenge 2025",
      team: "PSTU_CLITECH",
      role: "Programmer / Lead Developer",
      location: "Local Event: Barisal",
      project: "Clitech — an intelligent weather risk intelligence app that transforms real-time NASA Earth Observation satellite data into personalized, actionable guidance for outdoor activities.",
      challengeTrack: "\"Will It Rain On My Parade?\" — Earth Science Division",
    },
  },

  // ── CERTIFICATES ──────────────────────────────────────────
  certificates: [
    "MICCAI 2026 (MIRASOL Workshop) — Research Presentation Poster",
    "ICPC 2023 Asia Dhaka Preliminary — Honourable Mention",
    "ICPC Recommended Certificate",
    "AI Oracle Certificate",
    "CISCO — Introduction to Modern AI",
    "CISCO — Packet Tracer Learner Transcript",
    "MySQL Certificate",
    "Modern AI Certificate",
    "Flutter Development Certificate",
    "AutoCAD Certificate",
    "Communication Certificate",
    "Cyber Security Introduction Certificate",
    "Data Science Certificate",
    "Microsoft Edge Certificate",
    "JavaScript Intermediate — HackerRank",
    "Microsoft Azure Certificate",
    "Problem Solving Intermediate — HackerRank",
  ],

  // ── COURSEWORK ────────────────────────────────────────────
  coursework: {
    computerScience: [
      "Data Structure & Algorithms", "Artificial Intelligence", "Software Engineering",
      "Database Systems", "Compiler Design & Automata", "Algorithm Engineering",
      "Data Warehousing & Mining", "Numerical Methods", "Discrete Mathematics", "VLSI Design",
    ],
    signalNetworks: [
      "Data Communication Engineering", "Optical Fiber Communication",
      "Computer Networks", "Network Routing & Switching",
    ],
    mathematics: [
      "Differential & Integral Calculus", "Co-ordinate Geometry & Linear Algebra",
      "Statistics", "Vector Analysis & Complex Variables", "ODE & PDE",
    ],
    electricalElectronics: [
      "Basic Electrical Engineering", "Digital Logic Design",
      "Microprocessor & Interfacing", "Electrical Technology",
    ],
  },

  // ── VOLUNTEERING ──────────────────────────────────────────
  volunteering: [
    {
      org: "Badhon",
      role: "Voluntary Blood Donor",
      period: "Feb 2023 – Present",
      description: "Badhon is Bangladesh's largest voluntary blood donation organization. Actively contributes to saving lives by responding to emergency blood needs in hospitals.",
    },
    {
      org: "CSE Club, PSTU",
      role: "Member",
      period: "Jan 2023 – Present",
      description: "Active member of the CSE Club at PSTU, working to foster a culture of technology, innovation, and collaborative learning. Participates in organizing tech events, workshops, and programming contests.",
    },
    {
      org: "YouthMappers PSTU Chapter",
      role: "Head of Media & IT",
      period: "PSTU Campus",
      description: "YouthMappers is a global university network dedicated to open mapping for humanitarian impact. As Head of Media & IT for the PSTU Chapter, oversees digital communication and content creation.",
    },
  ],

  // ── PROFILE LINKS ─────────────────────────────────────────
  profiles: {
    github: { label: "GitHub", url: "https://github.com/pronad1", handle: "pronad1" },
    linkedin: { label: "LinkedIn", url: "https://www.linkedin.com/in/prosenjit-mondol-615342266/", handle: "prosenjit-mondol" },
    kaggle: { label: "Kaggle", url: "https://www.kaggle.com/prosenjitmondol", handle: "prosenjitmondol" },
    huggingface: { label: "Hugging Face", url: "https://huggingface.co/prosenjit1156", handle: "prosenjit1156" },
    researchgate: { label: "ResearchGate", url: "https://www.researchgate.net/profile/Prosenjit-Mondol-2", handle: "Prosenjit-Mondol-2" },
    orcid: { label: "ORCID", url: "https://orcid.org/0009-0009-4827-4768", id: "0009-0009-4827-4768" },
    googleScholar: { label: "Google Scholar", url: "https://scholar.google.com/citations?user=hidSpYcAAAAJ&hl=en", id: "hidSpYcAAAAJ" },
    openreview: { label: "OpenReview", url: "https://openreview.net/profile?id=%7EProsenjit_Mondol1", id: "Prosenjit_Mondol1" },
    youtube: { label: "YouTube", url: "https://www.youtube.com/@prosen49", handle: "@prosen49" },
    codeforces: { label: "Codeforces", url: "https://codeforces.com/profile/prosenjit_mondol", handle: "prosenjit_mondol" },
    hackerrank: { label: "HackerRank", url: "https://www.hackerrank.com/profile/prosenjit1156", handle: "prosenjit1156" },
    leetcode: { label: "LeetCode", url: "https://leetcode.com/u/prosenjit_mondol/", handle: "prosenjit_mondol" },
    email: { label: "Email", url: "mailto:prosenjit1156@gmail.com", address: "prosenjit1156@gmail.com" },
    cimilab: { label: "CIMILab", url: "https://pronad1.github.io/CIMILab/index.html" },
    portfolio: { label: "Portfolio", url: "https://pronad1.github.io/Personal-Portfolio/" },
  },

  // ── RECENT NEWS ───────────────────────────────────────────
  recentNews: [
    "Sep 2026: Physically Presented at MICCAI 2026 — Strasbourg, France! Paper presented at the 3rd MiRASOL Workshop, MICCAI 2026 through the MICCAI Ambassador Program. Prof. Dr. Pamela Guevara personally presented our poster.",
    "Aug 2026: Paper 'A Deep Learning Approach to Bangla License Plate Text Extraction using Easy OCR' (ICPECCII 2026) is now available on IEEE Xplore.",
    "Aug 2026: Paper 'A Sensitivity-Gated Cascade for Compute-Efficient Spinal Lesion Detection' accepted at MIRASOL Workshop, MICCAI 2026.",
    "Sep 2026: Secured Rank #1 on the Global Live Leaderboard in the Glucose Prediction Challenge (MetaboNet Consortium).",
    "Aug 2026: Participated in the Hackathon at PSTU IT Carnival 2026.",
    "2026: DSANet paper submitted at ICECE 2026, BUET (First Author, Under Review).",
    "2025: First Prize at PSTU IT Carnival for the NeuroVision AI project.",
    "2025: Ranked Top 5 out of 50 teams at PSTU Programming Contest 2025.",
    "Aug 2025: Started role as Research Assistant & Lab Systems Coordinator at CIMILab, University of Missouri, USA.",
    "Feb 2023: Enrolled in B.Sc. CSE at PSTU. Currently on Dean's List with CGPA 3.656/4.00.",
  ],
};

// ── TOPIC ROUTER ──────────────────────────────────────────────
// Maps question intents → knowledge retrieval functions
const KB_TOPICS = {
  university: {
    keywords: ["university", "varsity", "institution", "college", "school", "where does he study", "where did he study", "where is he studying", "campus", "alma mater", "pstu"],
    getData: () => PROSENJIT_KB.education,
  },
  semester: {
    keywords: ["semester", "which semester", "current semester", "running semester", "academic year", "which year", "current year", "credit", "credits", "session", "batch", "undergraduate year"],
    getData: () => ({
      degree: "B.Sc. in Computer Science and Engineering",
      institution: "Patuakhali Science & Technology University (PSTU)",
      enrolled: "February 2023 – Present",
      standing: "Senior (4th Year)",
      creditsCompleted: "126.5 / 165",
      cgpa: "3.656 / 4.00 (Dean's List)",
    }),
  },
  cgpa: {
    keywords: ["cgpa", "gpa", "grade", "grades", "result", "results", "marks", "academic result", "academic score", "deans list", "dean's list"],
    getData: () => ({
      bsc_cgpa: "3.656 / 4.00 (Dean's List at PSTU)",
      hsc_gpa: "5.00 / 5.00 (Naogaon Govt. College)",
      ssc_gpa: "5.00 / 5.00 (Chakatitha High School)",
    }),
  },
  certificates: {
    keywords: ["certificate", "certificates", "certification", "certifications", "credential", "credentials", "how many certificate", "how many certif", "cert"],
    getData: () => ({
      totalCount: 17,
      certificates: PROSENJIT_KB.certificates,
    }),
  },
  skills: {
    keywords: ["skill", "skills", "technolog", "tech stack", "languages", "programming language", "framework", "frameworks", "tools", "library", "libraries", "python", "pytorch", "tensorflow", "flutter", "technical background", "technical expertise", "what does he know"],
    getData: () => PROSENJIT_KB.skills,
  },
  miccai: {
    keywords: ["miccai", "mirasol", "spinal", "lesion detection", "france", "strasbourg", "pamela", "guevara", "ambassador program"],
    getData: () => PROSENJIT_KB.publications.find(p => p.id === 2),
  },
  publications: {
    keywords: ["publication", "publications", "paper", "papers", "research paper", "published", "ieee", "dsanet", "stroke", "how many paper", "conference paper", "journal"],
    getData: () => PROSENJIT_KB.publications,
  },
  projects: {
    keywords: ["project", "projects", "neurovision", "trashbot", "reusehub", "graph craft", "vacuum", "job portal", "blood bank", "developed", "portfolio project", "built", "apps"],
    getData: () => PROSENJIT_KB.projects,
  },
  research: {
    keywords: ["research", "research interest", "research interests", "research area", "research topic", "medical ai", "ai in health", "health informatics", "computer vision", "medical image"],
    getData: () => ({ interests: PROSENJIT_KB.researchInterests, lab: PROSENJIT_KB.experience[0] }),
  },
  education: {
    keywords: ["education", "degree", "qualification", "academic background", "study background", "higher secondary", "secondary school"],
    getData: () => PROSENJIT_KB.education,
  },
  experience: {
    keywords: ["experience", "work experience", "job", "cimilab", "position", "current role", "where does he work", "research assistant", "employment"],
    getData: () => PROSENJIT_KB.experience,
  },
  awards: {
    keywords: ["award", "awards", "honour", "honours", "honor", "honors", "achievement", "achievements", "prize", "prizes", "scholarship", "scholarships", "glucose challenge", "contest winner"],
    getData: () => PROSENJIT_KB.awards,
  },
  contact: {
    keywords: ["contact", "email", "phone", "number", "reach", "get in touch", "hire", "collaborat", "connect", "mail"],
    getData: () => ({ contact: PROSENJIT_KB.identity, profiles: PROSENJIT_KB.profiles }),
  },
  github: {
    keywords: ["github", "github profile", "repo", "repositories", "source code"],
    getData: () => PROSENJIT_KB.profiles.github,
  },
  linkedin: {
    keywords: ["linkedin", "linkedin profile", "professional network"],
    getData: () => PROSENJIT_KB.profiles.linkedin,
  },
  scholar: {
    keywords: ["google scholar", "scholar", "citation", "citations"],
    getData: () => PROSENJIT_KB.profiles.googleScholar,
  },
  orcid: {
    keywords: ["orcid", "researcher id"],
    getData: () => PROSENJIT_KB.profiles.orcid,
  },
  huggingface: {
    keywords: ["hugging face", "huggingface", "hf"],
    getData: () => PROSENJIT_KB.profiles.huggingface,
  },
  kaggle: {
    keywords: ["kaggle", "kaggle profile", "competitions profile"],
    getData: () => PROSENJIT_KB.profiles.kaggle,
  },
  competitive: {
    keywords: ["competitive programming", "codeforces", "hackerrank", "leetcode", "beecrowd", "problem solving", "problems solved", "icpc", "programming contest", "nasa space apps"],
    getData: () => PROSENJIT_KB.competitiveProgramming,
  },
  news: {
    keywords: ["latest news", "recent news", "updates", "what is new", "recent updates", "recent achievement"],
    getData: () => PROSENJIT_KB.recentNews,
  },
  volunteering: {
    keywords: ["volunteer", "volunteering", "extracurricular", "badhon", "blood donation", "cse club", "youthmappers"],
    getData: () => PROSENJIT_KB.volunteering,
  },
  coursework: {
    keywords: ["coursework", "courses", "subjects", "curriculum", "classes taken"],
    getData: () => PROSENJIT_KB.coursework,
  },
  identity: {
    keywords: ["who is prosenjit", "who is prosen", "who is he", "tell me about prosenjit", "tell me about prosen", "tell me about him", "about prosenjit", "about prosen", "introduce prosenjit", "introduce yourself", "who are you", "overview of prosenjit", "prosenjit's bio", "prosenjit bio"],
    getData: () => PROSENJIT_KB.identity,
  },
};

// Export for use in chatbot
window.PROSENJIT_KB = PROSENJIT_KB;
window.KB_TOPICS = KB_TOPICS;
