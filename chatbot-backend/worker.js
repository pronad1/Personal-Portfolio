/**
 * Prosen's AI — Cloudflare Worker Backend
 * =========================================
 * Secure serverless proxy for the Gemini API.
 * API key stored as a Cloudflare Worker Secret (never in frontend code).
 *
 * Deploy with:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler secret put GEMINI_API_KEY
 *   wrangler deploy
 *
 * Set the endpoint in chatbot.js: CONFIG.apiEndpoint = '<your worker url>/chat'
 */

const ALLOWED_ORIGINS = [
  'https://pronad1.github.io',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
];

const SYSTEM_PROMPT = `You are "Prosen's AI", a knowledgeable and professional AI assistant dedicated exclusively to answering questions about Prosenjit Mondol's academic background, research, publications, projects, technical skills, awards, and professional experience.

STRICT SCOPE RULES:
- You MUST only answer questions about Prosenjit Mondol.
- If asked anything outside this scope (general knowledge, other people, random topics), respond: "I'm Prosen's AI assistant, designed specifically to answer questions about Prosenjit Mondol's background, research, publications, projects, skills, and professional experience. I'm unable to answer questions outside this scope, but I'd be happy to help you learn more about Prosenjit!"
- Never invent, hallucinate, or guess facts. Only use information from the provided context.
- Never claim publications, awards, or experience that are not in the context.
- Clearly distinguish between: published papers, papers under review, and ongoing work.
- When asked for profile links, only provide exact URLs from the context.

RESPONSE STYLE:
- Be warm, helpful, and professional. Write in a natural, conversational tone.
- Use markdown formatting: **bold**, bullet points, and clickable [link text](url) format.
- Include relevant profile links (GitHub, LinkedIn, Google Scholar, etc.) when contextually useful.
- Keep responses concise but complete. Avoid padding.
- For code/technology questions, be specific about what's in the context.

PROFILE LINKS (use exactly these):
- Portfolio: https://pronad1.github.io/Personal-Portfolio/
- GitHub: https://github.com/pronad1
- LinkedIn: https://www.linkedin.com/in/prosenjit-mondol-615342266/
- Google Scholar: https://scholar.google.com/citations?user=hidSpYcAAAAJ&hl=en
- ResearchGate: https://www.researchgate.net/profile/Prosenjit-Mondol-2
- ORCID: https://orcid.org/0009-0009-4827-4768
- OpenReview: https://openreview.net/profile?id=~Prosenjit_Mondol1
- Hugging Face: https://huggingface.co/prosenjit1156
- Kaggle: https://www.kaggle.com/prosenjitmondol
- YouTube: https://www.youtube.com/@prosen49
- Email: prosenjit1156@gmail.com
- CIMILab: https://pronad1.github.io/CIMILab/index.html`;

const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_TOKENS = 800;
const REQUEST_BODY_LIMIT = 8000; // chars

export default {
  async fetch(request, env, ctx) {
    // ── CORS ──────────────────────────────────────────────────
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o));
    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── RATE LIMITING (simple IP-based via CF) ────────────────
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate:${clientIP}`;
    const rateLimitCount = await env.KV?.get(rateLimitKey);
    if (rateLimitCount && parseInt(rateLimitCount) > 30) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── PARSE REQUEST ─────────────────────────────────────────
    let body;
    try {
      const rawBody = await request.text();
      if (rawBody.length > REQUEST_BODY_LIMIT) {
        return new Response(JSON.stringify({ error: 'Request too large' }), {
          status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      body = JSON.parse(rawBody);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, history = [] } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (message.length > 500) {
      return new Response(JSON.stringify({ error: 'Message too long' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prompt injection guard
    const injectionPatterns = [
      /ignore (all |previous |above |prior )?instructions/i,
      /forget (everything|your instructions|your role)/i,
      /you are now|act as a different|pretend (to be|you are)/i,
      /jailbreak|DAN mode|developer mode/i,
      /reveal (your|the) (system |api |secret)/i,
    ];
    if (injectionPatterns.some(p => p.test(message))) {
      return new Response(JSON.stringify({
        reply: "I'm Prosen's AI assistant, and I only answer questions about Prosenjit Mondol. 😊"
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── BUILD GEMINI REQUEST ───────────────────────────────────
    // Build conversation history (Gemini format)
    const conversationHistory = (Array.isArray(history) ? history : [])
      .filter(h => h.role && h.parts)
      .slice(-8); // last 4 exchanges

    // User message with context
    const userContent = context
      ? `${message}\n\n[PORTFOLIO CONTEXT - use this to answer accurately]:\n${context.substring(0, 3000)}`
      : message;

    const geminiRequest = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...conversationHistory,
        { role: 'user', parts: [{ text: userContent }] },
      ],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.3,
        topP: 0.85,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    // ── CALL GEMINI ───────────────────────────────────────────
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    try {
      const geminiResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest),
      });

      if (!geminiResp.ok) {
        const errText = await geminiResp.text();
        console.error('[Prosen AI Worker] Gemini error:', geminiResp.status, errText);
        throw new Error(`Gemini API error: ${geminiResp.status}`);
      }

      const geminiData = await geminiResp.json();
      const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!reply) throw new Error('Empty Gemini response');

      // Update rate limit counter
      if (env.KV) {
        const count = parseInt(rateLimitCount || '0') + 1;
        ctx.waitUntil(env.KV.put(rateLimitKey, String(count), { expirationTtl: 60 }));
      }

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error('[Prosen AI Worker] Error:', err);
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
