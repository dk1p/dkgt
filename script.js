/* ══════════════════════════════════════
   DK Global Technologies — Main Script
   ══════════════════════════════════════ */

/* ────────────────────────────────────────
   HTML PARTIALS (Header / Footer)
   Loads /partials/header.html and /partials/footer.html
   into any <div data-include="header"></div> /
   <div data-include="footer"></div> placeholder found on
   the page, then wires up the nav + footer behavior once
   that markup actually exists in the DOM.
   ──────────────────────────────────────── */
function loadInclude(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return Promise.resolve(false);

  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`${url} responded ${res.status}`);
      return res.text();
    })
    .then(html => {
      el.outerHTML = html;
      return true;
    })
    .catch(err => {
      console.error(`Could not load include "${url}":`, err);
      return false;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    loadInclude('[data-include="header"]', 'partials/header.html'),
    loadInclude('[data-include="footer"]', 'partials/footer.html')
  ]).then(() => {
    initMobileNav();
    setActiveNavLink();
    initFooterYear();
    initNewsletterForms();
  });

  initScrollTopButton();
});

/* ────────────────────────────────────────
   SCROLL TO TOP BUTTON
   Injected on every page that loads this
   script, so no per-page markup is needed.
   Sits above the WhatsApp widget on the
   right side and fades in after the user
   scrolls down.
   ──────────────────────────────────────── */
function initScrollTopButton() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.id = 'scrollTopBtn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  document.body.appendChild(btn);

  const SHOW_AFTER = 400; // px scrolled before the button appears
  let ticking = false;

  const toggleVisibility = () => {
    btn.classList.toggle('show', window.scrollY > SHOW_AFTER);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(toggleVisibility);
      ticking = true;
    }
  }, { passive: true });

  toggleVisibility();

  btn.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ────────────────────────────────────────
   ANIMATED WAVE BACKGROUND
   ──────────────────────────────────────── */
const wc   = document.getElementById('waveCanvas');
const wctx = wc ? wc.getContext('2d') : null;

if (wc) {

function resizeWave() {
  wc.width  = window.innerWidth;
  wc.height = window.innerHeight;
}
resizeWave();
window.addEventListener('resize', resizeWave);

/* Build wave descriptors */
const waves = [];

// Golden body waves
for (let i = 0; i < 22; i++) {
  const pct = i / 22;
  waves.push({
    amplitude : 35 + Math.random() * 90,
    freq      : 0.0025 + Math.random() * 0.0045,
    phase     : Math.random() * Math.PI * 2,
    speed     : 0.003  + Math.random() * 0.007,
    yBase     : -0.05  + pct * 1.1,
    opacity   : 0.06   + Math.random() * 0.16,
    r         : Math.random() > 0.5 ? 255 : 212,
    g         : Math.random() > 0.5 ? 215 : 175,
    b         : Math.random() > 0.5 ? 0   : 55,
    thickness : 0.7 + Math.random() * 1.4,
  });
}

// Bright gold highlight waves
for (let i = 0; i < 5; i++) {
  waves.push({
    amplitude : 25 + Math.random() * 55,
    freq      : 0.0018 + Math.random() * 0.003,
    phase     : Math.random() * Math.PI * 2,
    speed     : 0.002  + Math.random() * 0.003,
    yBase     : 0.15   + Math.random() * 0.7,
    opacity   : 0.08   + Math.random() * 0.12,
    r: 255, g: 223, b: 80,
    thickness : 1.8,
  });
}

let tick = 0;

function drawWaves() {
  /* Background gradient */
  const bg = wctx.createLinearGradient(0, 0, wc.width, wc.height);
  bg.addColorStop(0,    '#08070f');
  bg.addColorStop(0.3,  '#0d0c18');
  bg.addColorStop(0.65, '#110e14');
  bg.addColorStop(1,    '#09080f');
  wctx.fillStyle = bg;
  wctx.fillRect(0, 0, wc.width, wc.height);

  /* Draw each wave line */
  waves.forEach(w => {
    wctx.beginPath();
    const yc = w.yBase * wc.height;

    for (let x = 0; x <= wc.width; x += 4) {
      const y = yc
        + Math.sin(x * w.freq + tick * w.speed + w.phase)                    * w.amplitude
        + Math.sin(x * w.freq * 2.1 + tick * w.speed * 1.5 + w.phase * 0.6) * w.amplitude * 0.38
        + Math.cos(x * w.freq * 0.6 + tick * w.speed * 0.7)                  * w.amplitude * 0.22;

      x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
    }

    wctx.strokeStyle = `rgba(${w.r},${w.g},${w.b},${w.opacity})`;
    wctx.lineWidth   = w.thickness;
    wctx.stroke();
  });

  tick++;
  requestAnimationFrame(drawWaves);
}
drawWaves();

} // end waveCanvas guard

/* ────────────────────────────────────────
   GOLD PARTICLE LAYER
   ──────────────────────────────────────── */
const pc   = document.getElementById('particles');
const pctx = pc ? pc.getContext('2d') : null;

if (pc) {

function resizePart() {
  pc.width  = window.innerWidth;
  pc.height = window.innerHeight;
}
resizePart();
window.addEventListener('resize', resizePart);

const pts = Array.from({ length: 70 }, () => ({
  x     : Math.random() * pc.width,
  y     : Math.random() * pc.height,
  size  : Math.random() * 1.8 + 0.3,
  vx    : (Math.random() - 0.5) * 0.45,
  vy    : (Math.random() - 0.5) * 0.45,
  alpha : 0.25 + Math.random() * 0.55,
}));

function animateParticles() {
  pctx.clearRect(0, 0, pc.width, pc.height);

  pts.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > pc.width)  p.vx *= -1;
    if (p.y < 0 || p.y > pc.height) p.vy *= -1;

    pctx.beginPath();
    pctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    pctx.fillStyle = `rgba(255,215,0,${p.alpha})`;
    pctx.fill();
  });

  requestAnimationFrame(animateParticles);
}
animateParticles();

} // end particles guard

/* ────────────────────────────────────────
   PROCESS SLIDER LOGIC
   ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('slider');
  const bike = document.getElementById('bike');
  const progressLine = document.getElementById('progressLine');
  const dustCanvas = document.getElementById('dustCanvas');

  if (!slider || !bike || !progressLine) return;

  // --- 1. DUST SYSTEM ---
  const dctx = dustCanvas ? dustCanvas.getContext('2d') : null;
  let particles = [];
  if (dctx) {
    dustCanvas.width = 120;
    dustCanvas.height = 60;
  }

  class SandGrain {
    constructor() {
      this.x = 40; this.y = 50;
      this.vx = -Math.random() * 3 - 1;
      this.vy = -Math.random() * 2;
      this.alpha = 1;
      this.size = Math.random() * 2 + 1;
    }
    update() { this.x += this.vx; this.y += this.vy; this.alpha -= 0.03; }
    draw() {
      dctx.globalAlpha = this.alpha;
      dctx.fillStyle = '#d4af37'; 
      dctx.beginPath(); dctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); dctx.fill();
    }
  }

  function animateSand() {
    if (!dctx) return;
    dctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
    particles.forEach((p, i) => {
      p.update(); p.draw();
      if (p.alpha <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(animateSand);
  }
  animateSand();

  // --- 2. SCROLL & VELOCITY LOGIC ---
  let lastScrollLeft = 0;
  let scrollTimeout;

  const updateUI = () => {
    const scrollLeft = slider.scrollLeft;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const scrolledPct = maxScroll <= 0 ? 0 : (scrollLeft / maxScroll) * 100;
    
    const velocity = Math.abs(scrollLeft - lastScrollLeft);
    lastScrollLeft = scrollLeft;

    progressLine.style.width = `${scrolledPct}%`;
    bike.style.left = `${scrolledPct}%`;

    bike.classList.add('is-moving');
    if (velocity > 5 && dctx) {
      for (let i = 0; i < 2; i++) particles.push(new SandGrain());
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => bike.classList.remove('is-moving'), 150);
  };

  slider.addEventListener('scroll', updateUI);

  // --- 3. MOUSE DRAG CONTROL ---
  let isDown = false;
  let startX;
  let scrollLeftStart;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active-grab');
    startX = e.pageX - slider.offsetLeft;
    scrollLeftStart = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active-grab');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active-grab');
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed here
    slider.scrollLeft = scrollLeftStart - walk;
  });
});

// --- 4. NAVIGATION BUTTONS ---
function scrollSlider(direction) {
  const slider = document.getElementById('slider');
  const card = document.querySelector('.process-card');
  if (slider && card) {
    const cardWidth = card.offsetWidth + 25; // Card width + gap
    slider.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }
}


// Create the observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If the element is in the viewport
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.2 // Triggers when 20% of the section is visible
  });

  // Observe the elements
  document.querySelectorAll('.fade-in-on-scroll').forEach(el => observer.observe(el));






  
/* ==========================
   PROJECT SECTION
   Carousel is now handled by Swiper, initialized
   directly in index.html.
========================== */



/* ==========================
   SATISFACTION SECTION CAROUSEL
========================== */
const track = document.getElementById("srTrack");

if (track) {

const first = track.firstElementChild.cloneNode(true);
track.appendChild(first);

let srIndex = 0;
const slides = track.children.length;

setInterval(() => {

    srIndex++;

    track.style.transition = "0.8s ease";
    track.style.transform = `translateX(-${srIndex * 100}%)`;

    if(srIndex === slides - 1){

        setTimeout(() => {
            track.style.transition = "none";
            track.style.transform = "translateX(0)";
            srIndex = 0;
        }, 800);

    }

}, 3500);

} // end srTrack guard

/* ==========================
   Footer SECTION
   Called from loadInclude()'s .then() once footer.html
   has actually been injected into the page.
========================== */
function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* Newsletter submission is handled once, for every .newsletter-form
   on the page (footer + inline), by handleFormSubmit() further below —
   this avoids duplicate submit handlers / double form posts. Also
   called from loadInclude()'s .then(), since the footer's newsletter
   form doesn't exist until footer.html is injected. */
function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach(nf => {
        const msg = nf.querySelector('.form-msg') || nf.nextElementSibling;
        handleFormSubmit(nf, msg, "Subscribed! Watch your inbox for updates.");
    });
}



/* ────────────────────────────────────────
   MOBILE NAVIGATION
   Called from loadInclude()'s .then() once header.html
   has actually been injected into the page — NOT on
   DOMContentLoaded, since #navToggle / .nav-links don't
   exist until then.
──────────────────────────────────────── */
function initMobileNav() {

    const toggle = document.getElementById("navToggle");
    const navLinks = document.querySelector(".nav-links");

    if (!toggle || !navLinks) return; // header partial failed to load

    /* Mobile Hamburger */
    toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        navLinks.classList.toggle("open");
    });

    /* Dropdown Toggle */
    document.querySelectorAll(".nav-links > li").forEach(li => {

        const link = li.querySelector(":scope > a");
        const dropdown = li.querySelector(".mega-drop, .simple-drop");

        if (!dropdown) return;

        link.addEventListener("click", (e) => {

            e.preventDefault();

            /* Close other dropdowns */
            document.querySelectorAll(".nav-links > li").forEach(item => {
                if (item !== li) {
                    item.classList.remove("open");
                }
            });

            /* Open / Close Current */
            li.classList.toggle("open");
        });
    });

    /* Close when clicking outside */
    document.addEventListener("click", (e) => {

        if (!e.target.closest(".nav-links")) {

            document.querySelectorAll(".nav-links > li")
                .forEach(li => li.classList.remove("open"));

        }
    });

    /* Prevent menu click from closing */
    navLinks.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    /* Reset on resize */
    window.addEventListener("resize", () => {

        if (window.innerWidth > 992) {

            navLinks.classList.remove("open");
            toggle.classList.remove("open");

        }

    });

}

/* Highlights the nav link matching the current page, based on
   each top-level link's data-page attribute in header.html.
   Pages inside /blog/ (individual posts) count as "blog" too. */
function setActiveNavLink() {
    const path = location.pathname;
    const current = path.startsWith("/blog/")
        ? "blog"
        : (path.split("/").pop().replace(".html", "") || "index");

    document.querySelectorAll(".nav-links > li > a[data-page], .nav-cta[data-page]")
        .forEach(a => {
            a.classList.toggle("active", a.dataset.page === current);
        });
}
/* ────────────────────────────────────────
   FORM HANDLING (Contact + Newsletter)
   Replace the `endpoint` values below with your own
   Formspree / Netlify Forms / EmailJS endpoint to go live.
   ──────────────────────────────────────── */
function handleFormSubmit(form, msgEl, successText) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"], .submit-btn');
    const endpoint = form.getAttribute('data-endpoint');
    msgEl.textContent = '';
    msgEl.className = 'form-msg';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (btn) { btn.disabled = true; btn.dataset.original = btn.textContent; btn.textContent = 'Sending...'; }

    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        let data = null;
        try { data = await res.json(); } catch (_) { /* non-JSON response */ }
        const ok = data && typeof data.ok === 'boolean' ? data.ok : res.ok;
        if (!ok) {
          throw new Error((data && data.message) || 'Request failed (' + res.status + ')');
        }
      }
      msgEl.textContent = successText;
      msgEl.classList.add('ok');
      form.reset();
    } catch (err) {
      msgEl.textContent = (err && err.message && err.message !== 'Failed to fetch')
        ? err.message
        : "Something went wrong. Please email us directly.";
      msgEl.classList.add('err');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.original; }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    handleFormSubmit(contactForm, document.getElementById('contactMsg'), "Thanks! Your message has been sent — we'll reply within 24 hours.");
  }

  /* Note: the footer's .newsletter-form is handled by initNewsletterForms(),
     called after footer.html is injected (see top of file). Any inline
     newsletter form already present in the page body at DOMContentLoaded
     is also picked up there since initNewsletterForms() queries the whole
     document. */

  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    handleFormSubmit(quoteForm, document.getElementById('quoteMsg'), "Request received! Our team will reach out shortly.");
  }

  /* Blog Category Filter */
  const filterBtns = document.querySelectorAll('.blog-filter button');
  const blogCards = document.querySelectorAll('.blog-card');
  if (filterBtns.length && blogCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        blogCards.forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'block' : 'none';
        });
      });
    });
  }

  /* FAQ Accordion (About / Services / Blog / Contact) */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ==========================
     WHATSAPP CHAT WIDGET
  ========================== */
  const waToggle = document.getElementById('waToggle');
  const waPanel  = document.getElementById('waPanel');
  const WA_NUMBER = '916369513109'; // TODO: your WhatsApp number (country code + number, no + or spaces)

  waToggle?.addEventListener('click', () => { waPanel.classList.toggle('open'); waToggle.classList.toggle('open'); });
  document.getElementById('waClose')?.addEventListener('click', () => { waPanel.classList.remove('open'); waToggle.classList.remove('open'); });

  document.getElementById('waForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries([...e.target.querySelectorAll('[data-f]')].map(el => [el.dataset.f, el.value.trim()]));
    if (!f.Name || !f.Phone) return;
    const msg = `Hello DK Global Technologies, 
    \n My name is ${f.Name}. I’m interested in exploring your services and would like to discuss our requirements. 
    \n *Requirement:* \n I would like to understand your services and discuss how they can meet our business needs. 
    \n Contact Details: \n*Phone :* ${f.Phone}.${f.Email ? `\n*Email :* ${f.Email}.` : ''}${f.Address ? `\n*Location:* ${f.Address}.` : ''}\n*Requirement:* ${f.Requirement || 'General enquiry'}. 
    \n Please feel free to contact me to discuss further. Looking forward to hearing from you.
    \n Thank you! `;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });
});

/* ══════════════════════════════════════
   DK Global Technologies — Works page script
   Load AFTER script.js (which injects the header/footer).
   ══════════════════════════════════════ */
(function () {
  const inner = document.getElementById('wkInner');
  if (!inner) return;

  /* ─────────── EDIT YOUR CONTENT HERE ───────────
     Each card: [category, title, description, photo?, link?]
       • photo  – optional image path; without it the card gets a gold gradient + icon
       • link   – optional page; without it the card links to contact.html
     Cards marked SAMPLE are placeholders – replace them with your real projects. */
  const S = [
    { n: 'Web Development', ic: 'code', sub: 'Fast, mobile-friendly websites built to turn visitors into customers.', c: [
      ['Healthcare', 'CNS Super Speciality Hospital', 'Rebuilt the hospital website with local SEO and appointment-focused UX, improving visibility for high-intent local searches.', 'image/Case Studies/Case Study-1.png', 'blog.html#case-studies',
        { url: 'https://cnssuperspecialityhospital.com/', desktop: 'image/Works/Website Development/CNS Desktop.png', mobile: 'image/Works/Website Development/CNS Mobile.png' }],   /* TODO: real website URL */
      ['Industrial', 'Eagle Graphics Machinery', 'A B2B website with clear product catalogs and inquiry funnels that helps generate qualified export and domestic leads.', 'image/Case Studies/Case Study-2.png', 'blog.html#case-studies',
        { url: 'https://eaglegraphics.com/', desktop: 'image/Works/Website Development/EAGLE GRAPHICS MACHINERY Desktop.png', mobile: 'image/Works/Website Development/EAGLE GRAPHICS MACHINERY Mobile.png' }],   /* TODO: real website URL */
      ['Lifestyle', 'Artysto Salon', 'A stylish, booking-ready website with strong visual branding aligned with the salon\'s premium positioning.', 'image/projects/Project-6.png', 'blog.html#case-studies',
        { url: 'https://yercaudcottage.netlify.app/', desktop: 'image/Works/Website Development/yercaudcottage Desktop.png', mobile: 'image/Works/Website Development/yercaud Mobile.png' }],   /* TODO: real website URL */
      ['Lifestyle', 'Corporate website for a local manufacturer', 'SAMPLE: Clean multi-page site with service pages, enquiry forms and fast loading on mobile.', 'image/projects/Project-3.png', 'blog.html#case-studies', 
        { url: 'https://zerovolume.netlify.app/', desktop: 'image/Works/Website Development/zerovolume Desktop.png', mobile: 'image/Works/Website Development/zerovolume Mobile.png' }], /* TODO: real website URL */
      ['E-commerce', 'E-commerce website for a local Dairy Farm', 'SAMPLE: Clean multi-page site with service pages, enquiry forms and fast loading on mobile.', 'image/projects/Project-7.png', 'blog.html#case-studies', 
        { url: 'https://uzhavan-milk.netlify.app/', desktop: 'image/Works/Website Development/uzhavan-milk Desktop.png', mobile: 'image/Works/Website Development/uzhavan-milk Mobile.png' }] /* TODO: real website URL */
    ]},
    { n: 'SEO Optimization', ic: 'search', sub: 'Rankings that bring in customers who are ready to buy.', c: [
      /* Results report: images are shown in order, then the keyword table.
         Keyword rows are [keyword, position after SEO, optional custom Google link]. */
      ['Healthcare', 'CNS Superspeciality Hospital', 'Local SEO optimization that improved organic visibility for high-intent searches and appointment enquiries.', 'image/Case Studies/Case Study-1.png', '', {
        images: [
          { src: 'image/works/seo/search-console.png', title: 'Google Search Console', caption: 'Search performance as reported by Google' },
          { src: 'image/works/seo/google-analytics.png', title: 'Google Analytics', caption: 'Website traffic and visitor activity' },
          { src: 'image/works/seo/before-after.png', title: 'Before vs. After SEO Results', caption: 'Rankings and traffic compared' }
        ],
        keywords: [
          ['Super Speciality Hospital in Tirupur', 2],
          ['Best neuro & spine surgery in Tirupur', 1],
          ['Best Joint Replacement in Tirupur', 2],
          ['Super speciality hospital in avinashi', 2],
          ['Best ICU & Anaesthesiology in Tirupur', 2],
          ['BEST Radiology & Imaging in Tirupur', 1],
          ['Best Neuro Hospital in Tirupur', 3],
          ['Best Paediatric Surgery in Tirupur', 4]
        ]
      }],
      ['Industrial', 'Eagle Graphics Machinery', 'Buyer-intent keywords such as \u201cBaby Garment Manufacturer In Sweden\u201d now sit in Google\u2019s top 3. See the Search Console, Analytics and before/after results..', 'image/Case Studies/Case Study-2.png', 'blog.html#case-studies',{
        images: [
          { src: 'image/works/seo/search-console.png', title: 'Google Search Console', caption: 'Search performance as reported by Google' },
          { src: 'image/works/seo/google-analytics.png', title: 'Google Analytics', caption: 'Website traffic and visitor activity' },
          { src: 'image/works/seo/before-after.png', title: 'Before vs. After SEO Results', caption: 'Rankings and traffic compared' }
        ],
        keywords: [
          ['Best Neuro Hospital in Tirupur', 3],
          ['Cotton Baby Clothes Exporters In Finland', 1],
          ['Top Kids Wear Exporter In Brunei', 1],
          ['Baby Clothes Importer In Denmark', 2],
          ['Top Kids Garment Manufacturer In Israel', 2],
          ['Women Clothing Exporter In Canada', 3],
          ['Apparel Manufacturers In Brunei', 3]
        ]
      }],
      ['Printing Press', 'Map pack ranking for a Tiruppur business', 'SAMPLE: Google Business Profile, citations and review strategy to rank in the local map pack.'],
      ['Technical SEO', 'Technical SEO audit and fixes', 'SAMPLE: Site speed, crawlability, schema markup and Core Web Vitals sorted out before content work begins.'],
      ['Content SEO', 'Search-led content plan', 'SAMPLE: Keyword research and topic clusters built around what your customers actually search for.']
    ]},
    { n: 'Social Media', ic: 'share', sub: 'Communities, not just followers.', c: [
      ['Instagram', 'Instagram content system', 'SAMPLE: A weekly mix of posts, carousels and reels that stays on brand.'],
      ['LinkedIn', 'LinkedIn presence for founders', 'SAMPLE: Founder and company posts that earn trust with decision makers.'],
      ['Short video', 'Reels and Shorts campaign', 'SAMPLE: Short-form video campaigns built around offers and launches.'],
      ['Community', 'Community management', 'SAMPLE: Replies, comments and messages handled so no lead goes cold.']
    ]},
    { n: 'Performance Marketing', ic: 'trend', sub: 'Paid campaigns measured on enquiries and sales, not clicks.', c: [
      ['Google Ads', 'Lead generation on Google Ads', 'SAMPLE: Search campaigns with tracked calls and forms, tuned every week.'],
      ['Meta Ads', 'Meta Ads for local businesses', 'SAMPLE: Facebook and Instagram campaigns with tested creatives and audiences.'],
      ['Retargeting', 'Retargeting campaigns', 'SAMPLE: Bring back visitors who looked but did not enquire or buy.'],
      ['Analytics', 'Tracking and reporting setup', 'SAMPLE: Clear dashboards showing cost per lead and what each channel delivers.']
    ]},
    { n: 'Designs', ic: 'palette', sub: 'Identity and creative that make people remember you.', c: [
      ['Branding', 'Artysto Salon', 'A stylish, booking-ready website with strong visual branding aligned with the salon\'s premium positioning.', 'image/Case Studies/Case Study-3.png', 'blog.html#case-studies'],
      ['UI / UX', 'Website UI/UX design', 'SAMPLE: Layouts and user flows designed around the action you want visitors to take.'],
      ['Branding', 'Logo and brand identity', 'SAMPLE: Logo, colors, typography and a simple brand guide ready to use.'],
      ['Creatives', 'Social media creatives', 'SAMPLE: Post, story and ad designs delivered in every size you need.']
    ]}
  ];

  /* ─────────── Icons ─────────── */
  const I = {
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3 0 5.6-2.5 5.6-5.5C22.9 5.9 18 2 12 2Z"/>',
    prev: '<path d="m15 18-6-6 6-6"/>', next: '<path d="m9 18 6-6-6-6"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;
  const pad = n => String(n).padStart(2, '0');
  const esc = t => String(t).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  /* ─────────── Elements + state ─────────── */
  const orbit = document.getElementById('wkOrbit'), main = document.getElementById('wkMain'),
        mlabel = document.getElementById('wkLabel'), r1 = document.getElementById('wkR1'),
        r2 = document.getElementById('wkR2'), prog = document.getElementById('wkProg');
  const NAV = 75, N = S.length, RAD = Math.PI / 180;
  const isM = () => matchMedia('(max-width:992px)').matches;
  const wrap = v => ((v + N / 2) % N + N) % N - N / 2;
  let cur = -1, pos = 0, target = 0, G = {}, raf = 0, dragging = false, justDragged = false;

  /* ─────────── Content panel ─────────── */
  function render() {
    const x = S[cur], cats = ['All', ...new Set(x.c.map(c => c[0]))];
    const words = x.n.split(' '), last = words.pop();
    inner.innerHTML = `
      <div class="wk-head">
        <div><h2>${words.length ? esc(words.join(' ')) + ' ' : ''}<span>${esc(last)}</span></h2><p>${esc(x.sub)}</p></div>
        <div class="wk-arrows"><small>${pad(cur + 1)} / ${pad(N)}</small>
          <button type="button" id="wkPrev" aria-label="Previous service">${svg('prev')}</button>
          <button type="button" id="wkNext" aria-label="Next service">${svg('next')}</button></div>
      </div>
      <div class="wk-chips">${cats.map((c, i) => `<button type="button" class="wk-chip${i ? '' : ' on'}" data-f="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="wk-grid">${x.c.map((c, i) => {
        const hh = 40 + (i * 7) % 20 + cur * 2, photo = c[3];
        const grad = `radial-gradient(circle at 85% 15%,hsla(${hh},85%,62%,.6),transparent 55%),radial-gradient(circle at 10% 100%,hsla(${hh + 40},80%,50%,.35),transparent 60%),linear-gradient(135deg,hsl(${hh},40%,17%),hsl(${hh + 30},45%,7%))`;
        const bg = photo ? `url('${esc(photo)}') center/cover no-repeat,${grad}` : grad;
        const v = c[5] || {}, href = v.url || c[4] || 'contact.html', label = v.url ? 'Preview website' : (v.images || v.keywords) ? 'View results' : 'View work';
        return `<a href="${esc(href)}" class="wk-card has-site" data-cat="${esc(c[0])}" data-i="${i}" style="--i:${i}">
          <div class="wk-thumb${photo ? '' : ' nophoto'}" style="background:${bg}">${photo ? '' : `<span style="color:hsl(${hh},90%,82%)">${svg(x.ic)}</span>`}<em>${esc(c[0])}</em><span class="wk-prev">${label}</span></div>
          <div class="wk-body"><div class="wk-cat">${esc(x.n)}</div><h3>${esc(c[1])}</h3><p>${esc(c[2].replace(/^SAMPLE:\s*/, ''))}</p>
          <span class="wk-more">${label}</span></div></a>`;
      }).join('')}</div>
      <div class="wk-cta"><b>Want results like these?</b><a href="contact.html">Start a project</a></div>`;
    inner.querySelectorAll('.wk-chip').forEach(b => b.onclick = () => {
      inner.querySelectorAll('.wk-chip').forEach(k => k.classList.toggle('on', k === b));
      inner.querySelectorAll('.wk-card').forEach(c => c.classList.toggle('hide', b.dataset.f !== 'All' && c.dataset.cat !== b.dataset.f));
    });
    document.getElementById('wkPrev').onclick = () => go(cur - 1);
    document.getElementById('wkNext').onclick = () => go(cur + 1);
    inner.querySelectorAll('.wk-card.has-site').forEach(a => a.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;      // let "open in new tab" work normally
      e.preventDefault(); openPreview(S[cur], +a.dataset.i, a);
    }));
  }

  /* ─────────── Wheel menu ─────────── */
  const nodes = S.map((x, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'wk-node'; b.setAttribute('aria-label', x.n);
    b.innerHTML = `<span class="wk-ic">${svg(x.ic)}</span><span class="wk-lb">${esc(x.n)}</span>`;
    b.onclick = () => go(i); orbit.appendChild(b); return b;
  });

  function layout() {
    const w = orbit.clientWidth, h = orbit.clientHeight, m = isM();
    if (!m) { const R = h * .78, bx = Math.max(R * .09 + 40, Math.min(w * .4, w - 235)); G = { m, R, step: 12, cx: bx - R, cy: h / 2 + h * .03 }; }
    else { const R = Math.min(w * .8, 300); G = { m, R, step: 15, cx: w / 2, cy: 76 - R }; }   // inverted (smile) arc on mobile
    G.p = a => { a *= RAD; return G.m ? [G.cx + G.R * Math.sin(a), G.cy + G.R * Math.cos(a)] : [G.cx + G.R * Math.cos(a), G.cy + G.R * Math.sin(a)]; };
    [[r1, 0], [r2, 38]].forEach(([c, o]) => { c.setAttribute('cx', G.cx); c.setAttribute('cy', G.cy); c.setAttribute('r', G.R + o); });
    prog.setAttribute('d', `M${G.p(-G.step * 1.3)} A${G.R} ${G.R} 0 0 ${G.m ? 0 : 1} ${G.p(G.step * 1.3)}`);
    frame();
  }
  /* place each item on the wheel; items past the visible window fade out and wrap around */
  function frame() {
    nodes.forEach((nd, i) => {
      const d = wrap(i - pos), [x, y] = G.p(d * G.step), ad = Math.abs(d), o = Math.max(0, Math.min(1, 2.6 - ad));
      nd.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${1 - .05 * ad})`;
      nd.style.opacity = o; nd.style.pointerEvents = o > .3 ? 'auto' : 'none';
    });
    const k = pos * G.step * RAD * (G.m ? -1 : 1);
    r1.style.strokeDashoffset = k * G.R; r2.style.strokeDashoffset = k * (G.R + 38);
  }
  function tick() { pos += (target - pos) * .16; if (Math.abs(target - pos) < .002) pos = target; frame(); raf = pos === target ? 0 : requestAnimationFrame(tick); }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  function setCur(i) {
    if (i === cur) return;
    const first = cur === -1; cur = i;
    nodes.forEach((n, k) => { n.classList.toggle('on', k === cur); if (k === cur) n.setAttribute('aria-current', 'true'); else n.removeAttribute('aria-current'); });
    mlabel.textContent = S[cur].n; render();
    if (first) return;
    try { history.replaceState(null, '', '#' + slug(S[cur].n)); } catch (e) {}   // keep the address shareable
    if (isM()) { const top = main.getBoundingClientRect().top + scrollY - NAV - 156; if (scrollY > top) scrollTo({ top, behavior: 'smooth' }); }
    else main.scrollTo({ top: 0 });
  }
  function go(i) {
    i = ((i % N) + N) % N; target = Math.round(target) + wrap(i - Math.round(target));
    setCur(i); kick();
  }

  /* drag / swipe to rotate (vertical on desktop, horizontal on mobile) */
  let sx = 0, sy = 0, sp = 0, down = false;
  orbit.addEventListener('pointerdown', e => { down = true; dragging = false; sx = e.clientX; sy = e.clientY; sp = pos; });
  orbit.addEventListener('pointermove', e => {
    if (!down) return; const dd = G.m ? e.clientX - sx : e.clientY - sy;
    if (!dragging && Math.abs(dd) > 6) { dragging = true; orbit.setPointerCapture(e.pointerId); orbit.classList.add('drag'); }
    if (dragging) { pos = target = sp - dd / (G.R * G.step * RAD); frame(); }
  });
  function endDrag() {
    if (!down) return; down = false;
    if (dragging) {
      dragging = false; orbit.classList.remove('drag'); justDragged = true; setTimeout(() => justDragged = false, 60);
      const t = Math.round(pos); target = t; setCur(((t % N) + N) % N); kick();
    }
  }
  orbit.addEventListener('pointerup', endDrag); orbit.addEventListener('pointercancel', endDrag);
  orbit.addEventListener('click', e => { if (justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);

  addEventListener('resize', layout);
  addEventListener('keydown', e => {
    if (document.body.classList.contains('wk-lock') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  /* ─────────── Website preview pop-up ───────────
     Desktop screenshot by default; the phone icon (top right) switches to the mobile screenshot.
     Hovering the screenshot shows "Click to visit"; clicking it opens the live website. */
  const ICON = {
    desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    mobile: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    out: '<path d="M7 17 17 7M8 7h9v9"/>'
  };
  const ico = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  const modal = document.createElement('div');
  modal.className = 'wk-modal'; modal.hidden = true;
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Website preview');
  modal.innerHTML = `
    <div class="wk-m-box">
      <div class="wk-m-bar">
        <span class="wk-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="wk-m-url"></span>
        <div class="wk-m-tools">
          <button type="button" class="wk-m-view on" data-v="desktop" aria-label="Desktop view" title="Desktop view">${ico('desktop')}</button>
          <button type="button" class="wk-m-view" data-v="mobile" aria-label="Mobile view" title="Mobile view">${ico('mobile')}</button>
          <button type="button" class="wk-m-close" aria-label="Close preview" title="Close">${ico('close')}</button>
        </div>
      </div>
      <div class="wk-m-stage" data-view="desktop">
        <div class="wk-m-device"><div class="wk-m-scroll">
          <a class="wk-m-shot" target="_blank" rel="noopener"><img alt=""></a>
          <div class="wk-m-report" hidden></div>
        </div></div>
      </div>
      <div class="wk-m-foot"><span>Scroll to see the full page</span><a class="wk-m-visit" target="_blank" rel="noopener">Visit website ${ico('out')}</a></div>
    </div>
    <div class="wk-m-tip" aria-hidden="true">Click to visit</div>`;
  document.body.appendChild(modal);

  const q = s => modal.querySelector(s);
  const stage = q('.wk-m-stage'), scroller = q('.wk-m-scroll'), shot = q('.wk-m-shot'), img = q('.wk-m-shot img'),
        urlEl = q('.wk-m-url'), report = q('.wk-m-report'), visit = q('.wk-m-visit'), tip = q('.wk-m-tip'), mobBtn = q('[data-v="mobile"]');
  /* Results report: stacked images, then the keyword ranking table with a Google "verify" link per row */
  const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function showReport(v) {
    stage.dataset.view = 'desktop';
    modal.querySelectorAll('.wk-m-view').forEach(b => b.classList.toggle('on', b.dataset.v === 'desktop'));
    const figs = (v.images || []).map(m => `<figure class="wk-r-fig"><figcaption><b>${esc(m.title)}</b>${m.caption ? `<span>${esc(m.caption)}</span>` : ''}</figcaption><img src="${esc(m.src)}" alt="${esc(m.title)}" loading="lazy"></figure>`).join('');
    const rows = (v.keywords || []).map(k => {
      const link = k[2] || 'https://www.google.com/search?q=' + encodeURIComponent(k[0]);
      return `<tr><td>${esc(k[0])}</td><td>${esc(k[1])}</td><td><a class="wk-g" href="${esc(link)}" target="_blank" rel="noopener" aria-label="Verify \u201c${esc(k[0])}\u201d on Google" title="Verify on Google">${GOOGLE}</a></td></tr>`;
    }).join('');
    const table = rows ? `<section class="wk-r-kw"><h4>Keyword rankings</h4><div class="wk-r-wrap"><table><thead><tr><th>Keywords</th><th>After SEO</th><th>Verify</th></tr></thead><tbody>${rows}</tbody></table></div><p>Click the Google icon to search the keyword yourself. Positions can vary by location and change over time.</p></section>` : '';
    report.innerHTML = figs + table;
    report.querySelectorAll('img').forEach(im => im.onerror = () => {          // image file not uploaded yet
      const d = document.createElement('div'); d.className = 'wk-m-empty small'; d.textContent = 'Image coming soon'; im.replaceWith(d);
    });
    scroller.scrollTop = 0;
  }

  const hint = q('.wk-m-foot span');
  const empty = document.createElement('div'); empty.className = 'wk-m-empty';   // shown while an image file is missing
  let cs = null, opener = null, fallback = '', closeTimer = 0;

  function setView(v) {
    stage.dataset.view = v;
    modal.querySelectorAll('.wk-m-view').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    empty.remove(); img.hidden = false; img.classList.remove('in');
    img.onload = () => img.classList.add('in');
    img.onerror = () => {
      if (v === 'mobile') { mobBtn.hidden = true; setView('desktop'); }              // no mobile image yet: stay on desktop
      else if (fallback && img.getAttribute('src') !== fallback) img.src = fallback;   // main image missing: use the card photo
      else { img.hidden = true; empty.innerHTML = `<b>${esc(cs.title)}</b><span>Image coming soon</span>`; shot.appendChild(empty); }
    };
    img.alt = (v === 'mobile' ? 'Mobile view of ' : cs.url ? 'Desktop view of ' : '') + cs.title;
    img.src = v === 'mobile' ? cs.mobile : cs.desktop;
    if (img.complete && img.naturalWidth) img.classList.add('in');
    scroller.scrollTop = 0;
  }
  /* x = the service, i = index of the card. Image defaults to image/works/<service>-<number>.png */
  function openPreview(x, i, from) {
    clearTimeout(closeTimer);
    const c = x.c[i], v = c[5] || {};
    cs = { title: c[1], url: v.url || '', mobile: v.mobile || '', report: (v.images || v.keywords) ? v : null,
           desktop: v.desktop || `image/works/${slug(x.n)}-${i + 1}.png` };
    opener = from; fallback = c[3] || '';
    urlEl.textContent = cs.url ? cs.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : c[1];
    stage.dataset.kind = cs.report ? 'report' : cs.url ? 'site' : 'image';
    if (cs.url) shot.href = cs.url; else shot.removeAttribute('href');
    visit.href = cs.url || c[4] || 'contact.html';
    visit.target = cs.url ? '_blank' : '_self';
    visit.innerHTML = `${cs.url ? 'Visit website' : c[4] ? 'Read case study' : 'Get a similar project'} ${ico('out')}`;
    hint.textContent = cs.report ? 'Scroll to see all results' : cs.url ? 'Scroll to see the full page' : `${x.n}  ·  ${c[0]}`;
    mobBtn.hidden = !cs.mobile;
    modal.hidden = false; document.body.classList.add('wk-lock');
    shot.hidden = !!cs.report; report.hidden = !cs.report;
    if (cs.report) { showReport(cs.report); mobBtn.hidden = true; } else setView('desktop');
    requestAnimationFrame(() => modal.classList.add('open'));
    q('.wk-m-close').focus();
  }
  function closePreview() {
    modal.classList.remove('open'); tip.classList.remove('on');
    document.body.classList.remove('wk-lock');
    closeTimer = setTimeout(() => { modal.hidden = true; img.removeAttribute('src'); }, 220);
    if (opener) opener.focus();
  }
  modal.addEventListener('click', e => { if (e.target === modal) closePreview(); });
  q('.wk-m-close').onclick = closePreview;
  modal.querySelectorAll('.wk-m-view').forEach(b => b.onclick = () => setView(b.dataset.v));
  /* "Click to visit" bubble that follows the mouse over the screenshot */
  shot.addEventListener('mouseenter', () => { if (cs && cs.url) tip.classList.add('on'); });
  shot.addEventListener('mouseleave', () => tip.classList.remove('on'));
  shot.addEventListener('mousemove', e => { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; });
  addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closePreview();
    if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll('button,a[href]')].filter(el => el.offsetParent);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* open a specific service with works.html#seo-optimization etc. */
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  /* older/short hashes still work: works.html#seo, #ui-ux-design, #digital-marketing */
  const alias = { seo: 'seo-optimization', 'ui-ux-design': 'social-media', 'digital-marketing': 'performance-marketing' };
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1)).toLowerCase(), k = alias[h] || h;
    return S.findIndex(s => slug(s.n) === k);
  };
  layout(); target = pos = 0; go(Math.max(0, fromHash()));
  /* clicking a Works sub-link in the navbar while already on this page switches the menu without reloading */
  addEventListener('hashchange', () => { const i = fromHash(); if (i > -1) go(i); });
})();
