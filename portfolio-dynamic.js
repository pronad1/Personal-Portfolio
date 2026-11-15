// =============================================================================
// Prosenjit Mondol — Dynamic Portfolio Loader (Supabase Backend)
// Dynamically syncs public portfolio content from Supabase.
// Falls back gracefully to static HTML if Supabase is offline or unconfigured.
// =============================================================================
// SETUP: Add these two script tags before </body> in index.html:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
// <script src="portfolio-dynamic.js"></script>
// =============================================================================

(function () {
  'use strict';

  // ── CONFIGURATION ──────────────────────────────────────────
  // Replace these with your actual Supabase credentials from Project Settings -> API
  const SUPABASE_URL = 'YOUR_SUPABASE_URL';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

  const isSupabaseConfigured =
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_URL.startsWith('http') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
    typeof window.supabase !== 'undefined';

  let _realSupabase = null;
  if (isSupabaseConfigured) {
    try {
      _realSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
    }
  }

  // Client proxy: uses live Supabase when configured, or reads from localStorage / data/portfolio-data.json
  let _fileTables = null;
  async function loadFallbackData() {
    if (_fileTables !== null) return;
    try {
      const res = await fetch('data/portfolio-data.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        _fileTables = json?.tables || {};
      } else {
        _fileTables = {};
      }
    } catch (_) {
      _fileTables = {};
    }
  }

  const supabase = {
    from(table) {
      if (_realSupabase) {
        return _realSupabase.from(table);
      }
      return {
        select(cols) {
          const raw = localStorage.getItem(`prosen_cms_${table}`);
          let items = [];
          if (raw) {
            try { items = JSON.parse(raw); } catch (_) {}
          } else if (_fileTables && _fileTables[table]) {
            items = _fileTables[table];
          }
          const builder = {
            eq(col, val) {
              items = items.filter(it => it[col] === val);
              return builder;
            },
            order(col, opts = { ascending: true }) {
              items.sort((a, b) => {
                if (a[col] < b[col]) return opts.ascending ? -1 : 1;
                if (a[col] > b[col]) return opts.ascending ? 1 : -1;
                return 0;
              });
              return builder;
            },
            limit(n) {
              items = items.slice(0, n);
              return builder;
            },
            maybeSingle() {
              return Promise.resolve({ data: items[0] || null, error: null });
            },
            then(resolve) {
              resolve({ data: items, error: null });
            }
          };
          return builder;
        }
      };
    }
  };

  // Helper: Escape HTML to prevent XSS
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =============================================================================
  // 1. ABOUT ME SECTION
  // =============================================================================
  async function loadAbout() {
    try {
      const { data, error } = await supabase.from('about').select('*').limit(1).maybeSingle();
      if (error || !data) return;

      const aboutSec = document.getElementById('about');
      if (!aboutSec) return;

      if (data.name) {
        const greeting = aboutSec.querySelector('.about-greeting');
        if (greeting) greeting.innerHTML = `Hi, I'm <span>${escHtml(data.name)}</span> 👋`;
      }
      if (data.open_to) {
        const badge = aboutSec.querySelector('.about-badge');
        if (badge) {
          badge.innerHTML = `<i class="fa-solid fa-circle" style="color:#22c55e;font-size:0.55rem;"></i> ${escHtml(data.open_to)}`;
        }
      }
      if (data.bio) {
        const bioEl = aboutSec.querySelector('.about-bio');
        if (bioEl) {
          if (data.bio.includes('<p>') || data.bio.includes('<div>')) {
            bioEl.innerHTML = data.bio;
          } else {
            bioEl.textContent = data.bio;
          }
        }
      }
    } catch (e) {
      console.warn('Dynamic load error (about):', e);
    }
  }

  // =============================================================================
  // 2. NEWS & UPDATES SECTION
  // =============================================================================
  async function loadNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: false });

      if (error || !data || !data.length) return;

      const box = document.querySelector('#news .news-box');
      if (!box) return;

      box.innerHTML = data
        .map((item, idx) => {
          const isHighlight = idx === 0 ? ' highlight' : '';
          const badgeHtml = idx === 0 ? '<div class="news-highlight-badge">⭐ Highlight</div>' : '';
          const imgHtml = item.image_url
            ? `<div class="news-img" style="margin-top:10px;"><img src="${escHtml(item.image_url)}" style="max-width:100%;border-radius:6px;" alt="News image" /></div>`
            : '';

          return `
            <div class="news-item${isHighlight}">
              <span class="news-date">${escHtml(item.date)}</span>
              <div class="news-text">
                ${badgeHtml}
                <strong>${escHtml(item.title)}</strong>
                <p style="margin-top:4px;font-size:0.84rem;color:var(--text-muted);">${item.content || ''}</p>
                ${imgHtml}
              </div>
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (news):', e);
    }
  }

  // =============================================================================
  // 3. WORK EXPERIENCE SECTION
  // =============================================================================
  async function loadExperience() {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const sec = document.getElementById('experience');
      if (!sec) return;

      // Remove existing exp-items
      sec.querySelectorAll('.exp-item').forEach(el => el.remove());

      const expHtml = data
        .map(exp => `
          <div class="exp-item">
            <div class="exp-dot-col">
              <div class="exp-dot"></div>
              <div class="exp-line"></div>
            </div>
            <div class="exp-body">
              <div class="exp-role">${escHtml(exp.role)}</div>
              <div class="exp-org">
                ${exp.org_url ? `<a href="${escHtml(exp.org_url)}" target="_blank">${escHtml(exp.organization)}</a>` : escHtml(exp.organization)}
              </div>
              ${exp.location ? `<div class="exp-loc"><i class="fa-solid fa-location-dot fa-xs"></i> ${escHtml(exp.location)}</div>` : ''}
              <span class="exp-date">${escHtml(exp.period_start || '')}${exp.period_end ? ' – ' + escHtml(exp.period_end) : ''}</span>
              <div class="exp-desc">${exp.description || ''}</div>
            </div>
          </div>
        `)
        .join('');

      sec.insertAdjacentHTML('beforeend', expHtml);
    } catch (e) {
      console.warn('Dynamic load error (experience):', e);
    }
  }

  // =============================================================================
  // 4. EDUCATION SECTION
  // =============================================================================
  async function loadEducation() {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const sec = document.getElementById('education');
      if (!sec) return;

      sec.querySelectorAll('.edu-item').forEach(el => el.remove());

      const eduHtml = data
        .map((edu, idx) => {
          const iconClass = idx === 0 ? 'fa-university' : idx === 1 ? 'fa-building-columns' : 'fa-school';
          const instLink = edu.inst_url
            ? `<a href="${escHtml(edu.inst_url)}" target="_blank">${escHtml(edu.institution)}</a>`
            : escHtml(edu.institution);

          const gpaVal = edu.gpa || edu.cgpa || '';
          const honorBadge = edu.honor
            ? `<span class="edu-gpa">🏅 ${escHtml(edu.honor)}${gpaVal ? ' · CGPA: ' + escHtml(gpaVal) : ''}</span>`
            : gpaVal
            ? `<span class="edu-gpa" style="background:#fef9c3;color:#b45309;">✨ GPA: ${escHtml(gpaVal)}</span>`
            : '';

          const creditsHtml = edu.credits
            ? `<div class="edu-detail">Credits Completed: ${escHtml(edu.credits)}</div>`
            : '';

          return `
            <div class="edu-item">
              <div class="edu-icon"><i class="fa-solid ${iconClass}"></i></div>
              <div class="edu-body">
                <div class="edu-degree">${escHtml(edu.degree)}</div>
                <div class="edu-school">${instLink}</div>
                <div class="edu-detail">${escHtml(edu.period || '')}${edu.location ? ' &nbsp;·&nbsp; ' + escHtml(edu.location) : ''}</div>
                ${creditsHtml}
                ${honorBadge}
              </div>
            </div>
          `;
        })
        .join('');

      sec.insertAdjacentHTML('beforeend', eduHtml);
    } catch (e) {
      console.warn('Dynamic load error (education):', e);
    }
  }

  // =============================================================================
  // 5. PUBLICATIONS SECTION
  // =============================================================================
  async function loadPublications() {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const sec = document.getElementById('publications');
      if (!sec) return;

      sec.querySelectorAll('.pub-item').forEach(el => el.remove());

      const pubHtml = data
        .map((pub, idx) => {
          const num = String(idx + 1).padStart(2, '0');
          const isPresented = pub.status === 'Physically Presented';
          const isPublished = pub.status === 'Published';
          const isReview = pub.status === 'Under Review';

          let statusClass = 'pub-status';
          let statusStyle = '';
          let statusIcon = '📄 ';

          if (isPresented) {
            statusClass += ' presented';
            statusStyle = 'style="background:#fef3c7;color:#92400e;border-color:#fde68a;"';
            statusIcon = '🇫🇷 ';
          } else if (isPublished) {
            statusClass += ' published';
            statusIcon = '📄 ';
          } else if (isReview) {
            statusClass += ' review';
            statusIcon = '⏳ ';
          }

          const links = [];
          if (pub.url) {
            links.push(`<a href="${escHtml(pub.url)}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i> Link</a>`);
          }
          if (pub.poster_url) {
            links.push(`<a href="${escHtml(pub.poster_url)}" target="_blank"><i class="fa-solid fa-file-pdf fa-xs"></i> Poster</a>`);
          }
          if (pub.openreview_url) {
            links.push(`<a href="${escHtml(pub.openreview_url)}" target="_blank"><i class="fa-solid fa-file-circle-check fa-xs"></i> OpenReview</a>`);
          }

          return `
            <div class="pub-item">
              <div class="pub-number">${num}</div>
              <div class="pub-body">
                <div class="pub-title">${escHtml(pub.title)}</div>
                <div class="pub-venue">${pub.venue || ''}</div>
                <span class="${statusClass}" ${statusStyle}>${statusIcon}${escHtml(pub.status)}${pub.publisher ? ' · ' + escHtml(pub.publisher) : ''}</span>
                ${links.length ? `<div class="pub-links">${links.join(' ')}</div>` : ''}
              </div>
            </div>
          `;
        })
        .join('');

      sec.insertAdjacentHTML('beforeend', pubHtml);
    } catch (e) {
      console.warn('Dynamic load error (publications):', e);
    }
  }

  // =============================================================================
  // 6. PROJECTS SECTION
  // =============================================================================
  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#projects .projects-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map(proj => {
          const tags = Array.isArray(proj.tags) ? proj.tags : [];
          const tagsHtml = tags.map(t => `<span class="proj-tag">${escHtml(t)}</span>`).join('');

          const links = [];
          if (proj.github_url) {
            links.push(`<a href="${escHtml(proj.github_url)}" target="_blank" class="proj-link"><i class="fa-brands fa-github fa-xs"></i> Code</a>`);
          }
          if (proj.demo_url) {
            links.push(`<a href="${escHtml(proj.demo_url)}" target="_blank" class="proj-link"><i class="fa-brands fa-youtube fa-xs"></i> Demo</a>`);
          }
          if (proj.live_url) {
            links.push(`<a href="${escHtml(proj.live_url)}" target="_blank" class="proj-link"><i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i> Live</a>`);
          }

          return `
            <div class="proj-card">
              <div class="proj-icon">${escHtml(proj.icon || '🚀')}</div>
              <div class="proj-name">${escHtml(proj.name)}</div>
              <div class="proj-desc">${proj.description || ''}</div>
              <div class="proj-tags">${tagsHtml}</div>
              ${links.length ? `<div class="proj-links">${links.join(' ')}</div>` : ''}
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (projects):', e);
    }
  }

  // =============================================================================
  // 7. TECHNICAL SKILLS SECTION
  // =============================================================================
  async function loadSkills() {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#skills .skills-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map(cat => {
          const items = Array.isArray(cat.items) ? cat.items : [];
          const pillsHtml = items.map(item => `<span class="skill-pill">${escHtml(item)}</span>`).join('');
          return `
            <div class="skill-group">
              <div class="skill-group-title"><i class="fa-solid fa-code"></i> ${escHtml(cat.category)}</div>
              <div class="skill-pills">${pillsHtml}</div>
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (skills):', e);
    }
  }

  // =============================================================================
  // 8. AWARDS & HONOURS SECTION
  // =============================================================================
  async function loadAwards() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const sec = document.getElementById('awards');
      if (!sec) return;

      sec.querySelectorAll('.award-item').forEach(el => el.remove());

      const awardHtml = data
        .map((a, idx) => `
          <div class="award-item">
            <div class="award-icon">${idx === 0 ? '🏅' : idx === 1 ? '🥇' : '🏆'}</div>
            <div class="award-body">
              <div class="award-title">${escHtml(a.title)}</div>
              <div class="award-desc">${a.description || ''}</div>
            </div>
          </div>
        `)
        .join('');

      sec.insertAdjacentHTML('beforeend', awardHtml);
    } catch (e) {
      console.warn('Dynamic load error (awards):', e);
    }
  }

  // =============================================================================
  // 9. CERTIFICATES SECTION
  // =============================================================================
  async function loadCertificates() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const slidesWrap = document.getElementById('certSlides');
      if (!slidesWrap) return;

      slidesWrap.innerHTML = data
        .map(cert => {
          const isImage = cert.file_url && (cert.file_url.endsWith('.jpg') || cert.file_url.endsWith('.png') || cert.file_url.endsWith('.jpeg'));
          const mediaTag = isImage
            ? `<img src="${escHtml(cert.file_url)}" alt="${escHtml(cert.label)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;" />`
            : `<iframe src="${escHtml(cert.file_url)}" loading="lazy"></iframe>`;

          return `
            <div class="cert-slide" data-label="${escHtml(cert.label)}">
              ${mediaTag}
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (certificates):', e);
    }
  }

  // =============================================================================
  // 10. COMPETITIVE PROGRAMMING SECTION
  // =============================================================================
  async function loadCompetitiveProgramming() {
    try {
      const { data: platforms } = await supabase
        .from('competitive_programming')
        .select('*')
        .order('display_order', { ascending: true });

      if (platforms && platforms.length) {
        const platWrap = document.querySelector('#cp .cp-platforms');
        if (platWrap) {
          platWrap.innerHTML = platforms
            .map(p => `
              <a href="${escHtml(p.url)}" target="_blank" class="cp-platform">
                <i class="fa-solid fa-code"></i> ${escHtml(p.platform)} · <strong>${escHtml(p.handle)}</strong>
              </a>
            `)
            .join('');
        }
      }
    } catch (e) {
      console.warn('Dynamic load error (cp):', e);
    }
  }

  // =============================================================================
  // 11. RELEVANT COURSEWORK SECTION
  // =============================================================================
  async function loadCoursework() {
    try {
      const { data, error } = await supabase
        .from('coursework')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#coursework .course-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map(cw => {
          const courses = Array.isArray(cw.courses) ? cw.courses : [];
          const listHtml = courses.map(c => `<li>${escHtml(c)}</li>`).join('');
          return `
            <div class="course-group">
              <div class="course-group-name">${escHtml(cw.category)}</div>
              <ul class="course-list">${listHtml}</ul>
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (coursework):', e);
    }
  }

  // =============================================================================
  // 12. CONTACT & PROFILES SECTION
  // =============================================================================
  async function loadContactProfiles() {
    try {
      const { data, error } = await supabase
        .from('contact_profiles')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#contact .contact-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map(p => `
          <a href="${escHtml(p.url)}" ${p.url.startsWith('mailto:') ? '' : 'target="_blank"'} class="contact-card">
            <div class="contact-icon" ${p.color ? `style="background:${escHtml(p.color)}20;color:${escHtml(p.color)};"` : ''}>
              <i class="fa-solid fa-link"></i>
            </div>
            <div>
              <div class="contact-label">${escHtml(p.label)}</div>
              <div class="contact-value">${escHtml(p.handle || p.platform)}</div>
            </div>
          </a>
        `)
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (contact):', e);
    }
  }

  // =============================================================================
  // 13. VOLUNTEERING SECTION
  // =============================================================================
  async function loadVolunteering() {
    try {
      const { data, error } = await supabase
        .from('volunteering')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#volunteering .vol-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map((v, idx) => {
          const colors = ['red', 'blue', 'green'];
          const colorClass = colors[idx % colors.length];
          return `
            <div class="vol-card ${colorClass}">
              <div class="vol-icon">🤝</div>
              <div class="vol-body">
                <div class="vol-org">${escHtml(v.org)}</div>
                <div class="vol-role">${escHtml(v.role)}</div>
                <div class="vol-period"><i class="fa-regular fa-calendar"></i> ${escHtml(v.period || '')}</div>
                <div class="vol-desc">${v.description || ''}</div>
              </div>
            </div>
          `;
        })
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (volunteering):', e);
    }
  }

  // =============================================================================
  // 14. MEDIA / VIDEOS SECTION
  // =============================================================================
  async function loadMedia() {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || !data.length) return;

      const grid = document.querySelector('#videos .videos-grid');
      if (!grid) return;

      grid.innerHTML = data
        .map(m => `
          <a href="${escHtml(m.url)}" target="_blank" class="video-card">
            <div class="video-thumb-wrap">
              ${m.thumbnail_url ? `<img src="${escHtml(m.thumbnail_url)}" alt="${escHtml(m.title)}" style="width:100%;height:100%;object-fit:cover;" />` : '<div class="yt-avatar"><i class="fa-solid fa-play"></i></div>'}
            </div>
            <div class="video-info">
              <div class="video-title">${escHtml(m.title)}</div>
            </div>
          </a>
        `)
        .join('');
    } catch (e) {
      console.warn('Dynamic load error (media):', e);
    }
  }

  // =============================================================================
  // BOOTSTRAP ALL SECTIONS
  // =============================================================================
  async function initDynamicPortfolio() {
    if (!_realSupabase) {
      await loadFallbackData();
    }
    loadAbout();
    loadNews();
    loadExperience();
    loadEducation();
    loadPublications();
    loadProjects();
    loadSkills();
    loadAwards();
    loadCertificates();
    loadCompetitiveProgramming();
    loadCoursework();
    loadContactProfiles();
    loadVolunteering();
    loadMedia();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicPortfolio);
  } else {
    initDynamicPortfolio();
  }
})();
