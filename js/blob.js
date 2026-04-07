/* blob.js
   Blob is permanently position:fixed at body root (z-200).
   This guarantees it always paints above the backdrop (z-148) and the
   sticky header (z-40), regardless of stacking contexts.

   Sync strategy: the blob-anchor does a translateY(-22px) intro animation
   that starts at 0.8s and lasts 0.55s (ends ~1.35s after is-loaded).
   We wait until that animation completes before reading the anchor's rect,
   so the blob appears at the anchor's true final position.
   After that we keep it synced on scroll (rAF-throttled) and resize. */

(function () {
  'use strict';

  var vertexShader = `
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform float u_click_strength;
    uniform float u_mouse_velocity;
    varying vec3  v_position;

    vec3 mod289(vec3 x) { return x - floor(x*(1./289.))*289.; }
    vec4 mod289(vec4 x) { return x - floor(x*(1./289.))*289.; }
    vec4 permute(vec4 x)      { return mod289(((x*34.)+1.)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1./6.,1./3.);
      const vec4 D = vec4(0.,.5,1.,2.);
      vec3 i  = floor(v+dot(v,C.yyy));
      vec3 x0 = v-i+dot(i,C.xxx);
      vec3 g  = step(x0.yzx,x0.xyz);
      vec3 l  = 1.-g;
      vec3 i1 = min(g.xyz,l.zxy);
      vec3 i2 = max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(
        i.z+vec4(0.,i1.z,i2.z,1.))
       +i.y+vec4(0.,i1.y,i2.y,1.))
       +i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.;
      vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
      m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main() {
      float time=u_time*0.2;
      vec3  np=vec3(position.x*.7,position.y*.7+time,position.z*.7);
      float disp=.15*snoise(np);
      float md=distance(position,vec3(u_mouse,.5));
      float vf=smoothstep(0.,.01,u_mouse_velocity);
      float hs=smoothstep(.6,0.,md)*.2*vf;
      float ps=smoothstep(.8,0.,md)*-.5*u_click_strength;
      vec3 newp=position+normal*(disp+hs+ps);
      v_position=newp;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(newp,1.);
    }
  `;

  var fragmentShader = `
    uniform vec3  u_color1;
    uniform vec3  u_color2;
    uniform vec3  u_color3;
    uniform vec2  u_mouse;
    uniform float u_click_strength;
    uniform float u_mouse_velocity;
    varying vec3  v_position;

    void main() {
      float t=(v_position.x*.5)+.5;
      vec3 c=u_color1;
      c=mix(c,u_color2,smoothstep(0.,.6,t));
      c=mix(c,u_color3,smoothstep(.4,1.,t));
      float ld=distance(v_position,vec3(u_mouse,.5));
      float vf=smoothstep(0.,.01,u_mouse_velocity);
      float hl=smoothstep(.6,0.,ld)*.25*vf;
      float cl=smoothstep(.6,0.,ld)*u_click_strength*.5;
      gl_FragColor=vec4(c+vec3(hl+cl),1.);
    }
  `;

  requestAnimationFrame(function () {
    var THREE = window.THREE;
    if (!THREE) { console.error('blob.js: window.THREE not found'); return; }

    var anchor    = document.getElementById('blob-anchor');
    var container = document.getElementById('blob-container');
    var mount     = document.getElementById('blob-canvas-wrapper');
    var overlay   = document.getElementById('blob-logo');
    var closeBtn  = document.getElementById('close-blob');
    var backdrop  = document.getElementById('blob-backdrop');

    if (!container || !mount) { console.warn('blob.js: missing DOM'); return; }

    /* ── Three.js scene ─────────────────────────────────────── */
    var scene    = new THREE.Scene();
    var camera   = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(46, 46);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    mount.appendChild(renderer.domElement);

    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        u_time:           { value: 0 },
        u_mouse:          { value: new THREE.Vector2() },
        u_mouse_velocity: { value: 0 },
        u_click_strength: { value: 0 },
        u_color1: { value: new THREE.Color(1.00, 1.00, 1.00) },
        u_color2: { value: new THREE.Color(1.00, 1.00, 1.00) },
        u_color3: { value: new THREE.Color(1.00, 1.00, 1.00) },
      },
    });

    var mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), material);
    mesh.scale.set(1.5, 1.5, 1.5);
    scene.add(mesh);

    var colS = [new THREE.Color(1.00,1.00,1.00), new THREE.Color(1.00,1.00,1.00), new THREE.Color(1.00,1.00,1.00)];
    var colE = [new THREE.Color(0x3BE9EB), new THREE.Color(0x1848A1), new THREE.Color(0x981EC0)];

    /* ── State ───────────────────────────────────────────────── */
    var clock      = new THREE.Clock();
    var mouse      = new THREE.Vector2();
    var smoothM    = new THREE.Vector2();
    var lastM      = new THREE.Vector2();
    var mouseVel   = 0;
    var isDown     = false;
    var clickStr   = 0;
    var isExpanded = false;
    var lastTs     = 0;
    var FPS_MS     = 1000 / 30;
    var scrollRaf  = null;

    /* ── syncToAnchor ───────────────────────────────────────────
       Reads the anchor's CURRENT viewport rect and positions the
       fixed blob over it. Safe to call any time when not expanded. */
    function syncToAnchor() {
      if (isExpanded || !anchor) return;
      var r = anchor.getBoundingClientRect();
      if (!r.width) return;
      container.style.top    = r.top    + 'px';
      container.style.left   = r.left   + 'px';
      container.style.width  = r.width  + 'px';
      container.style.height = r.height + 'px';
      if (Math.round(r.width) !== renderer.domElement.width) {
        renderer.setSize(r.width, r.height);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
    }

    /* Reveal blob 800ms after is-loaded — matches cta-pill fade-in timing.
       Anchor has no transform animation so getBoundingClientRect() is accurate
       as soon as the page has painted (header is in final sticky position).   */
    function revealBlob() {
      syncToAnchor();
      container.classList.add('is-ready');

      /* Keep synced on scroll (before sticky kicks in on initial page load) */
      window.addEventListener('scroll', function () {
        if (isExpanded || scrollRaf) return;
        scrollRaf = requestAnimationFrame(function () {
          scrollRaf = null;
          syncToAnchor();
        });
      }, { passive: true });
    }

    /* Show nav tabs on first scroll */
    var navShown = false;
    window.addEventListener('scroll', function onFirstScroll() {
      if (navShown) return;
      navShown = true;
      document.body.classList.add('nav-visible');
      window.removeEventListener('scroll', onFirstScroll);
    }, { passive: true });

    /* Wait for carousel.js to mark is-loaded, then reveal blob at 800ms */
    function waitForLoaded(cb) {
      if (document.body.classList.contains('is-loaded')) { cb(); return; }
      var mo = new MutationObserver(function () {
        if (document.body.classList.contains('is-loaded')) { mo.disconnect(); cb(); }
      });
      mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    waitForLoaded(function () { setTimeout(revealBlob, 800); });

    /* Resize — debounced */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(syncToAnchor, 150);
    });

    /* ── Mouse ───────────────────────────────────────────────── */
    window.addEventListener('mousemove', function (e) {
      var r = mount.getBoundingClientRect();
      mouse.set(
         ((e.clientX - r.left) / r.width)  *  2 - 1,
        -((e.clientY - r.top)  / r.height) *  2 + 1
      );
    });
    window.addEventListener('mousedown', function () { isDown = true;  });
    window.addEventListener('mouseup',   function () { isDown = false; });

    /* ── Render loop ─────────────────────────────────────────── */
    function animate(ts) {
      requestAnimationFrame(animate);
      if (document.hidden) return;
      if (!isExpanded && ts - lastTs < FPS_MS) return;
      lastTs = ts;

      smoothM.lerp(mouse, 0.075);
      mouseVel = THREE.MathUtils.lerp(mouseVel, lastM.distanceTo(smoothM), 0.1);
      lastM.copy(smoothM);

      material.uniforms.u_mouse.value.copy(smoothM);
      material.uniforms.u_mouse_velocity.value = mouseVel;
      clickStr += ((isDown ? 1 : 0) - clickStr) * 0.1;
      material.uniforms.u_click_strength.value = clickStr;
      material.uniforms.u_time.value = clock.getElapsedTime();

      var tgt = isExpanded ? colE : colS;
      material.uniforms.u_color1.value.lerp(tgt[0], 0.04);
      material.uniforms.u_color2.value.lerp(tgt[1], 0.04);
      material.uniforms.u_color3.value.lerp(tgt[2], 0.04);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    /* ── Expand ─────────────────────────────────────────────────
       Blob is already fixed+z-200. Capture current rect, scale it
       up to full screen with transform. transform-origin = center. */
    function expand() {
      if (isExpanded) return;
      isExpanded = true;

      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var r  = container.getBoundingClientRect();
      var cx = r.left + r.width  / 2;
      var cy = r.top  + r.height / 2;
      var s0 = r.width / vw;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(vw, vh);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();

      container.style.transition    = 'none';
      container.style.top           = '0';
      container.style.left          = '0';
      container.style.width         = vw + 'px';
      container.style.height        = vh + 'px';
      container.style.borderRadius  = vw + 'px';
      container.style.transformOrigin = cx + 'px ' + cy + 'px';
      container.style.transform     = 'scale(' + s0 + ')';
      container.offsetWidth;

      container.style.transition = '';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          container.style.transform    = 'scale(1)';
          container.style.borderRadius = '0';
          container.classList.add('is-expanded');
          if (backdrop) backdrop.classList.add('is-visible');
          if (overlay)  overlay.style.opacity = '0';
        });
      });
    }

    /* ── Collapse ────────────────────────────────────────────── */
    function collapse() {
      if (!isExpanded) return;
      isExpanded = false;

      container.classList.remove('is-expanded');
      if (backdrop) backdrop.classList.remove('is-visible');

      var vw    = window.innerWidth;
      var aRect = anchor ? anchor.getBoundingClientRect()
                         : { left: 16, top: 16, width: 46, height: 46 };
      var cx2 = aRect.left + aRect.width  / 2;
      var cy2 = aRect.top  + aRect.height / 2;

      container.style.transformOrigin = cx2 + 'px ' + cy2 + 'px';
      container.style.transform       = 'scale(' + (aRect.width / vw) + ')';
      container.style.borderRadius    = vw + 'px';

      function onDone(e) {
        if (e.propertyName !== 'transform') return;
        container.removeEventListener('transitionend', onDone);
        /* Restore to small fixed state */
        container.style.cssText = '';
        syncToAnchor();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        var w = anchor ? anchor.offsetWidth  : 46;
        var h = anchor ? anchor.offsetHeight : 46;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (overlay) overlay.style.opacity = '';
      }
      container.addEventListener('transitionend', onDone);
    }

    /* ── Events ─────────────────────────────────────────────── */
    container.addEventListener('click', function () { if (!isExpanded) expand(); });
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); collapse(); });
    if (backdrop) backdrop.addEventListener('click', collapse);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isExpanded) collapse(); });
  });

}());
