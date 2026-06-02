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

  /* ── 2. Glass spotlight — cursor-following radial glow ─────────── */
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
