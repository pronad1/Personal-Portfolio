// ============================================================
//  Prosen's AI — Chatbot Engine
//  Local RAG-style retrieval + Gemini API (serverless)
//  Version: 2.0
// ============================================================

(function () {
  'use strict';

  // ── CONFIGURATION ──────────────────────────────────────────
  const CONFIG = {
    // The API endpoint — points to our Cloudflare Worker / serverless proxy
    // so the API key is NEVER exposed in the frontend.
    apiEndpoint: 'https://prosen-ai-api.prosenjitmondol.workers.dev/chat',
    // Fallback: local retrieval-only mode when backend is unavailable
    localFallback: true,
    maxInputLength: 500,
    maxHistory: 10, // keep last N message pairs
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    typingDelay: { min: 800, max: 2200 },
  };

  // ── RATE LIMITER ───────────────────────────────────────────
  const RateLimiter = {
    requests: [],
    isLimited() {
      const now = Date.now();
      this.requests = this.requests.filter(t => now - t < CONFIG.rateLimit.windowMs);
      return this.requests.length >= CONFIG.rateLimit.maxRequests;
    },
    record() { this.requests.push(Date.now()); },
  };

  // ── LOCAL RETRIEVAL ENGINE ────────────────────────────────
  const Retriever = {
    // Find relevant topics for a query
    findTopics(query) {
      const q = query.toLowerCase();
      const matched = [];
      for (const [key, topic] of Object.entries(window.KB_TOPICS || {})) {
        const score = topic.keywords.filter(kw => q.includes(kw.toLowerCase())).length;
        if (score > 0) matched.push({ key, topic, score });
      }
      matched.sort((a, b) => b.score - a.score);
      return matched.slice(0, 3);
    },

    // Get context string for a query
    getContext(query) {
      const topics = this.findTopics(query);
      if (topics.length === 0) return null;
      const data = topics.map(t => ({ topic: t.key, data: t.topic.getData() }));
      return JSON.stringify(data, null, 2);
    },

    // Check if question is out of scope
    isOutOfScope(query) {
      const q = query.toLowerCase();

      // Hard out-of-scope patterns that should ALWAYS be rejected regardless of phrasing
      const hardOutOfScope = [
        /\b(weather|forecast|temperature|climate)\b.*\b(city|paris|london|dhaka|today|tomorrow)\b/i,
        /recipe|how to cook|how to make (a |the )?(cake|pizza|rice|food)/i,
        /who is (elon musk|bill gates|jeff bezos|donald trump|barack obama|mark zuckerberg)/i,
        /capital of [a-z]+|president of [a-z]+|population of [a-z]+/i,
        /write (me )?a (poem|story|essay|code|script|song|joke) (about|on) (?!prosen)/i,
        /translate (this|to|from)\b/i,
        /solve (this )?(math|equation|problem)\b/i,
      ];
      if (hardOutOfScope.some(p => p.test(q))) return true;

      // In-scope signals — if any match, definitely in scope
      const inScopeSignals = [
        'prosenjit', 'prosen', 'mondol', ' his ', 'his ', ' him', ' he ', 'he\'s',
        'research', 'publication', 'project', 'skill', 'education', 'university',
        'pstu', 'cimilab', 'paper', 'award', 'experience', 'contact', 'github',
        'linkedin', 'email', 'background', 'study', 'degree', 'certificate',
        'programming', 'miccai', 'mirasol', 'neurovision', 'trashbot', 'reusehub',
        'kaggle', 'orcid', 'scholar', 'python', 'pytorch', 'machine learning',
        'cv', 'resume', 'career', 'deep learning', 'computer vision', 'codeforces',
        'leetcode', 'hackerrank', 'volunteering', 'clitech', 'nasa', 'dsanet',
        'hugging face', 'openreview', 'researchgate', 'ieee', 'spinal', 'stroke',
        'does he', 'can he', 'has he', 'is he', 'was he', 'will he',
        'his research', 'his project', 'his skill', 'his publication',
        'semester', 'cgpa', 'gpa', 'grade', 'credits', 'dean', 'varsity',
        'alma mater', 'institution', 'certificate', 'certif', 'credential',
        // news / recent activity triggers
        'recent achievement', 'recent activity', 'recent activit', 'recent work',
        'recent accomplish', 'recent update', 'recent news', 'latest news',
        'achievement', 'accomplishment', 'activity', 'update', 'news',
        'what has he done', 'what did he do', 'any news', 'new update',
      ];
      const hasInScopeSignal = inScopeSignals.some(sig => q.includes(sig));
      if (hasInScopeSignal) return false;

      // General filler questions that might be follow-ups (let the AI decide)
      const likelyFollowUp = /^(yes|no|ok|sure|thanks|thank you|great|cool|wow|really|interesting|tell me more|and|also|what about|how about|more|elaborate|explain|details?)[\s?!.]*$/i;
      if (likelyFollowUp.test(q.trim())) return false;

      // Broad out-of-scope pattern — no in-scope signals found
      const outOfScopeIndicators = [
        /weather|recipe|sport|movie|music|celebrity|politics|president|capital city|currency|population/i,
        /write (a |me )?poem|write (a |me )?story|write (a |me )?essay/i,
      ];
      if (outOfScopeIndicators.some(p => p.test(q))) return true;

      // If no in-scope signal at all and not short, likely out of scope
      if (!hasInScopeSignal && q.trim().split(/\s+/).length > 4) return true;

      return false;
    },
  };

  // ── RESPONSE GENERATOR (Local Fallback) ───────────────────
  const LocalResponder = {

    // Intent detector — uses regex directly on the query string.
    // Returns a stable intent string regardless of KB_TOPICS keyword matching.
    detectIntent(q) {
      // Identity — must check before broad "tell me about" fallback
      if (/(who is prosenjit|who is prosen|about prosenjit|about prosen|introduce prosenjit|introduce yourself|overview of prosenjit|prosenjit.?s? bio)/i.test(q)) return 'identity';

      // ── NEWS / RECENT ACTIVITY — check early so "recent achievement/activity" routes here ──
      if (/(news|latest news|recent news|recent update|what.?s new|any news|what happened|recent achievement|recent achievements|recent activit|recent work|recent accomplish|recent result|what has he done|what did he do recent|new update|latest update|new achievement|accomplishment|latest achievement|latest activit)/i.test(q)) return 'news';

      // University / institution
      if (/(university|varsity|alma mater|pstu|patuakhali|where.*(stud|learn)|institution)/i.test(q)) return 'university';
      // Semester / academic standing / credits
      if (/(semester|which year|current year|academic year|credits?|session|batch|undergraduate year|standing)/i.test(q)) return 'semester';
      // CGPA / grades
      if (/(cgpa|gpa|grades?|result|marks|academic result|academic score|dean.?s list)/i.test(q)) return 'cgpa';
      // Certificates — "certif" substring covers certificate/certificates/certification
      if (/(how many cert|certif|credential)/i.test(q)) return 'certificates';
      // Skills — "skill" substring covers skills/technical skills
      if (/(skill|tech stack|programming language|framework|tool|librar|python|pytorch|tensorflow|flutter|what does he (know|code|use)|technical background|technical expertise)/i.test(q)) return 'skills';
      // Publications / papers
      if (/(publication|papers?|miccai|mirasol|ieee|dsanet|spinal|stroke|lesion|license plate|conference paper|journal|how many paper|research paper)/i.test(q)) return 'publications';
      // Projects
      if (/(projects?|neurovision|trashbot|reusehub|graph.?craft|vacuum|job portal|blood bank|what (did|has) he built|apps he made)/i.test(q)) return 'projects';
      // Research interests (more specific, before generic "research")
      if (/(research interest|research area|research background|research topic|working on research|medical ai|ai in health|health informatics)/i.test(q)) return 'research';
      // Awards / achievements (specific trophies, scholarships)
      if (/(awards?|honours?|honors?|prizes?|scholarships?|achievements?|glucose|nasa|carniv|ranking|ranked)/i.test(q)) return 'awards';
      // Education
      if (/(education|degree|b\.?sc|hsc|ssc|high school|secondary school|qualification|academic background)/i.test(q)) return 'education';
      // Experience
      if (/(experience|work experience|cimilab|research assistant|current role|where.*work|employment)/i.test(q)) return 'experience';
      // Contact
      if (/(contact|email|phone|reach|get in touch|hire|collaborat|connect|mail)/i.test(q)) return 'contact';
      // Individual profiles
      if (/(github|repo|source code)/i.test(q)) return 'github';
      if (/(linkedin)/i.test(q)) return 'linkedin';
      if (/(google scholar|scholar|citation)/i.test(q)) return 'scholar';
      if (/(orcid)/i.test(q)) return 'orcid';
      if (/(hugging.?face)/i.test(q)) return 'huggingface';
      if (/(kaggle)/i.test(q)) return 'kaggle';
      // Competitive programming
      if (/(competitive|codeforces|hackerrank|leetcode|beecrowd|problem.?solving|problems solved|icpc|programming contest)/i.test(q)) return 'competitive';
      // Generic "research" (after specific research checks)
      if (/(research)/i.test(q)) return 'research';
      // Volunteering
      if (/(volunteer|badhon|cse club|youthmapper|blood donation|extracurricular)/i.test(q)) return 'volunteering';
      // Coursework
      if (/(course|coursework|subject|curriculum|classes taken|studied)/i.test(q)) return 'coursework';
      // Generic fallback identity
      if (/(who is|introduce|tell me about|about him|overview)/i.test(q)) return 'identity';
      return 'unknown';
    },

    respond(query, _topics) {
      const KB = window.PROSENJIT_KB;
      if (!KB) return "Sorry, I'm having trouble accessing Prosenjit's information right now.";

      const q = query.toLowerCase();
      const intent = this.detectIntent(q);

      // ── UNIVERSITY ──────────────────────────────────────────
      if (intent === 'university') {
        const edu = KB.education[0];
        return `Prosenjit studies at **[${edu.institution}](${edu.institutionUrl})**, ${edu.location}.\n\nHe is pursuing **${edu.degree}** (${edu.period}), currently on the **Dean's List** with a CGPA of **${edu.cgpa}**.`;
      }

      // ── SEMESTER / ACADEMIC STANDING ────────────────────────
      if (intent === 'semester') {
        const edu = KB.education[0];
        return `Prosenjit is currently a **Senior (4th Year)** undergraduate student.\n\n• **Institution:** ${edu.institution}\n• **Credits Completed:** ${edu.creditsCompleted}\n• **CGPA:** ${edu.cgpa} (Dean's List)\n• **Enrolled Since:** February 2023\n\n*Note: Specific running semester information is not publicly listed on his portfolio.*`;
      }

      // ── CGPA / GRADES ────────────────────────────────────────
      if (intent === 'cgpa') {
        return `**Academic Results:**\n\n• 🎓 **B.Sc. CSE at PSTU:** CGPA **3.656 / 4.00** — 🏅 Dean's List\n• 🏫 **HSC (Naogaon Govt. College):** GPA **5.00 / 5.00**\n• 📖 **SSC (Chakatitha High School):** GPA **5.00 / 5.00**`;
      }

      // ── CERTIFICATES ─────────────────────────────────────────
      if (intent === 'certificates') {
        const certs = KB.certificates;
        const list = certs.map((c, i) => `${i + 1}. ${c}`).join('\n');
        return `Prosenjit has earned **${certs.length} certificates**:\n\n${list}\n\n🔗 View them in the [Certificates section](${KB.profiles.portfolio.url}#certs) of his portfolio.`;
      }

      // ── SKILLS ───────────────────────────────────────────────
      if (intent === 'skills') {
        const s = KB.skills;
        return `**Prosenjit's Technical Skills:**\n\n**Languages:** ${s.languages.join(', ')}\n**ML/DL Frameworks:** ${s.mlFrameworks.join(', ')}\n**Visualization:** ${s.visualization.join(', ')}\n**Databases:** ${s.databases.join(', ')}\n**Backend / Mobile:** ${s.backendMobile.join(', ')}\n**Tools & Platforms:** ${s.tools.join(', ')}`;
      }

      // ── PUBLICATIONS ─────────────────────────────────────────
      if (intent === 'publications') {
        const pubs = KB.publications;
        return `**Publications (${pubs.length} papers):**\n\n**[1] ${pubs[0].title}**\n📄 *${pubs[0].venue}*\n✅ **${pubs[0].status}** — ${pubs[0].publisher}\n🔗 [IEEE Xplore](${pubs[0].url})\n\n**[2] ${pubs[1].title}**\n🏛️ *${pubs[1].venue}*\n🇫🇷 **${pubs[1].status}** — ${pubs[1].authorPosition}\n*(Presented at MICCAI 2026 through MICCAI Ambassador Program by Prof. Dr. Pamela Guevara)*\n🔗 [View Poster](https://pronad1.github.io/Personal-Portfolio/acheivement/%5BProsenjit%20Mondol%5D_%5B74%5D_%5BMIRASOL%5D_poster.pdf)\n\n**[3] ${pubs[2].title}**\n🔄 *${pubs[2].venue}*\n⏳ **${pubs[2].status}** — ${pubs[2].authorPosition}\n\n🔗 [Google Scholar](${KB.profiles.googleScholar.url}) · [OpenReview](${KB.profiles.openreview.url}) · [ResearchGate](${KB.profiles.researchgate.url})`;
      }

      // ── PROJECTS ─────────────────────────────────────────────
      if (intent === 'projects') {
        const projs = KB.projects;
        const list = projs.map(p => `**${p.icon} ${p.name}** — ${p.description.substring(0, 90)}... [GitHub](${p.githubUrl})`).join('\n\n');
        return `**Projects (${projs.length} highlighted):**\n\n${list}\n\n🔗 [GitHub Profile](${KB.profiles.github.url}) for all source code.`;
      }

      // ── RESEARCH ─────────────────────────────────────────────
      if (intent === 'research') {
        return `**Research Background:**\n\nProsenjit is a Research Assistant at **CIMILab, University of Missouri** (Remote), working since August 2025 on AI in Health, Medical Image Analysis, and computational informatics.\n\n**Research Interests:**\n${KB.researchInterests.map(i => `• ${i}`).join('\n')}\n\n🔗 [Google Scholar](${KB.profiles.googleScholar.url}) · [ResearchGate](${KB.profiles.researchgate.url}) · [ORCID](${KB.profiles.orcid.url}) · [OpenReview](${KB.profiles.openreview.url})`;
      }

      // ── EDUCATION ────────────────────────────────────────────
      if (intent === 'education') {
        const edu = KB.education;
        return `**Education:**\n\n🎓 **${edu[0].degree}**\n${edu[0].institution} · ${edu[0].location}\n*${edu[0].period}* · CGPA: **${edu[0].cgpa}** · 🏅 **${edu[0].honor}**\n\n🏫 **${edu[1].degree}**\n${edu[1].institution} · *${edu[1].period}* · GPA: **${edu[1].gpa}**\n\n📖 **${edu[2].degree}**\n${edu[2].institution} · *${edu[2].period}* · GPA: **${edu[2].gpa}**`;
      }

      // ── EXPERIENCE ───────────────────────────────────────────
      if (intent === 'experience') {
        const exp = KB.experience[0];
        return `**Work Experience:**\n\n**${exp.role}**\n[${exp.organization}](${exp.orgUrl}) · *${exp.location}*\n📅 ${exp.period}\n\n${exp.description}\n\n🔗 [CIMILab Website](${exp.orgUrl}) · [LinkedIn](${KB.profiles.linkedin.url})`;
      }

      // ── AWARDS ───────────────────────────────────────────────
      if (intent === 'awards') {
        const list = KB.awards.map(a => `🏆 **${a.title}** — ${a.description}`).join('\n\n');
        return `**Awards & Honours (${KB.awards.length} total):**\n\n${list}`;
      }

      // ── CONTACT ──────────────────────────────────────────────
      if (intent === 'contact') {
        const p = KB.profiles;
        return `**Contact & Profiles:**\n\n📧 **Email:** [${KB.identity.email}](mailto:${KB.identity.email})\n📞 **Phone:** ${KB.identity.phone}\n\n**Academic:** [Google Scholar](${p.googleScholar.url}) · [ResearchGate](${p.researchgate.url}) · [ORCID](${p.orcid.url}) · [OpenReview](${p.openreview.url})\n\n**Developer:** [GitHub](${p.github.url}) · [Hugging Face](${p.huggingface.url}) · [Kaggle](${p.kaggle.url})\n\n**Professional:** [LinkedIn](${p.linkedin.url})\n\n**Competitive:** [Codeforces](${p.codeforces.url}) · [HackerRank](${p.hackerrank.url}) · [LeetCode](${p.leetcode.url})\n\n🌐 [Portfolio](${p.portfolio.url})`;
      }

      // ── GITHUB ───────────────────────────────────────────────
      if (intent === 'github') {
        const p = KB.profiles.github;
        return `Prosenjit's **GitHub:** [${p.url}](${p.url}) (handle: **${p.handle}**)\n\nProject repos include NeuroVision AI, TrashBot, ReuseHub, Graph Craft, and more.`;
      }

      // ── LINKEDIN ─────────────────────────────────────────────
      if (intent === 'linkedin') {
        const p = KB.profiles.linkedin;
        return `Prosenjit's **LinkedIn:** [${p.url}](${p.url})`;
      }

      // ── GOOGLE SCHOLAR ───────────────────────────────────────
      if (intent === 'scholar') {
        const p = KB.profiles.googleScholar;
        return `Prosenjit's **Google Scholar:** [${p.url}](${p.url})`;
      }

      // ── ORCID ────────────────────────────────────────────────
      if (intent === 'orcid') {
        const p = KB.profiles.orcid;
        return `Prosenjit's **ORCID:** [${p.url}](${p.url}) (ID: ${p.id})`;
      }

      // ── HUGGING FACE ─────────────────────────────────────────
      if (intent === 'huggingface') {
        const p = KB.profiles.huggingface;
        return `Prosenjit's **Hugging Face:** [${p.url}](${p.url}) (handle: **${p.handle}**)`;
      }

      // ── KAGGLE ───────────────────────────────────────────────
      if (intent === 'kaggle') {
        const p = KB.profiles.kaggle;
        return `Prosenjit's **Kaggle:** [${p.url}](${p.url}) (handle: **${p.handle}**)`;
      }

      // ── COMPETITIVE PROGRAMMING ──────────────────────────────
      if (intent === 'competitive') {
        const cp = KB.competitiveProgramming;
        const platforms = cp.platforms.map(p => `• [${p.name}](${p.url}) — **${p.handle}**`).join('\n');
        return `**Competitive Programming:**\n\nProsenjit has solved **${cp.problemsSolved} problems** across multiple platforms.\n\n**Platforms:**\n${platforms}\n\n**Notable Contests:**\n${cp.contests.map(c => `• ${c}`).join('\n')}\n\n**NASA Space Apps 2025:**\nTeam **${cp.nasaSpaceApps.team}** · Role: *${cp.nasaSpaceApps.role}*`;
      }

      // ── VOLUNTEERING ─────────────────────────────────────────
      if (intent === 'volunteering') {
        const list = KB.volunteering.map(v => `**${v.org}** — *${v.role}* (${v.period})\n${v.description}`).join('\n\n');
        return `**Volunteering & Extracurricular:**\n\n${list}`;
      }

      // ── NEWS ─────────────────────────────────────────────────
      if (intent === 'news') {
        return `**Recent News & Updates:**\n\n${KB.recentNews.map(n => `• ${n}`).join('\n\n')}`;
      }

      // ── COURSEWORK ───────────────────────────────────────────
      if (intent === 'coursework') {
        const c = KB.coursework;
        return `**Relevant Coursework:**\n\n**Computer Science:** ${c.computerScience.join(', ')}\n**Signal & Networks:** ${c.signalNetworks.join(', ')}\n**Mathematics:** ${c.mathematics.join(', ')}\n**Electrical & Electronics:** ${c.electricalElectronics.join(', ')}`;
      }

      // ── IDENTITY ─────────────────────────────────────────────
      if (intent === 'identity') {
        const id = KB.identity;
        return `**${id.name}** is a ${id.title} at **${id.affiliation}**. He also serves as **${id.labRole}** at **${id.labAffiliation}**.\n\nHe is on the **Dean's List** with a CGPA of **3.656/4.00**. His research focuses on AI in Health, Computer Vision, and Medical Image Analysis.\n\nOpen to research collaborations — reach him at [${id.email}](mailto:${id.email}).\n\n🔗 [Portfolio](${KB.profiles.portfolio.url}) · [GitHub](${KB.profiles.github.url}) · [LinkedIn](${KB.profiles.linkedin.url}) · [Google Scholar](${KB.profiles.googleScholar.url})`;
      }

      // ── UNKNOWN ──────────────────────────────────────────────
      return `I don't have that specific information in Prosenjit's portfolio data. I can tell you about:\n• His **research** and publications\n• His **projects** (NeuroVision AI, TrashBot, etc.)\n• His **skills**, education, and CGPA\n• His **awards** and certificates\n• How to **contact** him\n\nJust ask!`;
    },
  };

  // ── MARKDOWN RENDERER (safe) ───────────────────────────────
  const SafeMarkdown = {
    render(text) {
      if (!text) return '';
      // Escape HTML first
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Bold
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Code
      html = html.replace(/`(.+?)`/g, '<code>$1</code>');
      // Links — only allow https://, http://, mailto:
      html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+|mailto:[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
      // Bullets
      html = html.replace(/^• (.+)$/gm, '<li>$1</li>');
      html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>');
      // Wrap consecutive <li> in <ul>
      html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
      // Headings
      html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
      html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^# (.+)$/gm, '<h3>$1</h3>');
      // Paragraphs — wrap double newlines
      html = html.replace(/\n\n+/g, '</p><p>');
      // Single newlines → br (but not inside lists)
      html = html.replace(/\n/g, '<br>');
      return `<p>${html}</p>`;
    },
  };

  // ── CONVERSATION HISTORY ───────────────────────────────────
  const History = {
    messages: [],
    add(role, content) {
      this.messages.push({ role, content, ts: Date.now() });
      // Keep only the last N exchanges
      if (this.messages.length > CONFIG.maxHistory * 2) {
        this.messages = this.messages.slice(-CONFIG.maxHistory * 2);
      }
    },
    getForAPI() {
      return this.messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    },
    clear() { this.messages = []; },
  };

  // ── CHATBOT UI CLASS ───────────────────────────────────────
  class ProsenAI {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.hasGreeted = false;
      this.injectStyles();
      this.injectHTML();
      this.bindEvents();
    }

    // ── STYLES ──────────────────────────────────────────────
    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* ── Prosen's AI Chatbot Styles ── */
        :root {
          --chat-bg: #0f172a;
          --chat-surface: #1e293b;
          --chat-surface2: #162032;
          --chat-border: #334155;
          --chat-blue: #3b82f6;
          --chat-blue-dark: #1d4ed8;
          --chat-text: #f1f5f9;
          --chat-muted: #94a3b8;
          --chat-user-bubble: #1d4ed8;
          --chat-ai-bubble: #1e293b;
          --chat-input-bg: #0f172a;
          --chat-green: #22c55e;
          --chat-radius: 16px;
          --chat-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 4px 24px rgba(59,130,246,0.15);
        }

        /* ── Launcher Button ── */
        #prosen-chat-launcher {
          position: fixed;
          bottom: 28px;
          right: 88px; /* offset from back-to-top button */
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(29,78,216,0.5), 0 0 0 0 rgba(59,130,246,0.4);
          z-index: 998;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: launcher-pulse 3s ease-in-out infinite;
        }
        #prosen-chat-launcher:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 28px rgba(29,78,216,0.65), 0 0 0 0 rgba(59,130,246,0.3);
          animation: none;
        }
        #prosen-chat-launcher .launcher-tooltip {
          position: absolute;
          bottom: 110%;
          right: 0;
          background: #0f172a;
          color: #f1f5f9;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          border: 1px solid #334155;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          font-family: 'Inter', system-ui, sans-serif;
        }
        #prosen-chat-launcher:hover .launcher-tooltip { opacity: 1; }
        #prosen-chat-launcher .launcher-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #fff;
          animation: badge-pulse 2s ease-in-out infinite;
        }
        @keyframes launcher-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(29,78,216,0.5), 0 0 0 0 rgba(59,130,246,0.4); }
          50% { box-shadow: 0 4px 20px rgba(29,78,216,0.5), 0 0 0 10px rgba(59,130,246,0); }
        }
        @keyframes badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* ── Chat Window ── */
        #prosen-chat-window {
          position: fixed;
          bottom: 92px;
          right: 24px;
          width: 390px;
          max-width: calc(100vw - 32px);
          height: 580px;
          max-height: calc(100vh - 120px);
          background: var(--chat-bg);
          border: 1px solid var(--chat-border);
          border-radius: var(--chat-radius);
          box-shadow: var(--chat-shadow);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          font-family: 'Inter', system-ui, sans-serif;
          transform-origin: bottom right;
          transform: scale(0.85) translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
          overflow: hidden;
        }
        #prosen-chat-window.chat-open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        /* ── Header ── */
        .chat-header {
          background: linear-gradient(135deg, #0f172a 0%, #162032 100%);
          border-bottom: 1px solid var(--chat-border);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          border-radius: var(--chat-radius) var(--chat-radius) 0 0;
        }
        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #fff;
          flex-shrink: 0;
          border: 2px solid #3b82f6;
        }
        .chat-header-info {}
        .chat-header-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.2;
        }
        .chat-header-subtitle {
          font-size: 0.65rem;
          color: var(--chat-muted);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 1px;
        }
        .chat-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--chat-green);
          animation: badge-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .chat-close-btn {
          background: none;
          border: none;
          color: var(--chat-muted);
          cursor: pointer;
          font-size: 1rem;
          padding: 4px 8px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }
        .chat-close-btn:hover { color: #f1f5f9; background: rgba(255,255,255,0.08); }

        /* ── Messages Area ── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: #334155 transparent;
          scroll-behavior: smooth;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

        /* ── Welcome Card ── */
        .chat-welcome {
          background: var(--chat-surface);
          border: 1px solid var(--chat-border);
          border-radius: 12px;
          padding: 14px 16px;
        }
        .chat-welcome-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--chat-blue);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 8px;
        }
        .chat-welcome-text {
          font-size: 0.82rem;
          color: var(--chat-text);
          line-height: 1.65;
        }

        /* ── Suggested Questions ── */
        .chat-suggestions-label {
          font-size: 0.63rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--chat-muted);
          margin-top: 4px;
          margin-bottom: 8px;
          padding-left: 2px;
        }
        .chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .chat-suggestion-btn {
          background: var(--chat-surface);
          border: 1px solid var(--chat-border);
          color: var(--chat-text);
          font-size: 0.75rem;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
          font-family: 'Inter', system-ui, sans-serif;
          line-height: 1.4;
          text-align: left;
        }
        .chat-suggestion-btn:hover {
          background: var(--chat-blue-dark);
          border-color: var(--chat-blue);
          color: #fff;
          transform: translateY(-1px);
        }

        /* ── Message Bubbles ── */
        .chat-msg {
          display: flex;
          gap: 8px;
          animation: msg-appear 0.25s ease-out;
        }
        @keyframes msg-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg.user { flex-direction: row-reverse; }

        .chat-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-msg.ai .chat-msg-avatar {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: #fff;
        }
        .chat-msg.user .chat-msg-avatar {
          background: #334155;
          color: var(--chat-muted);
        }

        .chat-bubble {
          max-width: 82%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 0.82rem;
          line-height: 1.65;
        }
        .chat-msg.ai .chat-bubble {
          background: var(--chat-surface);
          color: var(--chat-text);
          border: 1px solid var(--chat-border);
          border-top-left-radius: 4px;
        }
        .chat-msg.user .chat-bubble {
          background: var(--chat-user-bubble);
          color: #fff;
          border-top-right-radius: 4px;
        }

        /* Markdown inside bubbles */
        .chat-bubble p { margin: 0 0 6px; }
        .chat-bubble p:last-child { margin-bottom: 0; }
        .chat-bubble ul { margin: 6px 0 6px 16px; padding: 0; }
        .chat-bubble li { margin-bottom: 3px; }
        .chat-bubble strong { font-weight: 700; }
        .chat-bubble em { font-style: italic; }
        .chat-bubble code { background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; font-family: monospace; }
        .chat-bubble h3, .chat-bubble h4 { font-size: 0.85rem; margin: 8px 0 4px; }
        .chat-link { color: #93c5fd; text-decoration: underline; word-break: break-word; }
        .chat-msg.user .chat-bubble .chat-link { color: #bfdbfe; }

        /* ── Typing Indicator ── */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
        }
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--chat-blue);
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-5px); opacity: 1; }
        }

        /* ── Error State ── */
        .chat-error {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.78rem;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Input Area ── */
        .chat-input-area {
          border-top: 1px solid var(--chat-border);
          padding: 12px 14px;
          background: var(--chat-input-bg);
          border-radius: 0 0 var(--chat-radius) var(--chat-radius);
          flex-shrink: 0;
        }
        .chat-input-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: var(--chat-surface);
          border: 1px solid var(--chat-border);
          border-radius: 12px;
          padding: 8px 10px 8px 14px;
          transition: border-color 0.15s;
        }
        .chat-input-row:focus-within { border-color: var(--chat-blue); }
        .chat-textarea {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--chat-text);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.83rem;
          line-height: 1.5;
          resize: none;
          max-height: 100px;
          min-height: 22px;
          overflow-y: auto;
          scrollbar-width: thin;
          caret-color: var(--chat-blue);
        }
        .chat-textarea::placeholder { color: var(--chat-muted); }
        .chat-send-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--chat-blue-dark);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s, opacity 0.15s;
        }
        .chat-send-btn:hover:not(:disabled) { background: #1e40af; transform: scale(1.05); }
        .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .chat-disclaimer {
          font-size: 0.6rem;
          color: var(--chat-muted);
          text-align: center;
          margin-top: 7px;
          line-height: 1.4;
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          #prosen-chat-window {
            bottom: 0;
            right: 0;
            width: 100vw;
            max-width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
            border: none;
            transform-origin: bottom center;
          }
          #prosen-chat-launcher {
            right: 20px;
            bottom: 20px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // ── HTML ─────────────────────────────────────────────────
    injectHTML() {
      // Launcher
      const launcher = document.createElement('button');
      launcher.id = 'prosen-chat-launcher';
      launcher.setAttribute('aria-label', "Open Prosen's AI Assistant");
      launcher.innerHTML = `
        <i class="fa-solid fa-robot"></i>
        <span class="launcher-badge"></span>
        <span class="launcher-tooltip">Ask Prosen's AI</span>
      `;
      document.body.appendChild(launcher);
      this.launcher = launcher;

      // Chat Window
      const win = document.createElement('div');
      win.id = 'prosen-chat-window';
      win.setAttribute('role', 'dialog');
      win.setAttribute('aria-label', "Prosen's AI Assistant");
      win.innerHTML = `
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-header-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="chat-header-info">
              <div class="chat-header-title">Ask Prosen's AI</div>
              <div class="chat-header-subtitle">
                <span class="chat-status-dot"></span>
                AI assistant &middot; Answers from this portfolio
              </div>
            </div>
          </div>
          <button class="chat-close-btn" id="prosen-chat-close" aria-label="Close chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="chat-messages" id="prosen-chat-messages" role="log" aria-live="polite"></div>
        <div class="chat-input-area">
          <div class="chat-input-row">
            <textarea
              class="chat-textarea"
              id="prosen-chat-input"
              placeholder="Ask anything about Prosen..."
              rows="1"
              maxlength="${CONFIG.maxInputLength}"
              aria-label="Type your question"
            ></textarea>
            <button class="chat-send-btn" id="prosen-chat-send" aria-label="Send message">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <div class="chat-disclaimer">AI-generated from portfolio content — it can make mistakes.</div>
        </div>
      `;
      document.body.appendChild(win);
      this.window = win;
      this.messagesEl = win.querySelector('#prosen-chat-messages');
      this.inputEl = win.querySelector('#prosen-chat-input');
      this.sendBtn = win.querySelector('#prosen-chat-send');
    }

    // ── EVENTS ───────────────────────────────────────────────
    bindEvents() {
      // Open/close
      this.launcher.addEventListener('click', () => this.toggle());
      document.getElementById('prosen-chat-close').addEventListener('click', () => this.close());

      // Send on button click
      this.sendBtn.addEventListener('click', () => this.handleSend());

      // Send on Enter (not Shift+Enter)
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });

      // Auto-resize textarea
      this.inputEl.addEventListener('input', () => {
        this.inputEl.style.height = 'auto';
        this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 100) + 'px';
      });

      // Escape to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }

    // ── OPEN / CLOSE ─────────────────────────────────────────
    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
      this.isOpen = true;
      this.window.classList.add('chat-open');
      this.launcher.style.transform = 'scale(0.9)';
      setTimeout(() => {
        this.launcher.style.transform = '';
        if (!this.hasGreeted) this.showWelcome();
        this.inputEl.focus();
      }, 100);
    }

    close() {
      this.isOpen = false;
      this.window.classList.remove('chat-open');
    }

    // ── WELCOME MESSAGE ───────────────────────────────────────
    showWelcome() {
      this.hasGreeted = true;
      const welcomeDiv = document.createElement('div');
      welcomeDiv.innerHTML = `
        <div class="chat-welcome">
          <div class="chat-welcome-label">✨ HELLO</div>
          <div class="chat-welcome-text">
            Hi! I'm Prosen's AI assistant. I can answer questions about <strong>Prosenjit Mondol's</strong> research, publications, projects, education, technical skills, achievements, and professional background. Ask me anything about Prosen!
          </div>
        </div>
        <div class="chat-suggestions-label">TRY ASKING</div>
        <div class="chat-suggestions" id="prosen-suggestions">
          <button class="chat-suggestion-btn">Who is Prosenjit Mondol?</button>
          <button class="chat-suggestion-btn">Tell me about his research.</button>
          <button class="chat-suggestion-btn">What are his publications?</button>
          <button class="chat-suggestion-btn">What projects has he developed?</button>
          <button class="chat-suggestion-btn">What is his technical background?</button>
          <button class="chat-suggestion-btn">How can I contact him?</button>
        </div>
      `;
      this.messagesEl.appendChild(welcomeDiv);

      // Bind suggestion buttons
      welcomeDiv.querySelectorAll('.chat-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.inputEl.value = btn.textContent;
          this.handleSend();
        });
      });

      this.scrollToBottom();
    }

    // ── HANDLE SEND ───────────────────────────────────────────
    async handleSend() {
      const text = this.inputEl.value.trim();
      if (!text || this.isTyping) return;
      if (text.length > CONFIG.maxInputLength) {
        this.showError('Your message is too long. Please keep it under 500 characters.');
        return;
      }
      if (RateLimiter.isLimited()) {
        this.showError("You're sending messages too quickly. Please wait a moment.");
        return;
      }

      RateLimiter.record();
      this.inputEl.value = '';
      this.inputEl.style.height = 'auto';
      this.sendBtn.disabled = true;

      // Add user message
      this.addMessage('user', text);
      History.add('user', text);

      // Check out of scope
      if (Retriever.isOutOfScope(text)) {
        this.showTyping();
        await this.delay(800);
        this.removeTyping();
        const outMsg = "I'm Prosen's AI assistant, designed specifically to answer questions about Prosenjit Mondol's background, research, publications, projects, skills, and professional experience. I'm unable to answer questions outside this scope, but I'd be happy to help you learn more about Prosenjit!";
        this.addMessage('ai', outMsg);
        History.add('assistant', outMsg);
        this.sendBtn.disabled = false;
        return;
      }

      // Show typing
      this.showTyping();
      this.isTyping = true;

      try {
        // Try the serverless API first
        let response = null;
        try {
          response = await this.callAPI(text);
        } catch (apiError) {
          console.warn('[Prosen AI] API unavailable, using local retrieval.', apiError);
          response = null;
        }

        // If API failed, use local retrieval
        if (!response) {
          const topics = Retriever.findTopics(text);
          const delay = CONFIG.typingDelay.min + Math.random() * (CONFIG.typingDelay.max - CONFIG.typingDelay.min);
          await this.delay(delay);
          response = topics.length > 0
            ? LocalResponder.respond(text, topics)
            : "I found information about Prosenjit Mondol, but I'm not sure I fully understood your question. Could you rephrase it? You can ask about his research, publications, projects, skills, education, awards, or how to contact him.";
        }

        this.removeTyping();
        this.addMessage('ai', response);
        History.add('assistant', response);

      } catch (err) {
        this.removeTyping();
        this.showError('Something went wrong. Please try again.');
        console.error('[Prosen AI] Error:', err);
      } finally {
        this.isTyping = false;
        this.sendBtn.disabled = false;
        this.inputEl.focus();
      }
    }

    // ── API CALL ──────────────────────────────────────────────
    async callAPI(userMessage) {
      const context = Retriever.getContext(userMessage);
      const payload = {
        message: userMessage,
        context: context,
        history: History.getForAPI().slice(-8), // last 4 exchanges
      };

      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.reply) throw new Error('Empty API response');
      return data.reply;
    }

    // ── UI HELPERS ────────────────────────────────────────────
    addMessage(role, text) {
      const msgEl = document.createElement('div');
      msgEl.className = `chat-msg ${role}`;
      const icon = role === 'ai' ? '🤖' : '👤';
      const html = SafeMarkdown.render(text);
      msgEl.innerHTML = `
        <div class="chat-msg-avatar">${icon}</div>
        <div class="chat-bubble">${html}</div>
      `;
      this.messagesEl.appendChild(msgEl);
      this.scrollToBottom();
    }

    showTyping() {
      const el = document.createElement('div');
      el.className = 'chat-msg ai';
      el.id = 'prosen-typing-indicator';
      el.innerHTML = `
        <div class="chat-msg-avatar">🤖</div>
        <div class="chat-bubble" style="padding:12px 14px;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      this.messagesEl.appendChild(el);
      this.scrollToBottom();
    }

    removeTyping() {
      const el = document.getElementById('prosen-typing-indicator');
      if (el) el.remove();
    }

    showError(msg) {
      const el = document.createElement('div');
      el.className = 'chat-error';
      el.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
      this.messagesEl.appendChild(el);
      this.scrollToBottom();
      setTimeout(() => el.remove(), 5000);
    }

    scrollToBottom() {
      requestAnimationFrame(() => {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      });
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  }

  // ── INIT ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.ProsenAI = new ProsenAI(); });
  } else {
    window.ProsenAI = new ProsenAI();
  }

})();
