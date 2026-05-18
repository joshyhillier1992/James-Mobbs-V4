(function () {
  /* Pages without carousel.js never get .is-loaded → CTA + blob stay hidden.
     Add it here as a guaranteed fallback; carousel.js adding it first is fine
     (classList.add is idempotent). */
  if (!document.body.classList.contains('is-loaded')) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.body.classList.add('is-loaded'))
    );
  }

  const drawer   = document.getElementById('nav-drawer');
  const openBtn  = document.getElementById('menu-open');
  const closeBtn = document.getElementById('menu-close');

  if (!drawer || !openBtn) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    openBtn.focus();
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);

  /* Close on backdrop click (outside drawer links) */
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* Close when a drawer link is tapped (smooth UX on mobile) */
  drawer.querySelectorAll('.nav-drawer__link').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeDrawer, 80);
    });
  });

  /* Scroll-reveal for nav — show after scrolling past 80px */
  const nav = document.querySelector('.main-nav');
  if (nav) {
    const THRESHOLD = 80;
    function onScroll() {
      document.body.classList.toggle('nav-visible', window.scrollY > THRESHOLD);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
