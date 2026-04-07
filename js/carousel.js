(function () {
  const INTERVAL       = 10500;
  const DRAG_THRESHOLD = 40;
  const SNAP_DELAY     = 20;

  const SLIDES_DATA = [
    { img: 'img/hero-placeholder.png' },
    { img: 'img/slide-festival.jpg'   },
    { img: 'img/slide-brand.jpg'      },
  ];

  const viewport    = document.querySelector('.carousel__viewport');
  const track       = document.getElementById('js-track');
  const ambient     = document.getElementById('js-ambient');
  const pageAmbient = document.querySelector('.site__gradient');

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

  /* ── Geometry ────────────────────────────────── */
  function slideWidth() { return allSlides[0].offsetWidth; }
  function trackGap()   { return parseFloat(getComputedStyle(track).gap) || 12; }
  function centreOffset(idx) {
    const sw = slideWidth(), g = trackGap(), vw = viewport.offsetWidth;
    return (vw - sw) / 2 - idx * (sw + g);
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

  /* ── Ambient crossfade ───────────────────────── */
  function setAmbient(realIndex) {
    const img = SLIDES_DATA[realIndex].img;
    ambient.classList.remove('is-visible');
    pageAmbient.classList.remove('is-visible');
    setTimeout(() => {
      ambient.style.backgroundImage     = `url(${img})`;
      pageAmbient.style.backgroundImage = `url(${img})`;
      ambient.classList.add('is-visible');
      pageAmbient.classList.add('is-visible');
    }, 220);
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
    if (domCurrent === 0)     setTimeout(() => moveTo(N,   false), SNAP_DELAY);
    if (domCurrent === N + 1) setTimeout(() => moveTo(1,   false), SNAP_DELAY);
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
    const activeFrame = track.querySelector('.carousel__slide.is-active .carousel__frame');
    if (!activeFrame) return false;
    sweepCW  = activeFrame.querySelector('.carousel__sweep-cw');
    sweepCCW = activeFrame.querySelector('.carousel__sweep-ccw');
    return !!(sweepCW && sweepCCW);
  }

  function setSweepGeometry() {
    if (!getSweepEls()) return;
    const frame = sweepCW.closest('.carousel__frame');
    const W = frame.offsetWidth;
    const H = frame.offsetHeight;
    const r = 23; // matches CSS --radius-card

    const cw  = `M ${W/2} ${H} H ${W-r} Q ${W} ${H} ${W} ${H-r} V ${r} Q ${W} 0 ${W-r} 0 H ${W/2}`;
    const ccw = `M ${W/2} ${H} H ${r} Q 0 ${H} 0 ${H-r} V ${r} Q 0 0 ${r} 0 H ${W/2}`;

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
    if      (dragDelta < -DRAG_THRESHOLD) goTo(domCurrent + 1);
    else if (dragDelta >  DRAG_THRESHOLD) goTo(domCurrent - 1);
    else moveTo(domCurrent, true);
    dragDelta = 0;
    resetTimer();
  }

  /* Mouse */
  viewport.addEventListener('mousedown',  (e) => { e.preventDefault(); onDragStart(e.clientX); });
  document.addEventListener('mousemove',  (e) => onDragMove(e.clientX));
  document.addEventListener('mouseup',    ()  => onDragEnd());

  /* Touch */
  viewport.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove',  (e) => onDragMove(e.touches[0].clientX),  { passive: true });
  viewport.addEventListener('touchend',   ()  => onDragEnd());

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
    ambient.style.backgroundImage     = `url(${img})`;
    pageAmbient.style.backgroundImage = `url(${img})`;
    ambient.classList.add('is-visible');
    pageAmbient.classList.add('is-visible');
    resetTimer();
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  });
})();
