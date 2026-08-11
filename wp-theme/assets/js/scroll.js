(function () {

  /* ── 1. Scroll reveal — fade up on enter ───────────────────────── */
  const SELECTORS = [
    '.case-card',
    '.stat',
    '.stats-bar',
    '.contact-section',
    '.projects__header',
    '.project-item',
    '.masonry-item',
    '.block--text',
    '.block--split',
    '.block--gallery',
    '.block--stats-row',
    '.block--cta',
    '.block--credits',
    '.block--related',
    '.section-title',
    '.site-colophon',
  ].join(',');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

    document.querySelectorAll(SELECTORS).forEach((el) => {
      /* Don't double-animate elements already covered by the page-load intro */
      if (el.closest('.hero-carousel') || el.closest('.case-studies')) return;

      const idx = Array.from(el.parentElement.children).indexOf(el);
      const delay = Math.min(idx * 0.09, 0.45);
      if (delay > 0) el.style.transitionDelay = delay + 's';

      el.classList.add('will-reveal');
      io.observe(el);
    });
  }

  /* ── 2. Stat counter — counts up when scrolled into view ──────── */
  function runCountUp(el) {
    const raw    = el.textContent.trim();
    const suffix = raw.replace(/[\d]/g, '');       /* e.g. "+" or "m²" */
    const target = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(target) || target === 0) return;

    const DURATION = 1800;
    const start    = performance.now();

    /* Ease-out cubic for natural deceleration */
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    (function tick(now) {
      const t       = Math.min((now - start) / DURATION, 1);
      const current = Math.round(easeOut(t) * target);
      el.textContent = current + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.stat__number').forEach((num, i) => {
          /* Stagger each counter by 120ms */
          setTimeout(() => runCountUp(num), i * 120);
        });
        counterIO.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) counterIO.observe(statsBar);
  }

  /* ── 3. Glass spotlight — cursor-following radial glow ─────────── */
  document.querySelectorAll(
    '.case-card, .stats-bar, .contact-section, .nav-back, .main-nav'
  ).forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });

})();
