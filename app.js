async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("[MergePoint] Could not load data.json:", error);
    return null;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initBrand(data) {
  const logos = document.querySelectorAll(".nav-logo");
  const mark = data?.team?.logo || "MP";
  const name = data?.team?.name || "MergePoint";

  logos.forEach((logo) => {
    const markEl = logo.querySelector(".logo-mark");
    const textEl = logo.querySelector(".logo-text");
    if (markEl) markEl.textContent = mark;
    if (textEl) textEl.textContent = name;
  });
}

function initHero(data) {
  const title = document.getElementById("hero-title");
  const subtitle = document.getElementById("hero-subtitle");
  const primary = document.getElementById("hero-primary-cta");
  const secondary = document.getElementById("hero-secondary-cta");
  const branchList = document.getElementById("branch-list");

  if (title && data?.hero?.title) title.textContent = data.hero.title;
  if (subtitle && data?.hero?.subtitle) subtitle.textContent = data.hero.subtitle;

  if (primary && data?.hero?.primaryCta) {
    primary.querySelector("span").textContent = data.hero.primaryCta.label;
    primary.href = data.hero.primaryCta.href;
  }

  if (secondary && data?.hero?.secondaryCta) {
    secondary.querySelector("span").textContent = data.hero.secondaryCta.label;
    secondary.href = data.hero.secondaryCta.href;
  }

  if (!branchList) return;

  const branches = data?.members || [];
  branchList.innerHTML = branches
    .map(
      ({ name, branch, role }) => `
        <div class="mini-branch">
          <span class="branch-label">${escapeHtml(branch || name.toLowerCase())}</span>
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(role)}</small>
        </div>
      `
    )
    .join("");
}

function initNavbar(data) {
  const navbar = document.getElementById("navbar");
  const navLinks = document.getElementById("nav-links");
  const navCta = document.getElementById("nav-cta");
  const hamburger = document.getElementById("hamburger");
  const overlay = document.getElementById("mobile-overlay");
  const mobileLinks = document.getElementById("mobile-nav-links");
  const links = data?.nav || [];

  function closeMenu() {
    hamburger?.classList.remove("open");
    overlay?.classList.remove("open");
    hamburger?.setAttribute("aria-expanded", "false");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function renderLinks(container, onClick) {
    if (!container) return;
    container.innerHTML = links
      .map(({ label, href }) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
      .join("");

    if (onClick) {
      container.querySelectorAll("a").forEach((link) => link.addEventListener("click", onClick));
    }
  }

  renderLinks(navLinks);
  renderLinks(mobileLinks, closeMenu);

  navCta?.addEventListener("click", () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  });

  hamburger?.addEventListener("click", () => {
    const isOpen = overlay?.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    overlay?.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const sections = Array.from(document.querySelectorAll("main section[id]"));

  function syncScroll() {
    navbar?.classList.toggle("scrolled", window.scrollY > 18);

    let current = sections[0]?.id || "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });

    [navLinks, mobileLinks].forEach((container) => {
      container?.querySelectorAll("a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    });
  }

  window.addEventListener("scroll", syncScroll, { passive: true });
  syncScroll();
}

function initAbout(data) {
  const goalList = document.getElementById("goal-list");
  const workflowStrip = document.getElementById("workflow-strip");

  if (goalList) {
    goalList.innerHTML = (data?.goals || [])
      .map(
        (goal) => `
          <li>
            <i class="fa-solid fa-circle-check"></i>
            <span>${escapeHtml(goal)}</span>
          </li>
        `
      )
      .join("");
  }

  if (workflowStrip) {
    workflowStrip.innerHTML = (data?.workflow || [])
      .map(
        ({ step, title, description }) => `
          <article class="workflow-step">
            <strong>${escapeHtml(step)}</strong>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </article>
        `
      )
      .join("");
  }
}

function initTeamMembers(data) {
  const teamGrid = document.getElementById("team-grid");
  const members = data?.members || [];
  const accents = ["#8ee66b", "#56c7ff", "#ff8a6a", "#ffd166", "#a78bfa", "#6ee7b7"];

  if (!teamGrid || members.length === 0) return;

  teamGrid.innerHTML = members
    .map(
      ({ name, role, task, branch }, index) => `
        <article class="team-card" style="--accent: ${accents[index % accents.length]}">
          <div class="team-card-top">
            <div class="team-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
            <span class="team-branch">${escapeHtml(branch || name.toLowerCase())}</span>
          </div>
          <div>
            <h3 class="team-card-name">${escapeHtml(name)}</h3>
            <p class="team-card-role">${escapeHtml(role)}</p>
          </div>
          <p class="team-card-task">${escapeHtml(task)}</p>
        </article>
      `
    )
    .join("");
}

function initProjects(data) {
  const projectsGrid = document.getElementById("projects-grid");
  const projects = data?.projects || [];
  const accents = ["#56c7ff", "#8ee66b", "#ffd166", "#ff8a6a"];

  if (!projectsGrid || projects.length === 0) return;

  projectsGrid.innerHTML = projects
    .map(
      ({ title, description, icon, owner, status }, index) => `
        <article class="project-card" style="--accent: ${accents[index % accents.length]}">
          <div class="project-icon"><i class="${escapeHtml(icon)}"></i></div>
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </div>
          <div class="project-meta">
            <span>${escapeHtml(owner)}</span>
            <span>${escapeHtml(status)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    if (status) {
      status.textContent = "Message saved locally for the workshop demo.";
    }
  });
}

function initFooter(data) {
  const taglineEl = document.getElementById("footer-tagline");
  const socialEl = document.getElementById("footer-social");
  const navLinksEl = document.getElementById("footer-nav-links");
  const copyEl = document.getElementById("footer-copy");
  const backToTopBtn = document.getElementById("back-to-top");

  const socialIcons = {
    github: "fa-brands fa-github",
    linkedin: "fa-brands fa-linkedin-in",
    twitter: "fa-brands fa-x-twitter",
    instagram: "fa-brands fa-instagram",
    youtube: "fa-brands fa-youtube",
  };

  if (taglineEl) taglineEl.textContent = data?.team?.tagline || "";

  if (socialEl) {
    socialEl.innerHTML = (data?.social || [])
      .map(
        ({ platform, url, icon }) => `
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${escapeHtml(platform)}">
            <i class="${socialIcons[icon] || "fa-solid fa-link"}"></i>
          </a>
        `
      )
      .join("");
  }

  if (navLinksEl) {
    navLinksEl.innerHTML = (data?.nav || [])
      .map(({ label, href }) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
      .join("");
  }

  if (copyEl) {
    const year = new Date().getFullYear();
    copyEl.innerHTML = `&copy; ${year} <span>${escapeHtml(data?.team?.name || "MergePoint")}</span>. Built for the Git Branching Workshop.`;
  }

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await loadData();

  initBrand(data);
  initHero(data);
  initNavbar(data);
  initAbout(data);
  initTeamMembers(data);
  initProjects(data);
  initContactForm();
  initFooter(data);
});
