# Prosen's AI — Deployment & Update Guide

## Architecture Overview

```
Browser (GitHub Pages)
  ├── index.html         — portfolio + chatbot UI injection
  ├── chatbot-knowledge.js — structured KB (no secrets)
  └── chatbot.js         — UI engine + local retrieval (no secrets)
       │
       └── POST → Cloudflare Worker (chatbot-backend/worker.js)
                    └── GEMINI_API_KEY (secret, never in frontend)
                         └── Gemini 2.0 Flash API
```

**Security principle:** The Gemini API key lives only in Cloudflare Worker secrets — never in any file committed to GitHub.

---

## Step 1: Deploy the Cloudflare Worker Backend

### Prerequisites
- A free [Cloudflare account](https://dash.cloudflare.com)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- Node.js installed

### 1.1 Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 1.2 Navigate to backend folder
```bash
cd chatbot-backend
```

### 1.3 (Optional) Create KV namespace for rate limiting
```bash
wrangler kv:namespace create "PROSEN_AI_RATE_LIMIT"
```
Copy the returned `id` and uncomment the `[[kv_namespaces]]` section in `wrangler.toml`, filling in the id.

### 1.4 Set the Gemini API Key as a secret (NEVER commit this to Git)
```bash
wrangler secret put GEMINI_API_KEY
# Paste your key when prompted
```

### 1.5 Deploy the worker
```bash
wrangler deploy
```

You'll get a URL like: `https://prosen-ai-api.YOUR-SUBDOMAIN.workers.dev`

### 1.6 Update chatbot.js with your worker URL
In `chatbot.js`, find and update:
```js
apiEndpoint: 'https://prosen-ai-api.YOUR-SUBDOMAIN.workers.dev/chat',
```

### 1.7 Add your GitHub Pages domain to ALLOWED_ORIGINS in worker.js
```js
const ALLOWED_ORIGINS = [
  'https://pronad1.github.io',
  // ...
];
```
Then redeploy: `wrangler deploy`

---

## Step 2: Deploy the Portfolio to GitHub Pages

```bash
cd ..  # back to Personal-Portfolio root
git add chatbot-knowledge.js chatbot.js index.html
git add chatbot-backend/worker.js chatbot-backend/wrangler.toml
git commit -m "feat: Add Prosen's AI chatbot"
git push origin main
```

GitHub Pages will automatically rebuild and deploy.

> **Important:** `chatbot-backend/` contains NO secrets. The API key is ONLY in Cloudflare's secret store.

---

## Step 3: Verify the Deployment

1. Visit https://pronad1.github.io/Personal-Portfolio/
2. You should see a blue 🤖 robot button in the bottom-right corner.
3. Click it → the chat window opens with the welcome message.
4. Test these questions:
   - "Who is Prosenjit Mondol?" → Full bio with links
   - "Tell me about his publications" → 3 papers listed
   - "What projects has he built?" → 7 projects listed
   - "What are his technical skills?" → Full skills breakdown
   - "Tell me about the weather in Paris" → Polite out-of-scope response

---

## Fallback Mode (No Backend)

If the Cloudflare Worker is not set up or temporarily unavailable, the chatbot automatically falls back to **local retrieval mode**:
- All answers are generated from the structured knowledge base in `chatbot-knowledge.js`
- No API key is needed
- Responses are fast but slightly less conversational

The fallback is fully functional and covers all major topics.

---

## Updating the Knowledge Base

The knowledge base is in `chatbot-knowledge.js`. It's a plain JavaScript object — no database needed.

### Common updates:

**Adding a new publication:**
```js
publications: [
  // ... existing ones ...
  {
    id: 4,
    title: "New Paper Title",
    venue: "Conference Name 2027",
    status: "Published",  // or "Under Review" / "Physically Presented"
    authorPosition: "First Author",
    url: "https://link-to-paper.com",
    notes: "Brief context about the paper.",
  },
],
```

**Adding a new project:**
```js
projects: [
  // ... existing ones ...
  {
    name: "New Project",
    icon: "🔬",
    description: "What it does.",
    tags: ["Python", "PyTorch"],
    githubUrl: "https://github.com/pronad1/new-project",
    demoUrl: "https://youtube.com/...",
  },
],
```

**Adding a new award:**
```js
awards: [
  // ... existing ones ...
  {
    title: "New Award Name",
    description: "What it's for and when you received it.",
  },
],
```

After any update, commit and push to GitHub. The chatbot immediately reflects the changes (no redeployment of the Worker needed for KB updates).

---

## Customizing the AI Behavior

The system prompt that controls the AI's personality and strict scope is in `chatbot-backend/worker.js` under `SYSTEM_PROMPT`. After editing:
```bash
cd chatbot-backend
wrangler deploy
```

---

## Cost Estimates

- **Cloudflare Workers Free Tier:** 100,000 requests/day — more than enough for a personal portfolio.
- **Gemini 2.0 Flash:** Very low cost. For typical portfolio traffic (100-500 chats/month), cost is effectively $0.

---

## Security Checklist

- [x] API key stored in Cloudflare Worker Secrets only
- [x] No API key in any committed file
- [x] CORS restricted to your GitHub Pages domain
- [x] Input length limited to 500 chars
- [x] Rate limiting: 30 requests/minute/IP
- [x] Request body size limited to 8KB
- [x] Prompt injection patterns blocked
- [x] Markdown rendered safely (no raw HTML injection)
- [x] Out-of-scope questions handled gracefully
- [x] No visitor conversation data stored

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chatbot button not appearing | Check browser console for JS errors; ensure scripts are loaded |
| API calls fail | Check Cloudflare Worker logs (`wrangler tail`); verify API key |
| Responses don't match portfolio | Update `chatbot-knowledge.js` with correct info |
| Out-of-scope filter too aggressive | Add more `inScopeSignals` in `chatbot.js` Retriever |
| CORS errors | Add your domain to `ALLOWED_ORIGINS` in `worker.js` and redeploy |
