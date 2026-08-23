(function () {
  const INTERVAL       = 10500;
  const DRAG_THRESHOLD = 40;
  const SNAP_DELAY     = 20;

  /* JM_SLIDES injected by wp_localize_script() in WordPress */
  const SLIDES_DATA = window.JM_SLIDES || [
    { img: 'img/hero-placeholder.png' },
    { img: 'img/slide-festival.jpg'   },
    { img: 'img/slide-brand.jpg'      },
  ];

  const viewport    = document.querySelector('.carousel__viewport');
  const track       = document.getElementById('js-track');
  const ambientA    = document.getElementById('js-ambient');    /* may be null on project pages */
  const ambientB    = document.getElementById('js-ambient-b');  /* A/B crossfade layer */
  const pageAmbient = document.querySelector('.site__gradient');
  const noAutoplay  = !!viewport && !!viewport.closest('[data-no-autoplay]');
  let   ambientSlot = 'a'; /* which layer is currently the "active" one */

  /* ── Clone slides for infinite wrap ─────────── */
  const realSlides = Array.from(track.querySelectorAll('.carousel__slide:not(.is-clone)'));
  const N = realSlides.length;
  const headClone = realSlides[N - 1].cloneNode(true);
  const tailClone = realSlides[0].cloneNode(true);
  headClone.classList.add('is-clone');
  tailClone.classList.add('is-clone');
  track.insertBefore(headClone, realSlides[0]);
  track.appendChild(tailClone);
  const allSlides = Array.from(track.children);

  let domCurrent  = 1;
  let timer       = null;
  let rafId       = null;
  let dragStartX  = 0;
  let dragDelta   = 0;
  let isDragging  = false;
  let wasSwipe    = false;

  /* ── Geometry ────────────────────────────────── */
  function slideWidth() { return allSlides[0].offsetWidth; }
  function trackGap()   { return parseFloat(getComputedStyle(track).gap) || 12; }
  function centreOffset(idx) {
    const sw = slideWidth(), g = trackGap();
    /* Centre the active slide in the viewport — works at any screen width,
       giving consistent side-peeks regardless of the layout max-width. */
    const origin = (window.innerWidth - sw) / 2;
    return origin - idx * (sw + g);
  }

  /* ── 3-D transforms ──────────────────────────── */
  function applyTransforms(domIndex) {
    allSlides.forEach((slide, i) => {
      const delta = i - domIndex;
      const abs   = Math.abs(delta);
      let scale = 1, opacity = 1;
      if      (abs === 0) { scale = 1;     opacity = 1;    }
      else if (abs === 1) { scale = 0.975; opacity = 0.60; }
      else                { scale = 0.96;  opacity = 0.30; }
      slide.style.opacity   = opacity;
      slide.style.transform = `scale(${scale})`;
    });
  }

  /* ── Ambient crossfade — A/B layers so there's no dark gap between slides ── */
  function setAmbient(realIndex) {
    const img = SLIDES_DATA[realIndex].img;

    /* Page-level gradient: simple swap is fine at its slow opacity */
    if (pageAmbient && !noAutoplay) {
      pageAmbient.style.backgroundImage = `url(${img})`;
      pageAmbient.classList.add('is-visible');
    } else if (pageAmbient) {
      pageAmbient.classList.add('is-visible');
    }

    /* Local A/B ambient: paint the incoming layer, fade it in, then fade out the outgoing */
    if (ambientA && ambientB) {
      const incoming = ambientSlot === 'a' ? ambientB : ambientA;
      const outgoing = ambientSlot === 'a' ? ambientA : ambientB;
      incoming.style.backgroundImage = `url(${img})`;
      /* Let the browser paint the new background before fading in */
      requestAnimationFrame(() => {
        incoming.classList.add('is-visible');
        /* Fade out the old layer once the new one has started coming in */
        setTimeout(() => outgoing.classList.remove('is-visible'), 200);
      });
      ambientSlot = ambientSlot === 'a' ? 'b' : 'a';
    } else if (ambientA) {
      /* Fallback: single-layer (project pages have no ambient) */
      ambientA.style.backgroundImage = `url(${img})`;
      ambientA.classList.add('is-visible');
    }
  }

  /* ── Navigate ────────────────────────────────── */
  function moveTo(domIndex, animate = true) {
    if (!animate) track.classList.add('no-transition');
    domCurrent = domIndex;
    track.style.transform = `translateX(${centreOffset(domIndex)}px)`;
    applyTransforms(domIndex);
    realSlides.forEach((s, i) => s.classList.toggle('is-active', i + 1 === domIndex));
    const realIndex = ((domIndex - 1) % N + N) % N;
    setAmbient(realIndex);
    if (!animate) { track.offsetWidth; track.classList.remove('no-transition'); }
  }

  function goTo(domIndex) { moveTo(domIndex, true); resetTimer(); }
  function advance()      { goTo(domCurrent + 1); }

  /* ── Infinite wrap ───────────────────────────── */
  track.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'transform') return;
    /* Guard: don't snap while the user is mid-drag — the next onDragEnd will handle it */
    if (isDragging) return;
    if (domCurrent === 0)     setTimeout(() => { if (!isDragging) moveTo(N,   false); }, SNAP_DELAY);
    if (domCurrent === N + 1) setTimeout(() => { if (!isDragging) moveTo(1,   false); }, SNAP_DELAY);
  });

  /* ── Edge-sweep timer ───────────────────────────────────────────
     Two SVG paths start at the bottom-centre of the active frame
     and grow outward in opposite directions, meeting at the top.  */
  let sweepStart   = null;
  let sweepRafId   = null;
  let sweepHalfLen = 0;
  let sweepCW      = null;   // clockwise  (bottom-centre → right → top-centre)
  let sweepCCW     = null;   // counter-CW (bottom-centre → left  → top-centre)

  function getSweepEls() {
    const activeSlide = track.querySelector('.carousel__slide.is-active');
    if (!activeSlide) return false;
    sweepCW  = activeSlide.querySelector('.carousel__sweep-cw');
    sweepCCW = activeSlide.querySelector('.carousel__sweep-ccw');
    return !!(sweepCW && sweepCCW);
  }

  function setSweepGeometry() {
    if (!getSweepEls()) return;
    const activeSlide = track.querySelector('.carousel__slide.is-active');
    const frame = activeSlide.querySelector('.carousel__frame');
    const W = frame.offsetWidth;
    const H = frame.offsetHeight;
    const r = 23; // matches CSS --radius-card

    const cw  = `M ${W/2} 0 H ${W-r} Q ${W} 0 ${W} ${r} V ${H-r} Q ${W} ${H} ${W-r} ${H} H ${W/2}`;
    const ccw = `M ${W/2} 0 H ${r} Q 0 0 0 ${r} V ${H-r} Q 0 ${H} ${r} ${H} H ${W/2}`;

    sweepCW.setAttribute('d',  cw);
    sweepCCW.setAttribute('d', ccw);

    sweepHalfLen = sweepCW.getTotalLength();

    [sweepCW, sweepCCW].forEach(el => {
      el.style.strokeDasharray  = sweepHalfLen;
      el.style.strokeDashoffset = sweepHalfLen; // fully hidden at start
    });
  }

  function sweepFrame(ts) {
    if (!sweepStart) sweepStart = ts;
    const progress = Math.min((ts - sweepStart) / INTERVAL, 1);
    const offset   = sweepHalfLen * (1 - progress);
    if (sweepCW)  sweepCW.style.strokeDashoffset  = offset;
    if (sweepCCW) sweepCCW.style.strokeDashoffset = offset;
    if (progress < 1) sweepRafId = requestAnimationFrame(sweepFrame);
  }

  function startSweep() {
    cancelAnimationFrame(sweepRafId);
    sweepStart = null;
    setSweepGeometry();
    sweepRafId = requestAnimationFrame(sweepFrame);
  }

  function stopSweep() { cancelAnimationFrame(sweepRafId); }

  const startPie = startSweep;
  const stopPie  = stopSweep;

  /* ── Auto-advance + pie ──────────────────────── */
  function resetTimer() {
    clearInterval(timer);
    if (noAutoplay) return;
    timer = setInterval(advance, INTERVAL);
    startPie();
  }
  function stopTimer() { clearInterval(timer); stopPie(); }

  /* ── Drag ────────────────────────────────────── */
  function onDragStart(x) {
    isDragging = true;
    dragStartX = x;
    dragDelta  = 0;
    track.classList.add('no-transition');
    viewport.classList.add('is-dragging');
    stopTimer();
  }

  function onDragMove(x) {
    if (!isDragging) return;
    dragDelta = x - dragStartX;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      track.style.transform = `translateX(${centreOffset(domCurrent) + dragDelta}px)`;
    });
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    viewport.classList.remove('is-dragging');
    track.classList.remove('no-transition');
    wasSwipe = Math.abs(dragDelta) > 6;
    if      (dragDelta < -DRAG_THRESHOLD) goTo(domCurrent + 1);
    else if (dragDelta >  DRAG_THRESHOLD) goTo(domCurrent - 1);
    else moveTo(domCurrent, true);
    dragDelta = 0;
    resetTimer();
  }

  /* Prevent native browser drag (links/images) from hijacking the custom drag */
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  /* Touch events fire before their synthetic mouse equivalents.
     Flag when touch is active so mouse handlers don't double-fire on mobile. */
  let isTouchActive = false;

  /* Touch */
  viewport.addEventListener('touchstart', (e) => {
    isTouchActive = true;
    onDragStart(e.touches[0].clientX);
  }, { passive: true });
  viewport.addEventListener('touchmove',  (e) => onDragMove(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchend',   () => {
    onDragEnd();
    /* Clear the touch flag after the browser's ~300ms synthetic-mouse window */
    setTimeout(() => { isTouchActive = false; }, 350);
  });

  /* Mouse — only fires on genuine pointer (not synthetic post-touch events) */
  viewport.addEventListener('mousedown', (e) => {
    if (isTouchActive) return;
    e.preventDefault();
    onDragStart(e.clientX);
  });
  document.addEventListener('mousemove',  (e) => { if (!isTouchActive) onDragMove(e.clientX); });
  document.addEventListener('mouseup',    (e) => {
    if (isTouchActive) return;
    onDragEnd();
    /* If it was a tap (no significant drag), navigate any <a> under the pointer */
    if (!wasSwipe) {
      const link = e.target.closest('a[href]');
      if (link && !link.closest('[aria-hidden]')) window.location.href = link.href;
    }
  });

  /* Trackpad two-finger horizontal swipe.
     Uses a debounced cooldown: every incoming wheel event pushes the release
     timer forward, so momentum-scroll events can't retrigger after the
     physical gesture ends (fixed timeouts release too early on macOS). */
  let wheelAccum    = 0;
  let wheelCooldown = false;
  let wheelTimer    = null;

  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();

    /* Always extend the gate: resets after wheel events fully stop (900ms quiet). */
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelCooldown = false;
      wheelAccum    = 0;
    }, 900);

    if (wheelCooldown) return;

    wheelAccum += e.deltaX;
    if (Math.abs(wheelAccum) >= DRAG_THRESHOLD) {
      wheelCooldown = true;
      wheelAccum > 0 ? goTo(domCurrent + 1) : goTo(domCurrent - 1);
      wheelAccum = 0;
    }
  }, { passive: false });

  /* Hover pause */
  /* Hover does NOT pause the timer — timing is independent of hover state */

  /* Resize */
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => moveTo(domCurrent, false));
  });

  /* ── Init ────────────────────────────────────── */
  requestAnimationFrame(() => {
    moveTo(1, false);
    const img = SLIDES_DATA[0].img;
    /* Seed layer A with the first slide immediately */
    if (ambientA) { ambientA.style.backgroundImage = `url(${img})`; ambientA.classList.add('is-visible'); }
    if (pageAmbient) {
      if (!noAutoplay) pageAmbient.style.backgroundImage = `url(${img})`;
      pageAmbient.classList.add('is-visible');
    }
    resetTimer();
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  });
})();
