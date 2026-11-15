// =============================================================================
// PORTFOLIO CMS — admin/app.js
// =============================================================================
// FILL IN YOUR SUPABASE_URL AND SUPABASE_ANON_KEY from supabase.com/dashboard
// =============================================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// SECURITY NOTES:
// - RLS on Supabase ensures only the authenticated user (prosenjit1156@gmail.com) can write
// - Anon key is read-only by design via RLS policies
// - No service role key ever in frontend
// - All writes are gated behind Supabase Auth JWT verification server-side

// =============================================================================
// 1. SUPABASE CLIENT & DUAL-MODE BACKEND INITIALIZATION
// =============================================================================

const ADMIN_EMAIL = 'prosenjit1156@gmail.com';
const DEFAULT_PASSWORD_HASH = 'c90cecca85d750981f0d107d3f0d7d2ed31bf0b1765c1555514f71781471d4c8'; // 'prosenjit1156'
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const isSupabaseConfigured =
  typeof SUPABASE_URL === 'string' &&
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_URL.startsWith('http') &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
  SUPABASE_ANON_KEY.length > 20;

let _realSupabase = null;
if (isSupabaseConfigured && typeof supabase !== 'undefined') {
  try {
    _realSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
  }
}

async function hashPassword(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Local Database Adapter when Supabase is not yet configured or offline
const LocalDB = {
  get(table) {
    const raw = localStorage.getItem(`prosen_cms_${table}`);
    if (raw) {
      try { return JSON.parse(raw); } catch (_) {}
    }
    const initial = this.getInitial(table);
    this.set(table, initial);
    return initial;
  },
  set(table, data) {
    localStorage.setItem(`prosen_cms_${table}`, JSON.stringify(data));
  },
  getInitial(table) {
    const KB = window.PROSENJIT_KB;
    if (!KB) return [];
    if (table === 'about') {
      return [{
        id: 'about-1',
        name: KB.identity?.name || 'Prosenjit Mondol',
        nickname: KB.identity?.nickname || 'Prosen',
        title: KB.identity?.title || 'B.Sc. CSE Student & Research Assistant',
        bio: KB.identity?.bio || '',
        open_to: KB.identity?.openTo || 'Research collaborations and opportunities',
        cgpa: KB.education?.[0]?.cgpa || '3.656 / 4.00',
        credits_completed: KB.education?.[0]?.creditsCompleted || '126.5 / 165',
        honor: KB.education?.[0]?.honor || "Dean's List",
        lab_role: KB.identity?.labRole || 'Research Assistant & Lab Systems Coordinator (Remote)',
        lab_affiliation: KB.identity?.labAffiliation || 'CIMILab, University of Missouri, USA',
        lab_url: 'https://pronad1.github.io/CIMILab/index.html',
        email: KB.identity?.email || ADMIN_EMAIL,
        phone: KB.identity?.phone || '+880 1315747034',
        portfolio_url: 'https://pronad1.github.io/Personal-Portfolio/',
        created_at: new Date().toISOString()
      }];
    }
    if (table === 'news') {
      return (KB.recentNews || []).map((n, i) => {
        const parts = n.split(': ');
        return {
          id: `news-${i+1}`,
          date: parts[0] || '2026',
          title: parts[1] || n,
          content: n,
          status: 'published',
          display_order: i,
          created_at: new Date().toISOString()
        };
      });
    }
    if (table === 'experience') {
      return (KB.experience || []).map((e, i) => ({
        id: `exp-${i+1}`,
        role: e.role,
        organization: e.organization,
        org_url: e.orgUrl,
        location: e.location,
        period_start: e.period?.split('–')[0]?.trim() || 'August 2025',
        period_end: e.period?.split('–')[1]?.trim() || 'Present',
        description: e.description,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'education') {
      return (KB.education || []).map((e, i) => ({
        id: `edu-${i+1}`,
        degree: e.degree,
        institution: e.institution,
        inst_url: e.institutionUrl,
        location: e.location,
        period: e.period,
        gpa: e.cgpa || e.gpa,
        honor: e.honor || '',
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'publications') {
      return (KB.publications || []).map((p, i) => ({
        id: `pub-${i+1}`,
        title: p.title,
        venue: p.venue,
        status: p.status,
        publisher: p.publisher || '',
        url: p.url || '',
        author_position: p.authorPosition || '',
        poster_url: p.posterUrl || '',
        openreview_url: p.openreviewUrl || '',
        notes: p.notes || '',
        year: 2026,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'projects') {
      return (KB.projects || []).map((p, i) => ({
        id: `proj-${i+1}`,
        name: p.name,
        icon: p.icon || '🚀',
        description: p.description,
        tags: p.tags || [],
        github_url: p.githubUrl || '',
        demo_url: p.demoUrl || '',
        live_url: p.liveUrl || '',
        awards: p.awards || '',
        status: 'published',
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'skills') {
      const s = KB.skills || {};
      const categories = [
        { name: 'Languages', items: s.languages },
        { name: 'ML/DL Frameworks', items: s.mlFrameworks },
        { name: 'Visualization', items: s.visualization },
        { name: 'Databases', items: s.databases },
        { name: 'Backend / Mobile', items: s.backendMobile },
        { name: 'Tools & Platforms', items: s.tools }
      ];
      return categories.filter(c => c.items).map((c, i) => ({
        id: `skill-${i+1}`,
        category: c.name,
        items: c.items,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'awards') {
      return (KB.awards || []).map((a, i) => ({
        id: `award-${i+1}`,
        title: a.title,
        description: a.description,
        url: a.challengeUrl || '',
        year: 2026,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'certificates') {
      return (KB.certificates || []).map((c, i) => ({
        id: `cert-${i+1}`,
        label: c,
        file_url: '',
        type: 'pdf',
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'competitive_programming') {
      return (KB.competitiveProgramming?.platforms || []).map((p, i) => ({
        id: `cp-${i+1}`,
        platform: p.name,
        handle: p.handle,
        url: p.url,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'cp_meta') {
      const cp = KB.competitiveProgramming;
      return [{
        id: 'cp_meta-1',
        problems_solved: cp?.problemsSolved || '1,500+',
        nasa_team: cp?.nasaSpaceApps?.team || 'PSTU_CLITECH',
        nasa_role: cp?.nasaSpaceApps?.role || 'Programmer / Lead Developer',
        nasa_project: cp?.nasaSpaceApps?.project || 'Clitech',
        nasa_location: cp?.nasaSpaceApps?.location || 'Barisal',
        nasa_track: cp?.nasaSpaceApps?.challengeTrack || '',
        created_at: new Date().toISOString()
      }];
    }
    if (table === 'contests') {
      return (KB.competitiveProgramming?.contests || []).map((c, i) => ({
        id: `contest-${i+1}`,
        name: c,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'hackathons') {
      return [];
    }
    if (table === 'coursework') {
      const cw = KB.coursework || {};
      return [
        { id: 'cw-1', category: 'Computer Science', courses: cw.computerScience || [], display_order: 0 },
        { id: 'cw-2', category: 'Signal & Networks', courses: cw.signalNetworks || [], display_order: 1 },
        { id: 'cw-3', category: 'Mathematics', courses: cw.mathematics || [], display_order: 2 },
        { id: 'cw-4', category: 'Electrical & Electronics', courses: cw.electricalElectronics || [], display_order: 3 },
      ];
    }
    if (table === 'contact_profiles') {
      return Object.entries(KB.profiles || {}).map(([key, p], i) => ({
        id: `prof-${i+1}`,
        platform: key,
        label: p.label || key,
        url: p.url || '',
        handle: p.handle || p.id || '',
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'volunteering') {
      return (KB.volunteering || []).map((v, i) => ({
        id: `vol-${i+1}`,
        org: v.org,
        role: v.role,
        period: v.period,
        description: v.description,
        display_order: i,
        created_at: new Date().toISOString()
      }));
    }
    if (table === 'media') {
      return [{
        id: 'media-1',
        title: 'Clitech — NASA Space Apps Challenge Project Demo',
        url: 'https://youtu.be/183J4iqp-s4',
        type: 'video',
        thumbnail_url: '',
        display_order: 0,
        created_at: new Date().toISOString()
      }];
    }
    if (table === 'activity_log') {
      return [{
        id: 'act-1',
        action: 'system',
        section: 'dashboard',
        description: 'Dashboard initialized',
        performed_by: ADMIN_EMAIL,
        created_at: new Date().toISOString()
      }];
    }
    return [];
  },
  query(table) {
    const self = this;
    let data = [...this.get(table)];
    const builder = {
      select(cols, opts) {
        if (opts && opts.count === 'exact' && opts.head) {
          return Promise.resolve({ count: data.length, data: null, error: null });
        }
        return builder;
      },
      eq(col, val) {
        data = data.filter(item => item[col] === val);
        return builder;
      },
      order(col, opts = { ascending: true }) {
        data.sort((a, b) => {
          if (a[col] < b[col]) return opts.ascending ? -1 : 1;
          if (a[col] > b[col]) return opts.ascending ? 1 : -1;
          return 0;
        });
        return builder;
      },
      limit(n) {
        data = data.slice(0, n);
        return builder;
      },
      maybeSingle() {
        return Promise.resolve({ data: data[0] || null, error: null });
      },
      then(resolve) {
        resolve({ data, error: null });
      },
      async insert(payload) {
        const rows = Array.isArray(payload) ? payload : [payload];
        const current = self.get(table);
        const inserted = rows.map(r => ({
          ...r,
          id: r.id || `${table}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        self.set(table, [...current, ...inserted]);
        return { data: inserted, error: null };
      },
      update(payload) {
        return {
          async eq(col, val) {
            const current = self.get(table);
            let updated = null;
            const next = current.map(item => {
              if (item[col] === val) {
                updated = { ...item, ...payload, updated_at: new Date().toISOString() };
                return updated;
              }
              return item;
            });
            self.set(table, next);
            return { data: updated, error: null };
          }
        };
      },
      delete() {
        return {
          async eq(col, val) {
            const current = self.get(table);
            const next = current.filter(item => item[col] !== val);
            self.set(table, next);
            return { error: null };
          }
        };
      }
    };
    return builder;
  }
};

const LocalAuth = {
  authListeners: [],
  onAuthStateChange(cb) {
    this.authListeners.push(cb);
  },
  async getSession() {
    const raw = sessionStorage.getItem('prosen_admin_session');
    if (!raw) return { data: { session: null } };
    try {
      const sess = JSON.parse(raw);
      if (sess && sess.user && sess.user.email === ADMIN_EMAIL) {
        return { data: { session: sess } };
      }
    } catch (_) {}
    return { data: { session: null } };
  },
  async signInWithPassword({ email, password }) {
    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { data: null, error: { message: 'Unauthorized email address.' } };
    }
    const hash = await hashPassword(password);
    const expectedHash = localStorage.getItem('prosen_admin_password_hash') || DEFAULT_PASSWORD_HASH;

    if (hash !== expectedHash) {
      return { data: null, error: { message: 'Invalid password. Please enter the correct password.' } };
    }

    const session = {
      user: { email: ADMIN_EMAIL, role: 'authenticated' },
      access_token: 'local-session-token',
      mode: 'local'
    };
    sessionStorage.setItem('prosen_admin_session', JSON.stringify(session));
    this.authListeners.forEach(cb => cb('SIGNED_IN', session));
    return { data: { session, user: session.user }, error: null };
  },
  async signOut() {
    sessionStorage.removeItem('prosen_admin_session');
    this.authListeners.forEach(cb => cb('SIGNED_OUT', null));
    return { error: null };
  }
};

const LocalStorage = {
  from(bucket) {
    return {
      async upload(fileName, file) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            try {
              sessionStorage.setItem(`file_${fileName}`, dataUrl);
            } catch (_) {}
            resolve({ data: { path: fileName, url: dataUrl }, error: null });
          };
          reader.onerror = () => resolve({ data: null, error: { message: 'File read error' } });
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl(fileName) {
        const stored = sessionStorage.getItem(`file_${fileName}`);
        return { data: { publicUrl: stored || fileName } };
      }
    };
  }
};

const supabaseClient = {
  from(table) {
    if (_realSupabase) return _realSupabase.from(table);
    return LocalDB.query(table);
  },
  get auth() {
    if (_realSupabase) return _realSupabase.auth;
    return LocalAuth;
  },
  get storage() {
    if (_realSupabase) return _realSupabase.storage;
    return LocalStorage;
  }
};

let inactivityTimer = null;
let currentSection = 'overview';
let quillInstances = {}; // keyed by field name

// =============================================================================
// 2. UTILITY HELPERS
// =============================================================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
  quillInstances = {};
}

function openModal(title, bodyHtml, onSave) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const saveBtn = document.getElementById('modal-save-btn');

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modal.classList.add('active');

  // Re-attach save button handler
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', onSave);
  }

  // Close on backdrop click
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
}

function initQuill(containerId, initialContent = '') {
  const el = document.getElementById(containerId);
  if (!el) return null;
  const q = new Quill(`#${containerId}`, {
    theme: 'snow',
    modules: { toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['link'], ['clean']
    ]}
  });
  if (initialContent) q.root.innerHTML = initialContent;
  quillInstances[containerId] = q;
  return q;
}

function getQuillContent(containerId) {
  const q = quillInstances[containerId];
  return q ? q.root.innerHTML : '';
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function arrayToComma(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.join(', ');
  return String(arr);
}

function commaToArray(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function statusBadge(status) {
  const color = status === 'published' || status === 'Published'
    ? 'badge-success'
    : status === 'draft' || status === 'Draft'
    ? 'badge-warning'
    : 'badge-info';
  return `<span class="badge ${color}">${escHtml(status)}</span>`;
}

function filterItems(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(f => item[f] && String(item[f]).toLowerCase().includes(q))
  );
}

// =============================================================================
// 3. ACTIVITY LOGGER
// =============================================================================

async function logActivity(action, section, description) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    await supabaseClient.from('activity_log').insert({
      action,
      section,
      description,
      performed_by: session?.user?.email || ADMIN_EMAIL
    });
  } catch (err) {
    console.warn('Activity log failed:', err.message);
  }
}

// =============================================================================
// 4. FILE UPLOAD HELPER
// =============================================================================

async function uploadFile(file, bucket, folder) {
  // bucket: 'portfolio-media' or 'portfolio-pdfs'
  // Validates file type and size, returns public URL

  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const pdfTypes = ['application/pdf'];
  const imageSizeLimit = 10 * 1024 * 1024; // 10MB
  const pdfSizeLimit = 20 * 1024 * 1024;   // 20MB

  if (bucket === 'portfolio-media') {
    if (!imageTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: jpg, png, webp, gif');
    }
    if (file.size > imageSizeLimit) {
      throw new Error('Image too large. Max 10MB.');
    }
  } else if (bucket === 'portfolio-pdfs') {
    if (!pdfTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: pdf');
    }
    if (file.size > pdfSizeLimit) {
      throw new Error('PDF too large. Max 20MB.');
    }
  } else {
    throw new Error(`Unknown bucket: ${bucket}`);
  }

  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseClient.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// =============================================================================
// 5. SORTABLE DRAG-AND-DROP HELPER
// =============================================================================

function initSortable(listEl, tableName, items) {
  if (!listEl || typeof Sortable === 'undefined') return;
  Sortable.create(listEl, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: async (evt) => {
      const cards = listEl.querySelectorAll('.item-card');
      const updates = [];
      cards.forEach((card, idx) => {
        const id = card.dataset.id;
        if (id) updates.push({ id, display_order: idx });
      });
      try {
        for (const u of updates) {
          await supabaseClient.from(tableName).update({ display_order: u.display_order }).eq('id', u.id);
        }
        showToast('Order saved', 'success');
      } catch (err) {
        showToast('Failed to save order', 'error');
      }
    }
  });
}

// =============================================================================
// 6. INACTIVITY TIMEOUT
// =============================================================================

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    showToast('Session expired due to inactivity. Signing out…', 'warning');
    await signOut();
  }, INACTIVITY_TIMEOUT_MS);
}

function startInactivityTracking() {
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}

function stopInactivityTracking() {
  clearTimeout(inactivityTimer);
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.removeEventListener(evt, resetInactivityTimer);
  });
}

// =============================================================================
// 7. AUTH MODULE & RATE LIMITING
// =============================================================================

function setLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }
}

let failedAttempts = parseInt(sessionStorage.getItem('prosen_login_fails') || '0', 10);
let lockoutUntil = parseInt(sessionStorage.getItem('prosen_lockout') || '0', 10);

function recordFailedAttempt() {
  failedAttempts++;
  sessionStorage.setItem('prosen_login_fails', failedAttempts);
  if (failedAttempts >= 5) {
    lockoutUntil = Date.now() + 60 * 1000;
    sessionStorage.setItem('prosen_lockout', lockoutUntil);
    setLoginError('Too many failed attempts. Locked for 60 seconds.');
  }
}

async function signIn(email, password) {
  if (Date.now() < lockoutUntil) {
    const sec = Math.ceil((lockoutUntil - Date.now()) / 1000);
    setLoginError(`Account temporarily locked. Please wait ${sec}s.`);
    return;
  }

  if (!email || !password) {
    setLoginError('Please enter both your email and password.');
    return;
  }

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    recordFailedAttempt();
    setLoginError('Unauthorized email address.');
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      recordFailedAttempt();
      setLoginError(`Sign-in failed: ${error.message}`);
      return;
    }

    failedAttempts = 0;
    sessionStorage.removeItem('prosen_login_fails');
    sessionStorage.removeItem('prosen_lockout');
    setLoginError('');
    showToast('Signed in successfully!', 'success');
    showDashboard();
  } catch (err) {
    recordFailedAttempt();
    setLoginError(`Sign-in error: ${err.message || 'Connection failure'}`);
  }
}

async function signOut() {
  stopInactivityTracking();
  await supabaseClient.auth.signOut();
  window.location.reload();
}

async function getSession() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  } catch (_) {
    return null;
  }
}

function showLoginPage() {
  document.getElementById('login-page')?.classList.remove('hidden');
  document.getElementById('dashboard-page')?.classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-page')?.classList.add('hidden');
  document.getElementById('dashboard-page')?.classList.remove('hidden');

  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl) userEmailEl.textContent = ADMIN_EMAIL;

  // If running in local fallback mode, show notice banner
  if (!isSupabaseConfigured) {
    let modeBanner = document.getElementById('cms-mode-banner');
    if (!modeBanner) {
      modeBanner = document.createElement('div');
      modeBanner.id = 'cms-mode-banner';
      modeBanner.style.cssText = 'background: rgba(52, 152, 219, 0.15); border: 1px solid rgba(52, 152, 219, 0.4); color: #93c5fd; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;';
      modeBanner.innerHTML = `
        <div>
          <strong>⚡ Local Mode:</strong> Logged in as <code>${ADMIN_EMAIL}</code>. Changes are saved in your local browser storage.
          To sync live with GitHub Pages, follow <a href="../ADMIN_DEPLOYMENT.md" target="_blank" style="color:#60a5fa;text-decoration:underline;">ADMIN_DEPLOYMENT.md</a> to connect your free Supabase database.
        </div>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#93c5fd;cursor:pointer;font-size:1.1rem;padding:0 0.5rem;" aria-label="Dismiss">×</button>
      `;
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.prepend(modeBanner);
    }
  }

  startInactivityTracking();
  navigateTo('overview');
}

// =============================================================================
// 8. NAVIGATION
// =============================================================================

function navigateTo(section) {
  currentSection = section;

  // Hide all section panels
  document.querySelectorAll('.section-panel').forEach(p => p.classList.add('hidden'));

  // Show target panel
  const target = document.getElementById(`panel-${section}`);
  if (target) target.classList.remove('hidden');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });

  // Load data for section
  loadSection(section);
}

function loadSection(section) {
  const loaders = {
    overview: loadOverview,
    about: loadAbout,
    news: loadNews,
    experience: loadExperience,
    education: loadEducation,
    publications: loadPublications,
    projects: loadProjects,
    skills: loadSkills,
    awards: loadAwards,
    certificates: loadCertificates,
    competitive_programming: loadCompetitiveProgramming,
    cp_meta: loadCpMeta,
    contests: loadContests,
    hackathons: loadHackathons,
    coursework: loadCoursework,
    contact_profiles: loadContactProfiles,
    volunteering: loadVolunteering,
    media: loadMedia
  };
  if (loaders[section]) loaders[section]();
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) navigateTo(section);

      // Close sidebar on mobile after clicking
      if (window.innerWidth < 768) {
        document.getElementById('sidebar')?.classList.remove('open');
      }
    });
  });

  // Mobile hamburger
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });

  // Sign-out button
  document.getElementById('signout-btn')?.addEventListener('click', () => signOut());
}

// =============================================================================
// 9. OVERVIEW DASHBOARD
// =============================================================================

async function loadOverview() {
  const tables = [
    'news', 'experience', 'education', 'publications', 'projects',
    'skills', 'awards', 'certificates', 'competitive_programming',
    'contests', 'hackathons', 'coursework', 'contact_profiles',
    'volunteering', 'media'
  ];

  for (const table of tables) {
    try {
      const { count } = await supabaseClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      const el = document.getElementById(`stat-${table}`);
      if (el) el.textContent = count ?? 0;
    } catch (_) {}
  }

  // Recent activity log
  try {
    const { data: logs } = await supabaseClient
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const logList = document.getElementById('activity-log-list');
    if (logList && logs) {
      logList.innerHTML = logs.map(log => `
        <div class="activity-entry">
          <span class="activity-action badge badge-info">${escHtml(log.action)}</span>
          <span class="activity-section">${escHtml(log.section)}</span>
          <span class="activity-desc">${escHtml(log.description)}</span>
          <span class="activity-time">${new Date(log.created_at).toLocaleString()}</span>
        </div>
      `).join('') || '<p class="empty-state">No activity yet.</p>';
    }
  } catch (_) {}
}

// =============================================================================
// 10. JSON EXPORT BACKUP
// =============================================================================

async function exportBackup() {
  const tables = [
    'about', 'news', 'experience', 'education', 'publications', 'projects',
    'skills', 'awards', 'certificates', 'competitive_programming', 'cp_meta',
    'contests', 'hackathons', 'coursework', 'contact_profiles',
    'volunteering', 'media', 'activity_log'
  ];

  showToast('Preparing backup…', 'warning');
  const backup = { exported_at: new Date().toISOString(), tables: {} };

  for (const table of tables) {
    try {
      const { data } = await supabaseClient.from(table).select('*').order('created_at', { ascending: true });
      backup.tables[table] = data || [];
    } catch (err) {
      backup.tables[table] = { error: err.message };
    }
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded!', 'success');
}

// =============================================================================
// 11. SECTION: ABOUT (single-row edit form, no list)
// =============================================================================

async function loadAbout() {
  const { data, error } = await supabaseClient.from('about').select('*').limit(1).maybeSingle();
  if (error) { showToast('Failed to load About: ' + error.message, 'error'); return; }
  renderAboutForm(data);
}

function renderAboutForm(item = null) {
  const panel = document.getElementById('panel-about');
  if (!panel) return;
  panel.innerHTML = `
    <div class="section-header">
      <h2>About</h2>
    </div>
    <form id="about-form" class="edit-form">
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="about-name" value="${escHtml(item?.name || '')}" />
      </div>
      <div class="form-group">
        <label>Nickname</label>
        <input type="text" id="about-nickname" value="${escHtml(item?.nickname || '')}" />
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="about-title" value="${escHtml(item?.title || '')}" />
      </div>
      <div class="form-group">
        <label>Bio</label>
        <div id="about-bio-editor" class="quill-editor">${item?.bio || ''}</div>
      </div>
      <div class="form-group">
        <label>Open To</label>
        <input type="text" id="about-open_to" value="${escHtml(item?.open_to || '')}" />
      </div>
      <div class="form-group">
        <label>CGPA</label>
        <input type="text" id="about-cgpa" value="${escHtml(item?.cgpa || '')}" />
      </div>
      <div class="form-group">
        <label>Credits Completed</label>
        <input type="text" id="about-credits_completed" value="${escHtml(item?.credits_completed || '')}" />
      </div>
      <div class="form-group">
        <label>Honor</label>
        <input type="text" id="about-honor" value="${escHtml(item?.honor || '')}" />
      </div>
      <div class="form-group">
        <label>Lab Role</label>
        <input type="text" id="about-lab_role" value="${escHtml(item?.lab_role || '')}" />
      </div>
      <div class="form-group">
        <label>Lab Affiliation</label>
        <input type="text" id="about-lab_affiliation" value="${escHtml(item?.lab_affiliation || '')}" />
      </div>
      <div class="form-group">
        <label>Lab URL</label>
        <input type="url" id="about-lab_url" value="${escHtml(item?.lab_url || '')}" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="about-email" value="${escHtml(item?.email || '')}" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="text" id="about-phone" value="${escHtml(item?.phone || '')}" />
      </div>
      <div class="form-group">
        <label>Portfolio URL</label>
        <input type="url" id="about-portfolio_url" value="${escHtml(item?.portfolio_url || '')}" />
      </div>
      <div class="form-actions">
        <button type="button" id="about-save-btn" class="btn btn-primary">Save About</button>
      </div>
    </form>
  `;

  initQuill('about-bio-editor', item?.bio || '');

  document.getElementById('about-save-btn').addEventListener('click', () => saveAbout(item?.id));
}

async function saveAbout(existingId = null) {
  const payload = {
    name: document.getElementById('about-name')?.value.trim(),
    nickname: document.getElementById('about-nickname')?.value.trim(),
    title: document.getElementById('about-title')?.value.trim(),
    bio: getQuillContent('about-bio-editor'),
    open_to: document.getElementById('about-open_to')?.value.trim(),
    cgpa: document.getElementById('about-cgpa')?.value.trim(),
    credits_completed: document.getElementById('about-credits_completed')?.value.trim(),
    honor: document.getElementById('about-honor')?.value.trim(),
    lab_role: document.getElementById('about-lab_role')?.value.trim(),
    lab_affiliation: document.getElementById('about-lab_affiliation')?.value.trim(),
    lab_url: document.getElementById('about-lab_url')?.value.trim(),
    email: document.getElementById('about-email')?.value.trim(),
    phone: document.getElementById('about-phone')?.value.trim(),
    portfolio_url: document.getElementById('about-portfolio_url')?.value.trim(),
  };

  let error;
  if (existingId) {
    ({ error } = await supabaseClient.from('about').update(payload).eq('id', existingId));
  } else {
    ({ error } = await supabaseClient.from('about').insert(payload));
  }

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity('update', 'about', 'Updated about section');
  showToast('About saved!', 'success');
  loadAbout();
}

// =============================================================================
// 12. SECTION: NEWS
// =============================================================================

let newsItems = [];

async function loadNews() {
  const { data, error } = await supabaseClient.from('news').select('*').order('date', { ascending: false });
  if (error) { showToast('Failed to load news: ' + error.message, 'error'); return; }
  newsItems = data || [];
  renderNewsList(newsItems);
}

function renderNewsList(items) {
  const panel = document.getElementById('panel-news');
  if (!panel) return;

  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) {
    listEl.innerHTML = '<p class="empty-state">No news items yet.</p>';
    return;
  }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.title)}</strong>
        <span class="item-meta">${escHtml(item.date)}</span>
        ${statusBadge(item.status)}
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showNewsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNews('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'news', items);
  initSearch(panel, newsItems, renderNewsList, ['title', 'content']);
}

function showNewsForm(item = null) {
  openModal(
    item ? 'Edit News' : 'Add News',
    `
    <div class="form-group"><label>Title</label><input type="text" id="f-title" value="${escHtml(item?.title || '')}" /></div>
    <div class="form-group"><label>Date</label><input type="date" id="f-date" value="${escHtml(item?.date || '')}" /></div>
    <div class="form-group"><label>Content</label><div id="f-content-editor" class="quill-editor">${item?.content || ''}</div></div>
    <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="f-tags" value="${escHtml(arrayToComma(item?.tags))}" /></div>
    <div class="form-group"><label>Image URL</label><input type="url" id="f-image_url" value="${escHtml(item?.image_url || '')}" /></div>
    <div class="form-group"><label>Status</label>
      <select id="f-status">
        <option value="published" ${item?.status === 'published' ? 'selected' : ''}>Published</option>
        <option value="draft" ${item?.status === 'draft' ? 'selected' : ''}>Draft</option>
      </select>
    </div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
    `,
    () => saveNews()
  );
  setTimeout(() => initQuill('f-content-editor', item?.content || ''), 100);
}

async function saveNews() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    title: document.getElementById('f-title')?.value.trim(),
    date: document.getElementById('f-date')?.value,
    content: getQuillContent('f-content-editor'),
    tags: commaToArray(document.getElementById('f-tags')?.value),
    image_url: document.getElementById('f-image_url')?.value.trim(),
    status: document.getElementById('f-status')?.value,
  };

  const { error } = id
    ? await supabaseClient.from('news').update(payload).eq('id', id)
    : await supabaseClient.from('news').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'news', `${id ? 'Updated' : 'Created'} news: ${payload.title}`);
  showToast('News saved!', 'success');
  closeModal();
  loadNews();
}

async function deleteNews(id) {
  if (!confirm('Delete this news item?')) return;
  const { error } = await supabaseClient.from('news').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'news', `Deleted news id: ${id}`);
  showToast('News deleted.', 'success');
  loadNews();
}

// =============================================================================
// 13. SECTION: EXPERIENCE
// =============================================================================

let experienceItems = [];

async function loadExperience() {
  const { data, error } = await supabaseClient.from('experience').select('*').order('display_order');
  if (error) { showToast('Failed to load experience: ' + error.message, 'error'); return; }
  experienceItems = data || [];
  renderExperienceList(experienceItems);
}

function renderExperienceList(items) {
  const panel = document.getElementById('panel-experience');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No experience entries yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.role)}</strong>
        <span class="item-meta">${escHtml(item.organization)} · ${escHtml(item.period_start)}–${escHtml(item.period_end || 'Present')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showExperienceForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExperience('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'experience', items);
  initSearch(panel, experienceItems, renderExperienceList, ['role', 'organization']);
}

function showExperienceForm(item = null) {
  openModal(item ? 'Edit Experience' : 'Add Experience', `
    <div class="form-group"><label>Role</label><input type="text" id="f-role" value="${escHtml(item?.role || '')}" /></div>
    <div class="form-group"><label>Organization</label><input type="text" id="f-organization" value="${escHtml(item?.organization || '')}" /></div>
    <div class="form-group"><label>Org URL</label><input type="url" id="f-org_url" value="${escHtml(item?.org_url || '')}" /></div>
    <div class="form-group"><label>Location</label><input type="text" id="f-location" value="${escHtml(item?.location || '')}" /></div>
    <div class="form-group"><label>Period Start</label><input type="text" id="f-period_start" placeholder="e.g. Jan 2023" value="${escHtml(item?.period_start || '')}" /></div>
    <div class="form-group"><label>Period End</label><input type="text" id="f-period_end" placeholder="e.g. Dec 2023 or Present" value="${escHtml(item?.period_end || '')}" /></div>
    <div class="form-group"><label>Description</label><div id="f-description-editor" class="quill-editor">${item?.description || ''}</div></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveExperience());
  setTimeout(() => initQuill('f-description-editor', item?.description || ''), 100);
}

async function saveExperience() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    role: document.getElementById('f-role')?.value.trim(),
    organization: document.getElementById('f-organization')?.value.trim(),
    org_url: document.getElementById('f-org_url')?.value.trim(),
    location: document.getElementById('f-location')?.value.trim(),
    period_start: document.getElementById('f-period_start')?.value.trim(),
    period_end: document.getElementById('f-period_end')?.value.trim(),
    description: getQuillContent('f-description-editor'),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('experience').update(payload).eq('id', id)
    : await supabaseClient.from('experience').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'experience', `${id ? 'Updated' : 'Created'}: ${payload.role} at ${payload.organization}`);
  showToast('Experience saved!', 'success');
  closeModal();
  loadExperience();
}

async function deleteExperience(id) {
  if (!confirm('Delete this experience entry?')) return;
  const { error } = await supabaseClient.from('experience').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'experience', `Deleted experience id: ${id}`);
  showToast('Experience deleted.', 'success');
  loadExperience();
}

// =============================================================================
// 14. SECTION: EDUCATION
// =============================================================================

let educationItems = [];

async function loadEducation() {
  const { data, error } = await supabaseClient.from('education').select('*').order('display_order');
  if (error) { showToast('Failed to load education: ' + error.message, 'error'); return; }
  educationItems = data || [];
  renderEducationList(educationItems);
}

function renderEducationList(items) {
  const panel = document.getElementById('panel-education');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No education entries yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.degree)}</strong>
        <span class="item-meta">${escHtml(item.institution)} · GPA: ${escHtml(item.gpa || 'N/A')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showEducationForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEducation('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'education', items);
  initSearch(panel, educationItems, renderEducationList, ['degree', 'institution']);
}

function showEducationForm(item = null) {
  openModal(item ? 'Edit Education' : 'Add Education', `
    <div class="form-group"><label>Degree</label><input type="text" id="f-degree" value="${escHtml(item?.degree || '')}" /></div>
    <div class="form-group"><label>Institution</label><input type="text" id="f-institution" value="${escHtml(item?.institution || '')}" /></div>
    <div class="form-group"><label>Institution URL</label><input type="url" id="f-inst_url" value="${escHtml(item?.inst_url || '')}" /></div>
    <div class="form-group"><label>Location</label><input type="text" id="f-location" value="${escHtml(item?.location || '')}" /></div>
    <div class="form-group"><label>Period</label><input type="text" id="f-period" value="${escHtml(item?.period || '')}" /></div>
    <div class="form-group"><label>GPA</label><input type="text" id="f-gpa" value="${escHtml(item?.gpa || '')}" /></div>
    <div class="form-group"><label>Honor</label><input type="text" id="f-honor" value="${escHtml(item?.honor || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveEducation());
}

async function saveEducation() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    degree: document.getElementById('f-degree')?.value.trim(),
    institution: document.getElementById('f-institution')?.value.trim(),
    inst_url: document.getElementById('f-inst_url')?.value.trim(),
    location: document.getElementById('f-location')?.value.trim(),
    period: document.getElementById('f-period')?.value.trim(),
    gpa: document.getElementById('f-gpa')?.value.trim(),
    honor: document.getElementById('f-honor')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('education').update(payload).eq('id', id)
    : await supabaseClient.from('education').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'education', `${id ? 'Updated' : 'Created'}: ${payload.degree}`);
  showToast('Education saved!', 'success');
  closeModal();
  loadEducation();
}

async function deleteEducation(id) {
  if (!confirm('Delete this education entry?')) return;
  const { error } = await supabaseClient.from('education').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'education', `Deleted education id: ${id}`);
  showToast('Education deleted.', 'success');
  loadEducation();
}

// =============================================================================
// 15. SECTION: PUBLICATIONS
// =============================================================================

let publicationsItems = [];

async function loadPublications() {
  const { data, error } = await supabaseClient.from('publications').select('*').order('display_order');
  if (error) { showToast('Failed to load publications: ' + error.message, 'error'); return; }
  publicationsItems = data || [];
  renderPublicationsList(publicationsItems);
}

function renderPublicationsList(items) {
  const panel = document.getElementById('panel-publications');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No publications yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.title)}</strong>
        <span class="item-meta">${escHtml(item.venue)} · ${item.year || ''}</span>
        ${statusBadge(item.status)}
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showPublicationsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePublications('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'publications', items);
  initSearch(panel, publicationsItems, renderPublicationsList, ['title', 'venue']);
}

function showPublicationsForm(item = null) {
  const statusOptions = ['Published', 'Accepted', 'Under Review', 'Submitted'];
  openModal(item ? 'Edit Publication' : 'Add Publication', `
    <div class="form-group"><label>Title</label><input type="text" id="f-title" value="${escHtml(item?.title || '')}" /></div>
    <div class="form-group"><label>Venue</label><input type="text" id="f-venue" value="${escHtml(item?.venue || '')}" /></div>
    <div class="form-group"><label>Status</label>
      <select id="f-status">${statusOptions.map(s => `<option value="${s}" ${item?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Publisher</label><input type="text" id="f-publisher" value="${escHtml(item?.publisher || '')}" /></div>
    <div class="form-group"><label>URL</label><input type="url" id="f-url" value="${escHtml(item?.url || '')}" /></div>
    <div class="form-group"><label>Author Position</label><input type="text" id="f-author_position" value="${escHtml(item?.author_position || '')}" /></div>
    <div class="form-group"><label>Poster URL</label><input type="url" id="f-poster_url" value="${escHtml(item?.poster_url || '')}" /></div>
    <div class="form-group"><label>Notes</label><div id="f-notes-editor" class="quill-editor">${item?.notes || ''}</div></div>
    <div class="form-group"><label>Year</label><input type="number" id="f-year" value="${item?.year || ''}" /></div>
    <div class="form-group"><label>OpenReview URL</label><input type="url" id="f-openreview_url" value="${escHtml(item?.openreview_url || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => savePublications());
  setTimeout(() => initQuill('f-notes-editor', item?.notes || ''), 100);
}

async function savePublications() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    title: document.getElementById('f-title')?.value.trim(),
    venue: document.getElementById('f-venue')?.value.trim(),
    status: document.getElementById('f-status')?.value,
    publisher: document.getElementById('f-publisher')?.value.trim(),
    url: document.getElementById('f-url')?.value.trim(),
    author_position: document.getElementById('f-author_position')?.value.trim(),
    poster_url: document.getElementById('f-poster_url')?.value.trim(),
    notes: getQuillContent('f-notes-editor'),
    year: parseInt(document.getElementById('f-year')?.value) || null,
    openreview_url: document.getElementById('f-openreview_url')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('publications').update(payload).eq('id', id)
    : await supabaseClient.from('publications').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'publications', `${id ? 'Updated' : 'Created'}: ${payload.title}`);
  showToast('Publication saved!', 'success');
  closeModal();
  loadPublications();
}

async function deletePublications(id) {
  if (!confirm('Delete this publication?')) return;
  const { error } = await supabaseClient.from('publications').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'publications', `Deleted publication id: ${id}`);
  showToast('Publication deleted.', 'success');
  loadPublications();
}

// =============================================================================
// 16. SECTION: PROJECTS
// =============================================================================

let projectsItems = [];

async function loadProjects() {
  const { data, error } = await supabaseClient.from('projects').select('*').order('display_order');
  if (error) { showToast('Failed to load projects: ' + error.message, 'error'); return; }
  projectsItems = data || [];
  renderProjectsList(projectsItems);
}

function renderProjectsList(items) {
  const panel = document.getElementById('panel-projects');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No projects yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.icon || '')} ${escHtml(item.name)}</strong>
        <span class="item-meta">${escHtml(arrayToComma(item.tags))}</span>
        ${statusBadge(item.status)}
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showProjectsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProjects('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'projects', items);
  initSearch(panel, projectsItems, renderProjectsList, ['name', 'description']);
}

function showProjectsForm(item = null) {
  openModal(item ? 'Edit Project' : 'Add Project', `
    <div class="form-group"><label>Name</label><input type="text" id="f-name" value="${escHtml(item?.name || '')}" /></div>
    <div class="form-group"><label>Icon (emoji)</label><input type="text" id="f-icon" value="${escHtml(item?.icon || '')}" /></div>
    <div class="form-group"><label>Description</label><div id="f-description-editor" class="quill-editor">${item?.description || ''}</div></div>
    <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="f-tags" value="${escHtml(arrayToComma(item?.tags))}" /></div>
    <div class="form-group"><label>GitHub URL</label><input type="url" id="f-github_url" value="${escHtml(item?.github_url || '')}" /></div>
    <div class="form-group"><label>Demo URL</label><input type="url" id="f-demo_url" value="${escHtml(item?.demo_url || '')}" /></div>
    <div class="form-group"><label>Live URL</label><input type="url" id="f-live_url" value="${escHtml(item?.live_url || '')}" /></div>
    <div class="form-group"><label>Awards</label><input type="text" id="f-awards" value="${escHtml(item?.awards || '')}" /></div>
    <div class="form-group"><label>Image URL</label><input type="url" id="f-image_url" value="${escHtml(item?.image_url || '')}" /></div>
    <div class="form-group"><label>Status</label>
      <select id="f-status">
        <option value="published" ${item?.status === 'published' ? 'selected' : ''}>Published</option>
        <option value="draft" ${item?.status === 'draft' ? 'selected' : ''}>Draft</option>
      </select>
    </div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveProjects());
  setTimeout(() => initQuill('f-description-editor', item?.description || ''), 100);
}

async function saveProjects() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    name: document.getElementById('f-name')?.value.trim(),
    icon: document.getElementById('f-icon')?.value.trim(),
    description: getQuillContent('f-description-editor'),
    tags: commaToArray(document.getElementById('f-tags')?.value),
    github_url: document.getElementById('f-github_url')?.value.trim(),
    demo_url: document.getElementById('f-demo_url')?.value.trim(),
    live_url: document.getElementById('f-live_url')?.value.trim(),
    awards: document.getElementById('f-awards')?.value.trim(),
    image_url: document.getElementById('f-image_url')?.value.trim(),
    status: document.getElementById('f-status')?.value,
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('projects').update(payload).eq('id', id)
    : await supabaseClient.from('projects').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'projects', `${id ? 'Updated' : 'Created'}: ${payload.name}`);
  showToast('Project saved!', 'success');
  closeModal();
  loadProjects();
}

async function deleteProjects(id) {
  if (!confirm('Delete this project?')) return;
  const { error } = await supabaseClient.from('projects').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'projects', `Deleted project id: ${id}`);
  showToast('Project deleted.', 'success');
  loadProjects();
}

// =============================================================================
// 17. SECTION: SKILLS
// =============================================================================

let skillsItems = [];

async function loadSkills() {
  const { data, error } = await supabaseClient.from('skills').select('*').order('display_order');
  if (error) { showToast('Failed to load skills: ' + error.message, 'error'); return; }
  skillsItems = data || [];
  renderSkillsList(skillsItems);
}

function renderSkillsList(items) {
  const panel = document.getElementById('panel-skills');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No skill categories yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.category)}</strong>
        <span class="item-meta">${(item.items || []).length} items</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showSkillsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSkills('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'skills', items);
  initSearch(panel, skillsItems, renderSkillsList, ['category']);
}

function showSkillsForm(item = null) {
  openModal(item ? 'Edit Skill Category' : 'Add Skill Category', `
    <div class="form-group"><label>Category</label><input type="text" id="f-category" value="${escHtml(item?.category || '')}" /></div>
    <div class="form-group"><label>Items (comma-separated)</label><input type="text" id="f-items" value="${escHtml(arrayToComma(item?.items))}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveSkills());
}

async function saveSkills() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    category: document.getElementById('f-category')?.value.trim(),
    items: commaToArray(document.getElementById('f-items')?.value),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('skills').update(payload).eq('id', id)
    : await supabaseClient.from('skills').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'skills', `${id ? 'Updated' : 'Created'}: ${payload.category}`);
  showToast('Skills saved!', 'success');
  closeModal();
  loadSkills();
}

async function deleteSkills(id) {
  if (!confirm('Delete this skill category?')) return;
  const { error } = await supabaseClient.from('skills').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'skills', `Deleted skill category id: ${id}`);
  showToast('Skill category deleted.', 'success');
  loadSkills();
}

// =============================================================================
// 18. SECTION: AWARDS
// =============================================================================

let awardsItems = [];

async function loadAwards() {
  const { data, error } = await supabaseClient.from('awards').select('*').order('display_order');
  if (error) { showToast('Failed to load awards: ' + error.message, 'error'); return; }
  awardsItems = data || [];
  renderAwardsList(awardsItems);
}

function renderAwardsList(items) {
  const panel = document.getElementById('panel-awards');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No awards yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.title)}</strong>
        <span class="item-meta">${item.year || ''}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showAwardsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAwards('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'awards', items);
  initSearch(panel, awardsItems, renderAwardsList, ['title']);
}

function showAwardsForm(item = null) {
  openModal(item ? 'Edit Award' : 'Add Award', `
    <div class="form-group"><label>Title</label><input type="text" id="f-title" value="${escHtml(item?.title || '')}" /></div>
    <div class="form-group"><label>Description</label><div id="f-description-editor" class="quill-editor">${item?.description || ''}</div></div>
    <div class="form-group"><label>Year</label><input type="number" id="f-year" value="${item?.year || ''}" /></div>
    <div class="form-group"><label>URL</label><input type="url" id="f-url" value="${escHtml(item?.url || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveAwards());
  setTimeout(() => initQuill('f-description-editor', item?.description || ''), 100);
}

async function saveAwards() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    title: document.getElementById('f-title')?.value.trim(),
    description: getQuillContent('f-description-editor'),
    year: parseInt(document.getElementById('f-year')?.value) || null,
    url: document.getElementById('f-url')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('awards').update(payload).eq('id', id)
    : await supabaseClient.from('awards').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'awards', `${id ? 'Updated' : 'Created'}: ${payload.title}`);
  showToast('Award saved!', 'success');
  closeModal();
  loadAwards();
}

async function deleteAwards(id) {
  if (!confirm('Delete this award?')) return;
  const { error } = await supabaseClient.from('awards').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'awards', `Deleted award id: ${id}`);
  showToast('Award deleted.', 'success');
  loadAwards();
}

// =============================================================================
// 19. SECTION: CERTIFICATES
// =============================================================================

let certificatesItems = [];

async function loadCertificates() {
  const { data, error } = await supabaseClient.from('certificates').select('*').order('display_order');
  if (error) { showToast('Failed to load certificates: ' + error.message, 'error'); return; }
  certificatesItems = data || [];
  renderCertificatesList(certificatesItems);
}

function renderCertificatesList(items) {
  const panel = document.getElementById('panel-certificates');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No certificates yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.label)}</strong>
        <span class="item-meta">${escHtml(item.type || '')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showCertificatesForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCertificates('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'certificates', items);
  initSearch(panel, certificatesItems, renderCertificatesList, ['label', 'type']);
}

function showCertificatesForm(item = null) {
  openModal(item ? 'Edit Certificate' : 'Add Certificate', `
    <div class="form-group"><label>Label</label><input type="text" id="f-label" value="${escHtml(item?.label || '')}" /></div>
    <div class="form-group"><label>File URL</label><input type="url" id="f-file_url" value="${escHtml(item?.file_url || '')}" /></div>
    <div class="form-group"><label>Type</label><input type="text" id="f-type" placeholder="e.g. PDF, Image" value="${escHtml(item?.type || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <div class="form-group"><label>Or Upload PDF</label><input type="file" id="f-file-upload" accept=".pdf" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveCertificates());
}

async function saveCertificates() {
  const id = document.getElementById('f-id')?.value;
  let file_url = document.getElementById('f-file_url')?.value.trim();

  const fileInput = document.getElementById('f-file-upload');
  if (fileInput?.files?.length) {
    try {
      file_url = await uploadFile(fileInput.files[0], 'portfolio-pdfs', 'certificates');
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
      return;
    }
  }

  const payload = {
    label: document.getElementById('f-label')?.value.trim(),
    file_url,
    type: document.getElementById('f-type')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('certificates').update(payload).eq('id', id)
    : await supabaseClient.from('certificates').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'certificates', `${id ? 'Updated' : 'Created'}: ${payload.label}`);
  showToast('Certificate saved!', 'success');
  closeModal();
  loadCertificates();
}

async function deleteCertificates(id) {
  if (!confirm('Delete this certificate?')) return;
  const { error } = await supabaseClient.from('certificates').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'certificates', `Deleted certificate id: ${id}`);
  showToast('Certificate deleted.', 'success');
  loadCertificates();
}

// =============================================================================
// 20. SECTION: COMPETITIVE PROGRAMMING
// =============================================================================

let competitiveProgrammingItems = [];

async function loadCompetitiveProgramming() {
  const { data, error } = await supabaseClient.from('competitive_programming').select('*').order('display_order');
  if (error) { showToast('Failed to load competitive programming: ' + error.message, 'error'); return; }
  competitiveProgrammingItems = data || [];
  renderCompetitiveProgrammingList(competitiveProgrammingItems);
}

function renderCompetitiveProgrammingList(items) {
  const panel = document.getElementById('panel-competitive_programming');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No CP profiles yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.platform)}</strong>
        <span class="item-meta">${escHtml(item.handle)}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showCompetitiveProgrammingForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCompetitiveProgramming('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'competitive_programming', items);
  initSearch(panel, competitiveProgrammingItems, renderCompetitiveProgrammingList, ['platform', 'handle']);
}

function showCompetitiveProgrammingForm(item = null) {
  openModal(item ? 'Edit CP Profile' : 'Add CP Profile', `
    <div class="form-group"><label>Platform</label><input type="text" id="f-platform" value="${escHtml(item?.platform || '')}" /></div>
    <div class="form-group"><label>Handle</label><input type="text" id="f-handle" value="${escHtml(item?.handle || '')}" /></div>
    <div class="form-group"><label>URL</label><input type="url" id="f-url" value="${escHtml(item?.url || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveCompetitiveProgramming());
}

async function saveCompetitiveProgramming() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    platform: document.getElementById('f-platform')?.value.trim(),
    handle: document.getElementById('f-handle')?.value.trim(),
    url: document.getElementById('f-url')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('competitive_programming').update(payload).eq('id', id)
    : await supabaseClient.from('competitive_programming').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'competitive_programming', `${id ? 'Updated' : 'Created'}: ${payload.platform}`);
  showToast('CP Profile saved!', 'success');
  closeModal();
  loadCompetitiveProgramming();
}

async function deleteCompetitiveProgramming(id) {
  if (!confirm('Delete this CP profile?')) return;
  const { error } = await supabaseClient.from('competitive_programming').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'competitive_programming', `Deleted CP profile id: ${id}`);
  showToast('CP profile deleted.', 'success');
  loadCompetitiveProgramming();
}

// =============================================================================
// 21. SECTION: CP META (single-row edit form)
// =============================================================================

async function loadCpMeta() {
  const { data, error } = await supabaseClient.from('cp_meta').select('*').limit(1).maybeSingle();
  if (error) { showToast('Failed to load CP meta: ' + error.message, 'error'); return; }
  renderCpMetaForm(data);
}

function renderCpMetaForm(item = null) {
  const panel = document.getElementById('panel-cp_meta');
  if (!panel) return;
  panel.innerHTML = `
    <div class="section-header"><h2>CP Meta</h2></div>
    <form id="cp-meta-form" class="edit-form">
      <div class="form-group"><label>Problems Solved</label><input type="text" id="cpm-problems_solved" value="${escHtml(item?.problems_solved || '')}" /></div>
      <div class="form-group"><label>NASA Team</label><input type="text" id="cpm-nasa_team" value="${escHtml(item?.nasa_team || '')}" /></div>
      <div class="form-group"><label>NASA Role</label><input type="text" id="cpm-nasa_role" value="${escHtml(item?.nasa_role || '')}" /></div>
      <div class="form-group"><label>NASA Project</label><input type="text" id="cpm-nasa_project" value="${escHtml(item?.nasa_project || '')}" /></div>
      <div class="form-group"><label>NASA Location</label><input type="text" id="cpm-nasa_location" value="${escHtml(item?.nasa_location || '')}" /></div>
      <div class="form-group"><label>NASA Track</label><input type="text" id="cpm-nasa_track" value="${escHtml(item?.nasa_track || '')}" /></div>
      <div class="form-actions">
        <button type="button" id="cpm-save-btn" class="btn btn-primary">Save CP Meta</button>
      </div>
    </form>
  `;
  document.getElementById('cpm-save-btn').addEventListener('click', () => saveCpMeta(item?.id));
}

async function saveCpMeta(existingId = null) {
  const payload = {
    problems_solved: document.getElementById('cpm-problems_solved')?.value.trim(),
    nasa_team: document.getElementById('cpm-nasa_team')?.value.trim(),
    nasa_role: document.getElementById('cpm-nasa_role')?.value.trim(),
    nasa_project: document.getElementById('cpm-nasa_project')?.value.trim(),
    nasa_location: document.getElementById('cpm-nasa_location')?.value.trim(),
    nasa_track: document.getElementById('cpm-nasa_track')?.value.trim(),
  };

  let error;
  if (existingId) {
    ({ error } = await supabaseClient.from('cp_meta').update(payload).eq('id', existingId));
  } else {
    ({ error } = await supabaseClient.from('cp_meta').insert(payload));
  }

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity('update', 'cp_meta', 'Updated CP Meta');
  showToast('CP Meta saved!', 'success');
  loadCpMeta();
}

// =============================================================================
// 22. SECTION: CONTESTS
// =============================================================================

let contestsItems = [];

async function loadContests() {
  const { data, error } = await supabaseClient.from('contests').select('*').order('display_order');
  if (error) { showToast('Failed to load contests: ' + error.message, 'error'); return; }
  contestsItems = data || [];
  renderContestsList(contestsItems);
}

function renderContestsList(items) {
  const panel = document.getElementById('panel-contests');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No contests yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.name)}</strong>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showContestsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContests('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'contests', items);
  initSearch(panel, contestsItems, renderContestsList, ['name']);
}

function showContestsForm(item = null) {
  openModal(item ? 'Edit Contest' : 'Add Contest', `
    <div class="form-group"><label>Name</label><input type="text" id="f-name" value="${escHtml(item?.name || '')}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveContests());
}

async function saveContests() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    name: document.getElementById('f-name')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('contests').update(payload).eq('id', id)
    : await supabaseClient.from('contests').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'contests', `${id ? 'Updated' : 'Created'}: ${payload.name}`);
  showToast('Contest saved!', 'success');
  closeModal();
  loadContests();
}

async function deleteContests(id) {
  if (!confirm('Delete this contest?')) return;
  const { error } = await supabaseClient.from('contests').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'contests', `Deleted contest id: ${id}`);
  showToast('Contest deleted.', 'success');
  loadContests();
}

// =============================================================================
// 23. SECTION: HACKATHONS
// =============================================================================

let hackathonsItems = [];

async function loadHackathons() {
  const { data, error } = await supabaseClient.from('hackathons').select('*').order('display_order');
  if (error) { showToast('Failed to load hackathons: ' + error.message, 'error'); return; }
  hackathonsItems = data || [];
  renderHackathonsList(hackathonsItems);
}

function renderHackathonsList(items) {
  const panel = document.getElementById('panel-hackathons');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No hackathons yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.name)}</strong>
        <span class="item-meta">${escHtml(item.team || '')} · ${item.year || ''}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showHackathonsForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteHackathons('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'hackathons', items);
  initSearch(panel, hackathonsItems, renderHackathonsList, ['name', 'team']);
}

function showHackathonsForm(item = null) {
  openModal(item ? 'Edit Hackathon' : 'Add Hackathon', `
    <div class="form-group"><label>Name</label><input type="text" id="f-name" value="${escHtml(item?.name || '')}" /></div>
    <div class="form-group"><label>Team</label><input type="text" id="f-team" value="${escHtml(item?.team || '')}" /></div>
    <div class="form-group"><label>Role</label><input type="text" id="f-role" value="${escHtml(item?.role || '')}" /></div>
    <div class="form-group"><label>Location</label><input type="text" id="f-location" value="${escHtml(item?.location || '')}" /></div>
    <div class="form-group"><label>Year</label><input type="number" id="f-year" value="${item?.year || ''}" /></div>
    <div class="form-group"><label>Description</label><div id="f-description-editor" class="quill-editor">${item?.description || ''}</div></div>
    <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="f-tags" value="${escHtml(arrayToComma(item?.tags))}" /></div>
    <div class="form-group"><label>Links (JSON)</label><textarea id="f-links" rows="4">${item?.links ? JSON.stringify(item.links, null, 2) : '[]'}</textarea></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveHackathons());
  setTimeout(() => initQuill('f-description-editor', item?.description || ''), 100);
}

async function saveHackathons() {
  const id = document.getElementById('f-id')?.value;
  let links = [];
  try {
    links = JSON.parse(document.getElementById('f-links')?.value || '[]');
  } catch (_) {
    showToast('Links JSON is invalid.', 'error');
    return;
  }

  const payload = {
    name: document.getElementById('f-name')?.value.trim(),
    team: document.getElementById('f-team')?.value.trim(),
    role: document.getElementById('f-role')?.value.trim(),
    location: document.getElementById('f-location')?.value.trim(),
    year: parseInt(document.getElementById('f-year')?.value) || null,
    description: getQuillContent('f-description-editor'),
    tags: commaToArray(document.getElementById('f-tags')?.value),
    links,
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('hackathons').update(payload).eq('id', id)
    : await supabaseClient.from('hackathons').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'hackathons', `${id ? 'Updated' : 'Created'}: ${payload.name}`);
  showToast('Hackathon saved!', 'success');
  closeModal();
  loadHackathons();
}

async function deleteHackathons(id) {
  if (!confirm('Delete this hackathon?')) return;
  const { error } = await supabaseClient.from('hackathons').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'hackathons', `Deleted hackathon id: ${id}`);
  showToast('Hackathon deleted.', 'success');
  loadHackathons();
}

// =============================================================================
// 24. SECTION: COURSEWORK
// =============================================================================

let courseworkItems = [];

async function loadCoursework() {
  const { data, error } = await supabaseClient.from('coursework').select('*').order('display_order');
  if (error) { showToast('Failed to load coursework: ' + error.message, 'error'); return; }
  courseworkItems = data || [];
  renderCourseworkList(courseworkItems);
}

function renderCourseworkList(items) {
  const panel = document.getElementById('panel-coursework');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No coursework categories yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.category)}</strong>
        <span class="item-meta">${(item.courses || []).length} courses</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showCourseworkForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCoursework('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'coursework', items);
  initSearch(panel, courseworkItems, renderCourseworkList, ['category']);
}

function showCourseworkForm(item = null) {
  openModal(item ? 'Edit Coursework' : 'Add Coursework', `
    <div class="form-group"><label>Category</label><input type="text" id="f-category" value="${escHtml(item?.category || '')}" /></div>
    <div class="form-group"><label>Courses (comma-separated)</label><textarea id="f-courses" rows="4">${escHtml(arrayToComma(item?.courses))}</textarea></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveCoursework());
}

async function saveCoursework() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    category: document.getElementById('f-category')?.value.trim(),
    courses: commaToArray(document.getElementById('f-courses')?.value),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('coursework').update(payload).eq('id', id)
    : await supabaseClient.from('coursework').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'coursework', `${id ? 'Updated' : 'Created'}: ${payload.category}`);
  showToast('Coursework saved!', 'success');
  closeModal();
  loadCoursework();
}

async function deleteCoursework(id) {
  if (!confirm('Delete this coursework category?')) return;
  const { error } = await supabaseClient.from('coursework').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'coursework', `Deleted coursework id: ${id}`);
  showToast('Coursework deleted.', 'success');
  loadCoursework();
}

// =============================================================================
// 25. SECTION: CONTACT PROFILES
// =============================================================================

let contactProfilesItems = [];

async function loadContactProfiles() {
  const { data, error } = await supabaseClient.from('contact_profiles').select('*').order('display_order');
  if (error) { showToast('Failed to load contact profiles: ' + error.message, 'error'); return; }
  contactProfilesItems = data || [];
  renderContactProfilesList(contactProfilesItems);
}

function renderContactProfilesList(items) {
  const panel = document.getElementById('panel-contact_profiles');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No contact profiles yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.platform)}</strong>
        <span class="item-meta">${escHtml(item.handle || item.label || '')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showContactProfilesForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContactProfiles('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'contact_profiles', items);
  initSearch(panel, contactProfilesItems, renderContactProfilesList, ['platform', 'label', 'handle']);
}

function showContactProfilesForm(item = null) {
  openModal(item ? 'Edit Contact Profile' : 'Add Contact Profile', `
    <div class="form-group"><label>Platform</label><input type="text" id="f-platform" value="${escHtml(item?.platform || '')}" /></div>
    <div class="form-group"><label>Label</label><input type="text" id="f-label" value="${escHtml(item?.label || '')}" /></div>
    <div class="form-group"><label>URL</label><input type="url" id="f-url" value="${escHtml(item?.url || '')}" /></div>
    <div class="form-group"><label>Handle</label><input type="text" id="f-handle" value="${escHtml(item?.handle || '')}" /></div>
    <div class="form-group"><label>Icon (class or emoji)</label><input type="text" id="f-icon" value="${escHtml(item?.icon || '')}" /></div>
    <div class="form-group"><label>Color (hex)</label><input type="color" id="f-color" value="${item?.color || '#000000'}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveContactProfiles());
}

async function saveContactProfiles() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    platform: document.getElementById('f-platform')?.value.trim(),
    label: document.getElementById('f-label')?.value.trim(),
    url: document.getElementById('f-url')?.value.trim(),
    handle: document.getElementById('f-handle')?.value.trim(),
    icon: document.getElementById('f-icon')?.value.trim(),
    color: document.getElementById('f-color')?.value,
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('contact_profiles').update(payload).eq('id', id)
    : await supabaseClient.from('contact_profiles').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'contact_profiles', `${id ? 'Updated' : 'Created'}: ${payload.platform}`);
  showToast('Contact profile saved!', 'success');
  closeModal();
  loadContactProfiles();
}

async function deleteContactProfiles(id) {
  if (!confirm('Delete this contact profile?')) return;
  const { error } = await supabaseClient.from('contact_profiles').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'contact_profiles', `Deleted contact profile id: ${id}`);
  showToast('Contact profile deleted.', 'success');
  loadContactProfiles();
}

// =============================================================================
// 26. SECTION: VOLUNTEERING
// =============================================================================

let volunteeringItems = [];

async function loadVolunteering() {
  const { data, error } = await supabaseClient.from('volunteering').select('*').order('display_order');
  if (error) { showToast('Failed to load volunteering: ' + error.message, 'error'); return; }
  volunteeringItems = data || [];
  renderVolunteeringList(volunteeringItems);
}

function renderVolunteeringList(items) {
  const panel = document.getElementById('panel-volunteering');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No volunteering entries yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.org)}</strong>
        <span class="item-meta">${escHtml(item.role || '')} · ${escHtml(item.period || '')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showVolunteeringForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVolunteering('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'volunteering', items);
  initSearch(panel, volunteeringItems, renderVolunteeringList, ['org', 'role']);
}

function showVolunteeringForm(item = null) {
  openModal(item ? 'Edit Volunteering' : 'Add Volunteering', `
    <div class="form-group"><label>Organization</label><input type="text" id="f-org" value="${escHtml(item?.org || '')}" /></div>
    <div class="form-group"><label>Role</label><input type="text" id="f-role" value="${escHtml(item?.role || '')}" /></div>
    <div class="form-group"><label>Period</label><input type="text" id="f-period" value="${escHtml(item?.period || '')}" /></div>
    <div class="form-group"><label>Description</label><div id="f-description-editor" class="quill-editor">${item?.description || ''}</div></div>
    <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="f-tags" value="${escHtml(arrayToComma(item?.tags))}" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveVolunteering());
  setTimeout(() => initQuill('f-description-editor', item?.description || ''), 100);
}

async function saveVolunteering() {
  const id = document.getElementById('f-id')?.value;
  const payload = {
    org: document.getElementById('f-org')?.value.trim(),
    role: document.getElementById('f-role')?.value.trim(),
    period: document.getElementById('f-period')?.value.trim(),
    description: getQuillContent('f-description-editor'),
    tags: commaToArray(document.getElementById('f-tags')?.value),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('volunteering').update(payload).eq('id', id)
    : await supabaseClient.from('volunteering').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'volunteering', `${id ? 'Updated' : 'Created'}: ${payload.org}`);
  showToast('Volunteering saved!', 'success');
  closeModal();
  loadVolunteering();
}

async function deleteVolunteering(id) {
  if (!confirm('Delete this volunteering entry?')) return;
  const { error } = await supabaseClient.from('volunteering').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'volunteering', `Deleted volunteering id: ${id}`);
  showToast('Volunteering deleted.', 'success');
  loadVolunteering();
}

// =============================================================================
// 27. SECTION: MEDIA
// =============================================================================

let mediaItems = [];

async function loadMedia() {
  const { data, error } = await supabaseClient.from('media').select('*').order('display_order');
  if (error) { showToast('Failed to load media: ' + error.message, 'error'); return; }
  mediaItems = data || [];
  renderMediaList(mediaItems);
}

function renderMediaList(items) {
  const panel = document.getElementById('panel-media');
  if (!panel) return;
  const listEl = panel.querySelector('.items-list');
  if (!listEl) return;

  if (!items.length) { listEl.innerHTML = '<p class="empty-state">No media items yet.</p>'; return; }

  listEl.innerHTML = items.map(item => `
    <div class="item-card" data-id="${item.id}">
      <span class="drag-handle">⠿</span>
      <div class="item-info">
        <strong>${escHtml(item.title)}</strong>
        <span class="item-meta badge badge-info">${escHtml(item.type || 'video')}</span>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-secondary" onclick="showMediaForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMedia('${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  initSortable(listEl, 'media', items);
  initSearch(panel, mediaItems, renderMediaList, ['title', 'type']);
}

function showMediaForm(item = null) {
  openModal(item ? 'Edit Media' : 'Add Media', `
    <div class="form-group"><label>Title</label><input type="text" id="f-title" value="${escHtml(item?.title || '')}" /></div>
    <div class="form-group"><label>URL</label><input type="url" id="f-url" value="${escHtml(item?.url || '')}" /></div>
    <div class="form-group"><label>Type</label>
      <select id="f-type">
        <option value="video" ${item?.type === 'video' ? 'selected' : ''}>Video</option>
        <option value="image" ${item?.type === 'image' ? 'selected' : ''}>Image</option>
      </select>
    </div>
    <div class="form-group"><label>Thumbnail URL</label><input type="url" id="f-thumbnail_url" value="${escHtml(item?.thumbnail_url || '')}" /></div>
    <div class="form-group"><label>Or Upload Media File</label><input type="file" id="f-media-upload" accept="image/*,video/*" /></div>
    <div class="form-group"><label>Display Order</label><input type="number" id="f-display_order" value="${item?.display_order ?? 0}" /></div>
    <input type="hidden" id="f-id" value="${item?.id || ''}" />
  `, () => saveMedia());
}

async function saveMedia() {
  const id = document.getElementById('f-id')?.value;
  let url = document.getElementById('f-url')?.value.trim();

  const fileInput = document.getElementById('f-media-upload');
  if (fileInput?.files?.length) {
    try {
      url = await uploadFile(fileInput.files[0], 'portfolio-media', 'media');
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
      return;
    }
  }

  const payload = {
    title: document.getElementById('f-title')?.value.trim(),
    url,
    type: document.getElementById('f-type')?.value,
    thumbnail_url: document.getElementById('f-thumbnail_url')?.value.trim(),
    display_order: parseInt(document.getElementById('f-display_order')?.value) || 0,
  };

  const { error } = id
    ? await supabaseClient.from('media').update(payload).eq('id', id)
    : await supabaseClient.from('media').insert(payload);

  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  await logActivity(id ? 'update' : 'create', 'media', `${id ? 'Updated' : 'Created'}: ${payload.title}`);
  showToast('Media saved!', 'success');
  closeModal();
  loadMedia();
}

async function deleteMedia(id) {
  if (!confirm('Delete this media item?')) return;
  const { error } = await supabaseClient.from('media').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  await logActivity('delete', 'media', `Deleted media id: ${id}`);
  showToast('Media deleted.', 'success');
  loadMedia();
}

// =============================================================================
// 28. CLIENT-SIDE SEARCH / FILTER
// =============================================================================

function initSearch(panel, allItems, renderFn, searchFields) {
  const searchInput = panel.querySelector('.search-input');
  if (!searchInput) return;
  // Remove previous listener by replacing element
  const newInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newInput, searchInput);
  newInput.addEventListener('input', (e) => {
    const filtered = filterItems(allItems, e.target.value.trim(), searchFields);
    renderFn(filtered);
  });
}

// =============================================================================
// 29. ADD ITEM BUTTONS — wire up per-panel "Add" buttons
// =============================================================================

function initAddButtons() {
  const addButtonMap = {
    'add-news-btn': () => showNewsForm(),
    'add-experience-btn': () => showExperienceForm(),
    'add-education-btn': () => showEducationForm(),
    'add-publications-btn': () => showPublicationsForm(),
    'add-projects-btn': () => showProjectsForm(),
    'add-skills-btn': () => showSkillsForm(),
    'add-awards-btn': () => showAwardsForm(),
    'add-certificates-btn': () => showCertificatesForm(),
    'add-competitive_programming-btn': () => showCompetitiveProgrammingForm(),
    'add-contests-btn': () => showContestsForm(),
    'add-hackathons-btn': () => showHackathonsForm(),
    'add-coursework-btn': () => showCourseworkForm(),
    'add-contact_profiles-btn': () => showContactProfilesForm(),
    'add-volunteering-btn': () => showVolunteeringForm(),
    'add-media-btn': () => showMediaForm(),
    'export-backup-btn': () => exportBackup(),
  };

  for (const [id, handler] of Object.entries(addButtonMap)) {
    document.getElementById(id)?.addEventListener('click', handler);
  }
}

// =============================================================================
// 30. LOGIN FORM HANDLER
// =============================================================================

function initLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const pwInput = document.getElementById('login-password');

  // Clear errors when user types
  emailInput?.addEventListener('input', () => setLoginError(''));
  pwInput?.addEventListener('input', () => setLoginError(''));

  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoginError('');
    const email = emailInput?.value.trim();
    const password = pwInput?.value;
    const btn = document.getElementById('login-submit-btn');
    if (btn) btn.disabled = true;
    try {
      await signIn(email, password);
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// =============================================================================
// 31. AUTH STATE CHANGE LISTENER
// =============================================================================

function initAuthStateChange() {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      showDashboard();
    } else if (event === 'SIGNED_OUT') {
      showLoginPage();
    }
  });
}

// =============================================================================
// 32. APPLICATION BOOTSTRAP
// =============================================================================

async function init() {
  initAuthStateChange();
  initLoginForm();
  initNavigation();
  initAddButtons();

  // Check existing session
  const session = await getSession();
  if (session) {
    showDashboard();
  } else {
    showLoginPage();
  }
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
