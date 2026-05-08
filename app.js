// ═══════════════════════════════════════════════════════════
//  MergePoint – app.js
//  Student 1: Navbar + Footer  (feature/navbar-footer)
// ═══════════════════════════════════════════════════════════

/* ──────────────────────────────────────────────────────────
   1. Fetch data.json
   ────────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[MergePoint] Could not load data.json:', err);
    return null;
  }
}

/* ──────────────────────────────────────────────────────────
   2. Navbar
   ────────────────────────────────────────────────────────── */
function initNavbar(data) {
  const navbar      = document.getElementById('navbar');
  const navLogo     = document.getElementById('nav-logo');
  const navLinks    = document.getElementById('nav-links');
  const navCta      = document.getElementById('nav-cta');
  const hamburger   = document.getElementById('hamburger');
  const overlay     = document.getElementById('mobile-overlay');
  const mobileLinks = document.getElementById('mobile-nav-links');

  // 2a. Patch logo text from data
  if (data?.team) {
    const mark = navLogo.querySelector('.logo-mark');
    const text = navLogo.querySelector('.logo-text');
    if (mark) mark.textContent = data.team.logo || 'MP';
    if (text) text.textContent = data.team.name  || 'MergePoint';
  }

  // 2b. Render nav link items
  const links = data?.nav || [];

  function renderLinks(container, closeFn) {
    container.innerHTML = links
      .map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`)
      .join('');
    if (closeFn) {
      container.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', closeFn)
      );
    }
  }

  renderLinks(navLinks);
  renderLinks(mobileLinks, closeMenu);

  // 2c. CTA button scrolls to #contact
  navCta?.addEventListener('click', () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 2d. Scroll-aware: frosted glass + active section highlight
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  function syncScroll() {
    const scrolled = window.scrollY > 24;
    navbar.classList.toggle('scrolled', scrolled);

    let current = sections[0]?.id || '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 90) current = sec.id;
    });

    [navLinks, mobileLinks].forEach(container => {
      container.querySelectorAll('a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
      });
    });
  }

  window.addEventListener('scroll', syncScroll, { passive: true });
  syncScroll();

  // 2e. Mobile menu open / close
  function openMenu() {
    hamburger.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    overlay.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ──────────────────────────────────────────────────────────
   3. Team Members
   ────────────────────────────────────────────────────────── */
function initTeamMembers(data) {
  const teamGrid = document.getElementById('team-grid');
  const members = data?.members || [];

  if (!teamGrid || members.length === 0) return;

  teamGrid.innerHTML = members
    .map(({ name, role }) => `
      <div class="team-card">
        <div class="team-card-image">
          <span class="team-initial">${name.charAt(0).toUpperCase()}</span>
        </div>
        <div class="team-card-content">
          <h3 class="team-card-name">${name}</h3>
          <p class="team-card-role">${role}</p>
        </div>
      </div>
    `)
    .join('');
}

/* ──────────────────────────────────────────────────────────
   4. Footer
   ────────────────────────────────────────────────────────── */
function initFooter(data) {
  const taglineEl    = document.getElementById('footer-tagline');
  const socialEl     = document.getElementById('footer-social');
  const navLinksEl   = document.getElementById('footer-nav-links');
  const copyEl       = document.getElementById('footer-copy');
  const backToTopBtn = document.getElementById('back-to-top');

  const SOCIAL_ICONS = {
    github:    'fa-brands fa-github',
    linkedin:  'fa-brands fa-linkedin-in',
    twitter:   'fa-brands fa-x-twitter',
    instagram: 'fa-brands fa-instagram',
    youtube:   'fa-brands fa-youtube',
  };

  // 5a. Tagline
  if (taglineEl && data?.team?.tagline) {
    taglineEl.textContent = data.team.tagline;
  }

  // 5b. Social icon links
  if (socialEl && data?.social?.length) {
    socialEl.innerHTML = data.social
      .map(({ platform, url, icon }) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer"
            class="social-link" aria-label="${platform}">
           <i class="${SOCIAL_ICONS[icon] || 'fa-solid fa-link'}"></i>
         </a>`
      )
      .join('');
  }

  // 5c. Footer nav links
  if (navLinksEl && data?.nav?.length) {
    navLinksEl.innerHTML = data.nav
      .map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`)
      .join('');
  }

  // 5d. Copyright line
  if (copyEl && data?.team) {
    const year = new Date().getFullYear();
    copyEl.innerHTML =
      `© ${year} <span>${data.team.name}</span>. Built with ❤️ at the Git Workshop.`;
  }

  // 5e. Back to top
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ──────────────────────────────────────────────────────────
   6. Bootstrap
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadData();
  initNavbar(data);
  initTeamMembers(data);
  initFooter(data);
});
