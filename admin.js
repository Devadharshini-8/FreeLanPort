/* =========================================================
   LOCK SCREEN
========================================================= */
const lockScreen = document.getElementById('lockScreen');
const dashboard = document.getElementById('dashboard');
const lockForm = document.getElementById('lockForm');
const passcodeInput = document.getElementById('passcodeInput');
const lockError = document.getElementById('lockError');

function unlock() {
  lockScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  sessionStorage.setItem('kv_unlocked', '1');
}

// Stay unlocked for this browser tab session only (closing the tab re-locks it)
if (sessionStorage.getItem('kv_unlocked') === '1') unlock();

lockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const entered = passcodeInput.value.trim();
  const real = KVStore.get('passcode');
  if (entered.length !== 8 || !/^\d{8}$/.test(entered)) {
    lockError.textContent = 'Passcode must be exactly 8 digits.';
    return;
  }
  if (entered === real) {
    lockError.textContent = '';
    unlock();
  } else {
    lockError.textContent = 'Incorrect passcode. Try again.';
    passcodeInput.value = '';
    passcodeInput.focus();
  }
});

document.getElementById('lockBtn').addEventListener('click', () => {
  sessionStorage.removeItem('kv_unlocked');
  dashboard.classList.add('hidden');
  lockScreen.classList.remove('hidden');
  passcodeInput.value = '';
  passcodeInput.focus();
});

/* =========================================================
   NAV / PANEL SWITCHING
========================================================= */
const navBtns = document.querySelectorAll('.dash-nav-btn');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
  });
});

/* =========================================================
   MODAL HELPERS
========================================================= */
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');

function openModal(title, fieldsHtml, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = fieldsHtml + `
    <div class="modal-actions">
      <button type="submit" class="btn btn-primary">Save</button>
      <button type="button" class="btn btn-ghost" id="modalCancel">Cancel</button>
    </div>`;
  modalOverlay.classList.remove('hidden');
  modalForm.onsubmit = (e) => { e.preventDefault(); onSubmit(new FormData(modalForm)); closeModal(); };
  document.getElementById('modalCancel').onclick = closeModal;
}
function closeModal() { modalOverlay.classList.add('hidden'); modalForm.innerHTML = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

/* =========================================================
   PROJECTS & CASE STUDIES
========================================================= */
function projectFields(p = {}) {
  return `
    <label>Project Title <input name="title" value="${escAttr(p.title)}" required></label>
    <label>Card Visual
      <select name="visual">
        <option value="generic" ${p.visual === 'generic' || !p.visual ? 'selected' : ''}>Generic</option>
        <option value="dental" ${p.visual === 'dental' ? 'selected' : ''}>Cards / list layout</option>
        <option value="photo" ${p.visual === 'photo' ? 'selected' : ''}>Image gallery layout</option>
      </select>
    </label>
    <label>Problem <textarea name="problem" rows="2" required>${escHtml(p.problem)}</textarea></label>
    <label>Solution <textarea name="solution" rows="2" required>${escHtml(p.solution)}</textarea></label>
    <label>Features <span class="field-hint">(one per line)</span>
      <textarea name="features" rows="3">${(p.features || []).join('\n')}</textarea>
    </label>
    <label>Result <textarea name="result" rows="2" required>${escHtml(p.result)}</textarea></label>
    <label>Tags <span class="field-hint">(comma separated)</span>
      <input name="tags" value="${escAttr((p.tags || []).join(', '))}">
    </label>
    <label>Live Demo URL <input name="demo" value="${escAttr(p.demo)}" placeholder="https://"></label>
    <label>GitHub URL <input name="github" value="${escAttr(p.github)}" placeholder="https://"></label>
  `;
}

function renderProjectsList() {
  const wrap = document.getElementById('projectsList');
  const projects = KVStore.get('projects');
  if (!projects.length) { wrap.innerHTML = '<p class="empty-note">No projects yet. Add your first case study.</p>'; return; }
  wrap.innerHTML = projects.map(p => `
    <div class="admin-row" data-id="${p.id}">
      <div class="admin-row-info">
        <span class="admin-row-icon">◧</span>
        <div class="admin-row-text"><h4>${escHtml(p.title)}</h4><p>${escHtml(p.problem)}</p></div>
      </div>
      <div class="admin-row-actions">
        <button class="icon-btn edit-project">Edit</button>
        <button class="icon-btn danger delete-project">Delete</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.edit-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.admin-row').dataset.id;
      const p = KVStore.get('projects').find(x => x.id === id);
      openModal('Edit Project', projectFields(p), (fd) => saveProject(fd, id));
    });
  });
  wrap.querySelectorAll('.delete-project').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.admin-row').dataset.id;
      if (!confirm('Delete this project? This cannot be undone.')) return;
      const projects = KVStore.get('projects').filter(x => x.id !== id);
      KVStore.set('projects', projects);
      renderProjectsList();
    });
  });
}

function saveProject(fd, id) {
  const projects = KVStore.get('projects');
  const data = {
    id: id || KVStore.uid('p'),
    title: fd.get('title').trim(),
    visual: fd.get('visual'),
    problem: fd.get('problem').trim(),
    solution: fd.get('solution').trim(),
    features: fd.get('features').split('\n').map(s => s.trim()).filter(Boolean),
    result: fd.get('result').trim(),
    tags: fd.get('tags').split(',').map(s => s.trim()).filter(Boolean),
    demo: fd.get('demo').trim(),
    github: fd.get('github').trim()
  };
  const idx = projects.findIndex(x => x.id === id);
  if (idx > -1) projects[idx] = data; else projects.push(data);
  KVStore.set('projects', projects);
  renderProjectsList();
}

document.getElementById('addProjectBtn').addEventListener('click', () => {
  openModal('Add Project', projectFields(), (fd) => saveProject(fd, null));
});

/* =========================================================
   SERVICES
========================================================= */
function serviceFields(s = {}) {
  return `
    <label>Icon <span class="field-hint">(one symbol/emoji)</span><input name="icon" value="${escAttr(s.icon || '◧')}" maxlength="2"></label>
    <label>Title <input name="title" value="${escAttr(s.title)}" required></label>
    <label>Description <textarea name="desc" rows="3" required>${escHtml(s.desc)}</textarea></label>
  `;
}

function renderServicesList() {
  const wrap = document.getElementById('servicesList');
  const services = KVStore.get('services');
  if (!services.length) { wrap.innerHTML = '<p class="empty-note">No services yet. Add one.</p>'; return; }
  wrap.innerHTML = services.map(s => `
    <div class="admin-row" data-id="${s.id}">
      <div class="admin-row-info">
        <span class="admin-row-icon">${escHtml(s.icon || '◧')}</span>
        <div class="admin-row-text"><h4>${escHtml(s.title)}</h4><p>${escHtml(s.desc)}</p></div>
      </div>
      <div class="admin-row-actions">
        <button class="icon-btn edit-service">Edit</button>
        <button class="icon-btn danger delete-service">Delete</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.edit-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.admin-row').dataset.id;
      const s = KVStore.get('services').find(x => x.id === id);
      openModal('Edit Service', serviceFields(s), (fd) => saveService(fd, id));
    });
  });
  wrap.querySelectorAll('.delete-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.admin-row').dataset.id;
      if (!confirm('Delete this service?')) return;
      KVStore.set('services', KVStore.get('services').filter(x => x.id !== id));
      renderServicesList();
    });
  });
}

function saveService(fd, id) {
  const services = KVStore.get('services');
  const data = { id: id || KVStore.uid('s'), icon: fd.get('icon').trim() || '◧', title: fd.get('title').trim(), desc: fd.get('desc').trim() };
  const idx = services.findIndex(x => x.id === id);
  if (idx > -1) services[idx] = data; else services.push(data);
  KVStore.set('services', services);
  renderServicesList();
}

document.getElementById('addServiceBtn').addEventListener('click', () => {
  openModal('Add Service', serviceFields(), (fd) => saveService(fd, null));
});

/* =========================================================
   TECH STACK
========================================================= */
const stackLabels = { frontend: 'Frontend', backend: 'Backend', database: 'Database', tools: 'Tools & Deploy' };

function renderStackEditor() {
  const wrap = document.getElementById('stackEditor');
  const stack = KVStore.get('stack');
  wrap.innerHTML = Object.keys(stackLabels).map(cat => `
    <div class="stack-editor-col" data-cat="${cat}">
      <h4>${stackLabels[cat]}</h4>
      <div class="stack-tag-list">
        ${(stack[cat] || []).map((item, i) => `
          <span class="stack-tag">${escHtml(item)}<button data-cat="${cat}" data-i="${i}" class="stack-remove">×</button></span>
        `).join('')}
      </div>
      <div class="stack-add-row">
        <input type="text" placeholder="Add item..." class="stack-add-input" data-cat="${cat}">
        <button class="stack-add-btn" data-cat="${cat}">Add</button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.stack-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat, i = Number(btn.dataset.i);
      const stack = KVStore.get('stack');
      stack[cat].splice(i, 1);
      KVStore.set('stack', stack);
      renderStackEditor();
    });
  });

  wrap.querySelectorAll('.stack-add-btn').forEach(btn => {
    btn.addEventListener('click', () => addStackItem(btn.dataset.cat));
  });
  wrap.querySelectorAll('.stack-add-input').forEach(input => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addStackItem(input.dataset.cat); } });
  });
}

function addStackItem(cat) {
  const input = document.querySelector(`.stack-add-input[data-cat="${cat}"]`);
  const val = input.value.trim();
  if (!val) return;
  const stack = KVStore.get('stack');
  stack[cat] = stack[cat] || [];
  stack[cat].push(val);
  KVStore.set('stack', stack);
  renderStackEditor();
}

/* =========================================================
   SETTINGS
========================================================= */
document.getElementById('changePassForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const cur = document.getElementById('curPass').value.trim();
  const next = document.getElementById('newPass').value.trim();
  const confirmVal = document.getElementById('confirmPass').value.trim();
  const msg = document.getElementById('passMsg');

  if (cur !== KVStore.get('passcode')) { msg.textContent = 'Current passcode is incorrect.'; msg.className = 'settings-msg err'; return; }
  if (!/^\d{8}$/.test(next)) { msg.textContent = 'New passcode must be exactly 8 digits.'; msg.className = 'settings-msg err'; return; }
  if (next !== confirmVal) { msg.textContent = "New passcodes don't match."; msg.className = 'settings-msg err'; return; }

  KVStore.set('passcode', next);
  msg.textContent = 'Passcode updated.';
  msg.className = 'settings-msg ok';
  e.target.reset();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset Projects, Services and Tech Stack to their original defaults? This cannot be undone.')) return;
  KVStore.set('services', KV_DEFAULTS.services);
  KVStore.set('stack', KV_DEFAULTS.stack);
  KVStore.set('projects', KV_DEFAULTS.projects);
  renderProjectsList(); renderServicesList(); renderStackEditor();
});

/* =========================================================
   ESCAPE HELPERS
========================================================= */
function escHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escAttr(str) { return escHtml(str); }

/* =========================================================
   INIT
========================================================= */
renderProjectsList();
renderServicesList();
renderStackEditor();
