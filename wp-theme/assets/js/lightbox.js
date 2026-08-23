(function () {

  /* Collect all lightbox-able elements in page order */
  function getItems() {
    return Array.from(document.querySelectorAll('.js-lightbox[data-lightbox]'));
  }

  /* ── Build overlay DOM (once) ─────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'jm-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.innerHTML = `
    <div class="lb-backdrop"></div>
    <button class="lb-close" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/>
      </svg>
    </button>
    <button class="lb-prev" aria-label="Previous image">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 16L7 10l6-6"/>
      </svg>
    </button>
    <button class="lb-next" aria-label="Next image">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 4l6 6-6 6"/>
      </svg>
    </button>
    <figure class="lb-figure">
      <div class="lb-img-wrap">
        <div class="lb-spinner"></div>
        <img class="lb-img" src="" alt="" draggable="false">
      </div>
      <figcaption class="lb-counter"></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const img     = overlay.querySelector('.lb-img');
  const spinner = overlay.querySelector('.lb-spinner');
  const counter = overlay.querySelector('.lb-counter');
  const btnPrev = overlay.querySelector('.lb-prev');
  const btnNext = overlay.querySelector('.lb-next');

  let items   = [];
  let current = 0;

  /* ── Show/hide ───────────────────────────────────── */
  function open(index) {
    items   = getItems();
    current = Math.max(0, Math.min(index, items.length - 1));
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    loadImage(current);
    overlay.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    img.src = '';
  }

  function loadImage(index) {
    const src = items[index].dataset.lightbox;
    spinner.style.opacity = '1';
    img.style.opacity = '0';
    img.src = '';
    /* Only fetch when the lightbox is open — no eager pre-load */
    const loader = new Image();
    loader.onload = () => {
      img.src = src;
      img.style.opacity = '1';
      spinner.style.opacity = '0';
    };
    loader.onerror = () => { spinner.style.opacity = '0'; };
    loader.src = src;
    counter.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    btnPrev.style.display = items.length > 1 ? '' : 'none';
    btnNext.style.display = items.length > 1 ? '' : 'none';
  }

  function prev() { current = (current - 1 + items.length) % items.length; loadImage(current); }
  function next() { current = (current + 1) % items.length; loadImage(current); }

  /* ── Event wiring ────────────────────────────────── */
  overlay.setAttribute('tabindex', '-1');

  /* Trigger on each lightboxable element */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.js-lightbox[data-lightbox]');
    if (!el) return;
    items = getItems();
    open(items.indexOf(el));
  });

  /* Keyboard: Enter / Space on focusable divs */
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList.contains('js-lightbox')) {
      e.preventDefault();
      items = getItems();
      open(items.indexOf(document.activeElement));
    }
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  overlay.querySelector('.lb-backdrop').addEventListener('click', close);
  overlay.querySelector('.lb-close').addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  /* Swipe on touch */
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

})();
