/* ============================================================
   PORTFOLIO — Mohamad Irfan Fahrudin
   script.js — interaksi & animasi
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. NAVBAR — scroll effect
     ========================================================== */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');

  function onScroll() {
    const y = window.scrollY;

    // Navbar menjadi lebih solid saat scroll
    navbar.classList.toggle('scrolled', y > 40);

    // Scroll progress indicator
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = docHeight > 0 ? (y / docHeight) * 100 + '%' : '0%';

    // Back to top
    backToTop.classList.toggle('visible', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ==========================================================
     2. MOBILE MENU (hamburger)
     ========================================================== */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Buka menu');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    document.body.classList.toggle('no-scroll', isOpen);
  });

  // Tutup menu saat link diklik
  navMenu.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ==========================================================
     3. ACTIVE NAVIGATION (scroll spy)
     ========================================================== */
  const sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // Journey tidak punya menu sendiri — petakan ke Education
          const id = entry.target.id === 'journey' ? 'education' : entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ==========================================================
     4. SCROLL REVEAL (fade in / slide up / slide left-right)
        + animasi progress bar skill
     ========================================================== */
  const revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealIO = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.getAttribute('data-reveal-delay') || '0';
          el.style.setProperty('--reveal-delay', delay + 's');
          el.classList.add('revealed');

          // Progress bar skill
          const bar = el.querySelector('.skill-progress');
          if (bar) bar.querySelector('span').style.width = bar.getAttribute('data-value') + '%';

          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    // Fallback: tampilkan semua & isi progress bar
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
    document.querySelectorAll('.skill-progress').forEach(function (bar) {
      bar.querySelector('span').style.width = bar.getAttribute('data-value') + '%';
    });
  }

  /* ==========================================================
     5. TYPING EFFECT (halus)
     ========================================================== */
  const typingEl = document.getElementById('typing');
  const words = ['Creative Developer', 'Developer', 'Programmer', 'Creative Technologist'];

  if (typingEl && !reduceMotion) {
    let wordIndex = 0;
    let charIndex = words[0].length - 1; // mulai dari kata pertama sudah penuh
    let deleting = false;

    function type() {
      const word = words[wordIndex];

      if (!deleting) {
        charIndex++;
        typingEl.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
          deleting = true;
          setTimeout(type, 2200); // jeda di akhir kata
          return;
        }
        setTimeout(type, 70);
      } else {
        charIndex--;
        typingEl.textContent = word.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(type, 400);
          return;
        }
        setTimeout(type, 40);
      }
    }

    setTimeout(type, 2200); // mulai setelah jeda di kata pertama
  }

  /* ==========================================================
     6. FLOATING PARTICLES (canvas)
     ========================================================== */
  const canvas = document.getElementById('particles');

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let rafId = null;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 26000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          alpha: Math.random() * 0.5 + 0.15,
          cyan: Math.random() > 0.35,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // wrap di tepi layar
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan
          ? 'rgba(34, 211, 238, ' + p.alpha + ')'
          : 'rgba(59, 130, 246, ' + p.alpha + ')';
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    resize();
    createParticles();
    draw();

    // Hemat resource saat tab tidak aktif
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (rafId === null) {
        draw();
      }
    });
  }

  /* ==========================================================
     7. CUSTOM CURSOR GLOW
     ========================================================== */
  const cursorGlow = document.getElementById('cursor-glow');

  if (cursorGlow && !reduceMotion) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    (function follow() {
      // mengikuti mouse dengan sedikit lag agar terasa halus
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      cursorGlow.style.transform = 'translate(' + gx + 'px, ' + gy + 'px) translate(-50%, -50%)';
      requestAnimationFrame(follow);
    })();
  }

  /* ==========================================================
     8. MOUSE PARALLAX — hero visual
     ========================================================== */
  const hero = document.getElementById('home');
  const parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.parallax'));

  if (hero && parallaxEls.length && !reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 .. 1
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;

      parallaxEls.forEach(function (el) {
        const depth = parseFloat(el.getAttribute('data-depth')) || 12;
        el.style.translate = cx * depth + 'px ' + cy * depth + 'px';
      });
    });
  }

  /* ==========================================================
     9. MAGNETIC BUTTONS
     ========================================================== */
  if (!reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px, ' + y * 0.22 + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ==========================================================
     10. CONTACT FORM (demo — tanpa backend)
     ========================================================== */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      let valid = true;

      [name, email, message].forEach(function (field) {
        const ok = field.checkValidity();
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        formStatus.style.color = '#f43f5e';
        formStatus.textContent = 'Mohon lengkapi semua field dengan benar.';
        return;
      }

      // Placeholder: sambungkan ke email service / backend jika sudah tersedia.
      formStatus.style.color = 'var(--accent)';
      formStatus.textContent = 'Pesan berhasil dikirim! (demo)';
      form.reset();
    });

    // Hapus tanda invalid saat user mengetik ulang
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('invalid');
      });
    });
  }
})();
