/* =========================================================
   SHARED DATA LAYER
   Used by index.html (public site) and admin.html (dashboard).
   Everything lives in localStorage under the "kv_*" keys below,
   so edits made in the dashboard are picked up by the site
   automatically (same browser / same device, see admin panel
   "How this works" note for details).
========================================================= */

const KV_KEYS = {
  passcode: 'kv_passcode',
  services: 'kv_services',
  stack: 'kv_stack',
  projects: 'kv_projects'
};

const KV_DEFAULTS = {
  passcode: '12345678',

  services: [
    { id: 's1', icon: '◧', title: 'Portfolio & Business Websites', desc: 'Fast, responsive marketing sites that make a strong first impression and are built to convert.' },
    { id: 's2', icon: '▤', title: 'Admin Dashboards', desc: 'Secure back-office panels so you can manage projects, content and bookings without touching code.' },
    { id: 's3', icon: '⬡', title: 'Full Stack Web Apps', desc: 'Custom applications with real databases, authentication and business logic — not just static pages.' },
    { id: 's4', icon: '◫', title: 'Mobile App Development', desc: 'Cross-platform apps that share logic with your web product, built for a consistent experience.' },
    { id: 's5', icon: '✎', title: 'UI/UX & Landing Pages', desc: 'Conversion-focused landing pages and interface design tuned to your brand and audience.' },
    { id: 's6', icon: '⟲', title: 'Maintenance & Support', desc: "Bug fixes, updates and ongoing improvements after launch — I don't disappear after delivery." }
  ],

  stack: {
    frontend: ['HTML5 / CSS3', 'JavaScript (ES6+)', 'React', 'Responsive / Mobile-first UI'],
    backend: ['Node.js', 'Express', 'REST APIs', 'Authentication & Sessions'],
    database: ['MongoDB', 'MySQL', 'Firebase'],
    tools: ['Git & GitHub', 'Figma', 'VS Code', 'Vercel']
  },

  projects: [
    {
      id: 'p1',
      title: 'SmileCare Dental — Clinic Website',
      visual: 'dental',
      problem: 'A dental clinic had no online presence, so prospective patients had no way to learn about services or request an appointment outside calling hours.',
      solution: 'Designed and built a responsive one-page site covering services, dentist profiles and facilities, with a modal appointment form and a direct WhatsApp contact option.',
      features: ['Service & dentist showcase', 'Appointment booking modal', 'WhatsApp quick-contact', 'Embedded location map'],
      result: 'The clinic now has a 24/7 online presence where patients can explore services and request appointments without a phone call.',
      tags: ['React', 'Responsive CSS', 'Vercel'],
      demo: 'https://dental-blue-iota.vercel.app/',
      github: 'https://github.com/vkavi0607'
    },
    {
      id: 'p2',
      title: 'Photography Studio — Portfolio Website',
      visual: 'photo',
      problem: 'A photographer needed a visual-first portfolio to showcase shoots and make it easy for prospective clients to enquire about bookings.',
      solution: 'Built a gallery-driven, image-focused layout with a clean grid, smooth section transitions and a simple enquiry/contact section — keeping the photography itself as the centrepiece.',
      features: ['Responsive image gallery grid', 'Minimal, distraction-free layout', 'About & contact sections', 'Fast page load'],
      result: 'A polished, mobile-friendly portfolio the photographer can share directly with prospective clients.',
      tags: ['React', 'CSS Grid', 'Vercel'],
      demo: 'https://photography-three-bice.vercel.app/',
      github: 'https://github.com/vkavi0607'
    }
  ]
};

const KVStore = {
  init() {
    Object.entries(KV_KEYS).forEach(([name, key]) => {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(KV_DEFAULTS[name]));
      }
    });
  },
  get(name) {
    try {
      const raw = localStorage.getItem(KV_KEYS[name]);
      return raw ? JSON.parse(raw) : KV_DEFAULTS[name];
    } catch (e) {
      return KV_DEFAULTS[name];
    }
  },
  set(name, value) {
    localStorage.setItem(KV_KEYS[name], JSON.stringify(value));
  },
  resetAll() {
    Object.entries(KV_KEYS).forEach(([name, key]) => {
      localStorage.setItem(key, JSON.stringify(KV_DEFAULTS[name]));
    });
  },
  uid(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }
};

KVStore.init();
