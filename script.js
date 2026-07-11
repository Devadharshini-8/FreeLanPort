// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   RENDER FROM SHARED DATA (data.js -> localStorage)
   Whatever is added/edited/deleted in the admin dashboard
   shows up here automatically, since both pages read the
   same KVStore.
========================================================= */
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  const services = KVStore.get('services');
  grid.innerHTML = services.map(s => `
    <div class="service-card">
      <span class="service-icon">${s.icon || '◧'}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.desc)}</p>
    </div>
  `).join('');
}

function renderStack() {
  const grid = document.getElementById('stackGrid');
  if (!grid) return;
  const stack = KVStore.get('stack');
  const cols = [
    ['Frontend', stack.frontend],
    ['Backend', stack.backend],
    ['Database', stack.database],
    ['Tools & Deploy', stack.tools]
  ];
  grid.innerHTML = cols.map(([label, items]) => `
    <div class="stack-col">
      <h4>${label}</h4>
      <ul>${(items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
    </div>
  `).join('');
}

function renderCases() {
  const list = document.getElementById('caseList');
  if (!list) return;
  const projects = KVStore.get('projects');

  const visualMarkup = (visual) => {
    if (visual === 'photo') {
      return `<div class="stamp-browser-body photo" style="padding: 0;">
        <img src="assets/photo.jpg" alt="Photography Studio" style="width: 100%; display: block; object-fit: cover;">
      </div>`;
    }
    if (visual === 'dental') {
      return `<div class="stamp-browser-body dental" style="padding: 0;">
        <img src="assets/dental.jpg" alt="SmileCare Dental" style="width: 100%; display: block; object-fit: cover;">
      </div>`;
    }
    return `<div class="stamp-browser-body" style="padding: 0;">
      <img src="assets/${visual}.jpg" alt="${visual}" style="width: 100%; display: block; object-fit: cover;">
    </div>`;
  };

  list.innerHTML = projects.map((p, i) => `
    <article class="case reveal in">
      <div class="case-visual">
        <div class="stamp-browser">
          <div class="stamp-browser-bar"><i></i><i></i><i></i></div>
          ${visualMarkup(p.visual)}
        </div>
      </div>
      <div class="case-body">
        <div class="case-meta">
          <span class="case-num">Case File ${String(i + 1).padStart(2, '0')}</span>
          <h3>${escapeHtml(p.title)}</h3>
        </div>
        <div class="case-grid">
          <div><h5>Problem</h5><p>${escapeHtml(p.problem)}</p></div>
          <div><h5>Solution</h5><p>${escapeHtml(p.solution)}</p></div>
          <div><h5>Features</h5><ul class="feat-list">${(p.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul></div>
          <div><h5>Result</h5><p>${escapeHtml(p.result)}</p></div>
        </div>
        <div class="case-tags">${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
        <div class="case-links">
          ${p.demo ? `<a href="${escapeAttr(p.demo)}" target="_blank" rel="noopener">Live Demo ↗</a>` : ''}
          ${p.github ? `<a href="${escapeAttr(p.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

if (typeof KVStore !== 'undefined') {
  renderServices();
  renderStack();
  renderCases();
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Active nav tab on scroll
const sections = document.querySelectorAll('main section[id]');
const tabs = document.querySelectorAll('.tab');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      tabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(section => navObserver.observe(section));

// Mobile menu (simple toggle -> reuses tabs as a dropdown)
const burger = document.getElementById('burger');
const tabsNav = document.getElementById('tabs');
if (burger) {
  burger.addEventListener('click', () => {
    tabsNav.classList.toggle('mobile-open');
    tabsNav.style.display = tabsNav.classList.contains('mobile-open') ? 'flex' : 'none';
    tabsNav.style.position = 'absolute';
    tabsNav.style.top = '72px';
    tabsNav.style.left = '0';
    tabsNav.style.right = '0';
    tabsNav.style.flexDirection = 'column';
    tabsNav.style.margin = '0 20px';
    tabsNav.style.background = 'var(--cream)';
  });
  // close menu after choosing a link on mobile
  tabsNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        tabsNav.style.display = 'none';
        tabsNav.classList.remove('mobile-open');
      }
    });
  });
}

// Contact form -> opens mail client with prefilled message
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    const subject = encodeURIComponent(`New project enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:kaviyarasu.dev@gmail.com?subject=${subject}&body=${body}`;
  });
}
