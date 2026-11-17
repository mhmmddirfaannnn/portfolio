/* ============================================================
   UCAPAN ULANG TAHUN — script.js
   Alur: Opening → PIN → Konten (10 babak) → Replay
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ⭐ CONFIG — EDIT BAGIAN INI SAJA untuk mengubah pengaturan
     ============================================================ */
  const CONFIG = {
    // Nama panggilan (muncul di babak "Your Special Day")
    herName: 'KALINA MAULIDA',

    // Tanggal spesial (muncul di babak "Your Special Day")
    specialDate: '14 April 2005',

    // 🔐 PIN untuk membuka kejutan (8 digit, angka)
    pin: '14042005',

    // Jumlah partikel latar ('auto' = mengikuti ukuran layar, atau angka)
    particleCount: 'auto',
  };
  /* ============================================================
     AKHIR CONFIG — semua teks ucapan panjang ada di index.html,
     agar mudah diedit langsung.
     ============================================================ */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fungsi confetti dideklarasikan di sini (diisi di modul 8),
  // sehingga bisa dipakai modul manapun.
  let burstConfetti = null;

  /* ==========================================================
     1. ISI KONTEN DARI CONFIG
     ========================================================== */
  document.querySelectorAll('[id^="her-name"]').forEach(function (el) {
    el.textContent = CONFIG.herName;
  });

  const specialDate = document.getElementById('special-date');
  if (specialDate) {
    specialDate.textContent = CONFIG.specialDate + ' — tanggal paling penting sedunia.';
  }

  /* ==========================================================
     2. GATE: OPENING → PIN
     ========================================================== */
  const screenOpening = document.getElementById('screen-opening');
  const screenPin = document.getElementById('screen-pin');
  const btnStart = document.getElementById('btn-start');

  function showScreen(screen) {
    [screenOpening, screenPin].forEach(function (s) {
      s.classList.toggle('is-active', s === screen);
    });
  }

  if (btnStart) {
    btnStart.addEventListener('click', function () {
      showScreen(screenPin);
    });
  }

  /* ==========================================================
     3. PIN LOGIC
     ========================================================== */
  const pinPanel = document.getElementById('pin-panel');
  const pinDots = document.getElementById('pin-dots');
  const pinMessage = document.getElementById('pin-message');
  const dotEls = pinDots ? Array.prototype.slice.call(pinDots.querySelectorAll('span')) : [];

  let entered = '';
  let checking = false; // cegah input ganda saat sedang memeriksa

  function renderDots() {
    dotEls.forEach(function (dot, i) {
      dot.classList.toggle('filled', i < entered.length);
    });
  }

  function pinError() {
    pinPanel.classList.add('shake');
    pinMessage.textContent = 'Hmm, bukan itu 💫 Coba lagi ya…';
    pinMessage.classList.add('error');
    pinMessage.classList.remove('ok');

    setTimeout(function () {
      pinPanel.classList.remove('shake');
      entered = '';
      renderDots();
    }, 550);
  }

  function pinSuccess() {
    checking = true;
    pinMessage.textContent = 'Kunci terbuka… selamat datang di kejutanmu 💜';
    pinMessage.classList.add('ok');
    pinMessage.classList.remove('error');
    pinDots.classList.add('success');

    if (burstConfetti) burstConfetti(120);

    // Transisi menuju konten utama
    setTimeout(unlockExperience, 1100);
  }

  function pressKey(key) {
    if (checking) return;

    if (key === 'C') {
      entered = '';
      pinMessage.textContent = '';
      pinMessage.classList.remove('error', 'ok');
      renderDots();
      return;
    }

    if (key === 'X') {
      entered = entered.slice(0, -1);
      renderDots();
      return;
    }

    if (!/^\d$/.test(key)) return;
    if (entered.length >= dotEls.length) return;

    entered += key;
    renderDots();

    // Otomatis periksa saat 8 digit terisi
    if (entered.length === dotEls.length) {
      if (entered === CONFIG.pin) {
        pinSuccess();
      } else {
        pinError();
      }
    }
  }

  // Klik keypad
  if (pinPanel) {
    pinPanel.querySelectorAll('[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pressKey(btn.getAttribute('data-digit'));
      });
    });
  }

  // Dukungan keyboard fisik (desktop) saat layar PIN aktif
  document.addEventListener('keydown', function (e) {
    if (!screenPin.classList.contains('is-active')) return;
    if (e.key >= '0' && e.key <= '9') pressKey(e.key);
    else if (e.key === 'Backspace') pressKey('X');
    else if (e.key === 'Escape') pressKey('C');
  });

  /* ==========================================================
     4. UNLOCK — PIN benar → tampilkan konten utama
     ========================================================== */
  let contentReady = false;

  function unlockExperience() {
    document.body.classList.remove('locked');
    document.body.classList.add('unlocked'); // menampilkan #content, menyembunyikan screen
    window.scrollTo(0, 0);

    if (!contentReady) {
      contentReady = true;
      initReveal();          // aktifkan animasi reveal untuk konten
    }
  }

  /* ==========================================================
     5. REPLAY — kembali ke Opening & kunci ulang
     ========================================================== */
  const btnReplay = document.getElementById('btn-replay');

  if (btnReplay) {
    btnReplay.addEventListener('click', function () {
      // Reset PIN
      entered = '';
      checking = false;
      renderDots();
      if (pinDots) pinDots.classList.remove('success');
      if (pinMessage) {
        pinMessage.textContent = '';
        pinMessage.classList.remove('error', 'ok');
      }

      // Kunci lagi & kembali ke Opening
      document.body.classList.remove('unlocked');
      document.body.classList.add('locked');
      showScreen(screenOpening);
      window.scrollTo(0, 0);
    });
  }

  /* ==========================================================
     6. SCROLL REVEAL — elemen .reveal muncul saat di-scroll
        (dipanggil saat konten pertama kali dibuka)
     ========================================================== */
  function initReveal() {
    const revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    if ('IntersectionObserver' in window && !reduceMotion) {
      let i = 0;
      revealEls.forEach(function (el) {
        el.style.setProperty('--reveal-delay', (i % 4) * 0.09 + 's');
        i++;
      });

      const revealIO = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12 }
      );

      revealEls.forEach(function (el) { revealIO.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }
  }

  /* ==========================================================
     7. OUR MEMORIES — fallback placeholder + lightbox
     ========================================================== */
  // a) Jika file foto belum ada, tampilkan placeholder (📷)
  document.querySelectorAll('.photo__frame img').forEach(function (img) {
    function markLoaded() { img.classList.add('loaded'); }
    function markFailed() { img.remove(); } // placeholder .photo__ph tetap terlihat

    img.addEventListener('load', markLoaded);
    img.addEventListener('error', markFailed);

    // Tangani gambar yang sudah selesai/gagal SEBELUM listener terpasang:
    // script.js berada di akhir <body>, jadi gambar yang hilang bisa error
    // lebih dulu dan event 'error' tidak akan pernah terpicu lagi.
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else if (img.complete && img.naturalWidth === 0) markFailed();
  });

  // b) Lightbox: klik foto → diperbesar
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCap = document.getElementById('lightbox-cap');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(figure) {
    const img = figure.querySelector('img');
    if (!img || !img.classList.contains('loaded')) return; // hanya foto yang termuat

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent =
      figure.getAttribute('data-caption') ||
      (figure.querySelector('figcaption') || {}).textContent || '';

    lightbox.hidden = false;
    document.body.classList.add('locked'); // cegah scroll di belakang lightbox
    requestAnimationFrame(function () {
      lightbox.classList.add('open');
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('locked');
    setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
    }, 350);
  }

  document.querySelectorAll('.photo').forEach(function (figure) {
    figure.addEventListener('click', function () {
      openLightbox(figure);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox(); // klik area gelap → tutup
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* ==========================================================
     8. CONFETTI / PARTIKEL JATUH (canvas #celebrate)
        Hati & bintang kecil berhamburan
     ========================================================== */
  const celebrateCanvas = document.getElementById('celebrate');

  if (celebrateCanvas && !reduceMotion) {
    const cctx = celebrateCanvas.getContext('2d');
    let items = [];
    let celebrating = false;

    function resizeCelebrate() {
      celebrateCanvas.width = window.innerWidth;
      celebrateCanvas.height = window.innerHeight;
    }
    resizeCelebrate();
    window.addEventListener('resize', resizeCelebrate);

    burstConfetti = function (amount) {
      const shapes = ['heart', 'star', 'circle'];
      const colors = ['240, 171, 252', '192, 132, 252', '253, 164, 175', '249, 168, 212'];

      for (let i = 0; i < amount; i++) {
        items.push({
          x: Math.random() * celebrateCanvas.width,
          y: -20 - Math.random() * celebrateCanvas.height * 0.3,
          vx: (Math.random() - 0.5) * 1.6,
          vy: 1.5 + Math.random() * 2.5,
          size: 6 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.15,
          color: colors[i % colors.length],
          shape: shapes[i % shapes.length],
        });
      }

      if (!celebrating) {
        celebrating = true;
        updateConfetti();
      }
    };

    function drawHeart(s) {
      s.beginPath();
      s.moveTo(0, 4);
      s.bezierCurveTo(0, 1, -4, -1, -4, -4);
      s.bezierCurveTo(-4, -7, -1, -8, 0, -5);
      s.bezierCurveTo(1, -8, 4, -7, 4, -4);
      s.bezierCurveTo(4, -1, 0, 1, 0, 4);
      s.fill();
    }

    function drawStar(s) {
      s.beginPath();
      for (let i = 0; i < 5; i++) {
        const outer = (i * 4 * Math.PI) / 10 - Math.PI / 2;
        const inner = outer + (2 * Math.PI) / 10;
        s.lineTo(Math.cos(outer) * 5, Math.sin(outer) * 5);
        s.lineTo(Math.cos(inner) * 2, Math.sin(inner) * 2);
      }
      s.closePath();
      s.fill();
    }

    function drawCircle(s) {
      s.beginPath();
      s.arc(0, 0, 4, 0, Math.PI * 2);
      s.fill();
    }

    function updateConfetti() {
      cctx.clearRect(0, 0, celebrateCanvas.width, celebrateCanvas.height);

      items = items.filter(function (it) {
        it.x += it.vx;
        it.y += it.vy;
        it.vy += 0.015;          // gravitasi ringan
        it.rot += it.vr;
        return it.y < celebrateCanvas.height + 30;
      });

      items.forEach(function (it) {
        cctx.save();
        cctx.translate(it.x, it.y);
        cctx.rotate(it.rot);
        cctx.fillStyle = 'rgba(' + it.color + ', 0.9)';
        cctx.scale(it.size / 10, it.size / 10);

        if (it.shape === 'heart') drawHeart(cctx);
        else if (it.shape === 'star') drawStar(cctx);
        else drawCircle(cctx);

        cctx.restore();
      });

      if (items.length > 0) {
        requestAnimationFrame(updateConfetti);
      } else {
        celebrating = false;
        cctx.clearRect(0, 0, celebrateCanvas.width, celebrateCanvas.height);
      }
    }
  }

  /* ==========================================================
     9. PARTIKEL LATAR LEMBUT (canvas #particles)
        Cahaya kecil ungu-pink melayang pelan
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
      const count =
        CONFIG.particleCount === 'auto'
          ? Math.min(70, Math.floor((canvas.width * canvas.height) / 24000))
          : Number(CONFIG.particleCount) || 60;

      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          alpha: Math.random() * 0.5 + 0.12,
          color: Math.random() > 0.5 ? '240, 171, 252' : '192, 132, 252',
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ', ' + p.alpha + ')';
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
     10. VIDEO — placeholder otomatis jika file belum ada
         + pengaman audio: pastikan video TIDAK PERNAH dibisukan
     ========================================================== */
  const videoEl = document.getElementById('birthday-video');
  const videoSource = videoEl ? videoEl.querySelector('source') : null;
  const videoPh = document.getElementById('video-ph');

  if (videoSource && videoPh) {
    videoSource.addEventListener('error', function () {
      videoEl.style.display = 'none';
      videoPh.hidden = false;
    });
  }

  if (videoEl) {
    // Saat pengguna menekan play (via kontrol bawaan), pastikan audio
    // aktif: elemen tidak dibisukan dan volume penuh. Interaksi pengguna
    // (klik play) sudah memenuhi kebijakan autoplay browser, jadi suara
    // diizinkan. Ini hanya pengaman — elemen memang tidak pernah
    // diberi atribut muted sejak awal.
    videoEl.addEventListener('play', function () {
      if (videoEl.muted) videoEl.muted = false;
      if (videoEl.volume !== 1) videoEl.volume = 1;
    });
  }
})();
