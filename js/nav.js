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

  if (drawer && openBtn) {
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
  } /* end drawer block */

  /* ── Work list preview — follows cursor ─────── */
  const projItems   = document.querySelectorAll('.project-item__link');
  const projPreview = document.getElementById('js-proj-preview');
  const projImg     = document.getElementById('js-proj-preview-img');

  if (projPreview && projItems.length) {
    let moveRaf = null;

    function placePreview(x, y) {
      const pw = projPreview.offsetWidth;
      const ph = projPreview.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const offset = 28;

      let left = x + offset;
      let top  = y - ph / 2;

      /* Flip left when too close to right edge */
      if (left + pw > vw - 16) left = x - pw - offset;
      /* Clamp vertically */
      top = Math.max(12, Math.min(top, vh - ph - 12));

      projPreview.style.left = left + 'px';
      projPreview.style.top  = top  + 'px';
    }

    function onMove(e) {
      if (moveRaf) cancelAnimationFrame(moveRaf);
      moveRaf = requestAnimationFrame(() => placePreview(e.clientX, e.clientY));
    }

    projItems.forEach((link) => {
      link.addEventListener('mouseenter', (e) => {
        const bg = link.dataset.previewBg;
        if (bg && projImg) projImg.style.backgroundImage = bg;
        placePreview(e.clientX, e.clientY);
        projPreview.classList.add('is-visible');
        document.addEventListener('mousemove', onMove);
      });
      link.addEventListener('mouseleave', () => {
        projPreview.classList.remove('is-visible');
        document.removeEventListener('mousemove', onMove);
      });
    });
  }

})();
