/* blob.js — ported from /blobb/main.ts
   Structure mirrors blobb/index.html exactly.
   Uses window.THREE from the local blocking three.min.js. */

(function () {
  'use strict';

  /* ── Shaders — verbatim from blobb/main.ts ────────────────── */
  var vertexShader = `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_click_strength;
    uniform float u_mouse_velocity;
    varying vec3 v_position;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      float animation_speed = 0.2;
      float time = u_time * animation_speed;
      float k = 0.7;
      vec3 noise_in_pos = vec3(position.x * k, position.y * k + time, position.z * k);
      float noise_displacement = 0.15 * snoise(noise_in_pos);
      vec3 mouse_proj = vec3(u_mouse.x, u_mouse.y, 0.5);
      float mouse_dist = distance(position, mouse_proj);
      float velocity_factor = smoothstep(0.0, 0.01, u_mouse_velocity);
      float hover_strength = smoothstep(0.6, 0.0, mouse_dist) * 0.2 * velocity_factor;
      float push_strength = smoothstep(0.8, 0.0, mouse_dist) * -0.5 * u_click_strength;
      float total_displacement = noise_displacement + hover_strength + push_strength;
      vec3 new_position = position + normal * total_displacement;
      v_position = new_position;
      vec4 mvPosition = modelViewMatrix * vec4(new_position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  var fragmentShader = `
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec2 u_mouse;
    uniform float u_click_strength;
    uniform float u_mouse_velocity;
    varying vec3 v_position;

    void main() {
      float intensity = (v_position.x * 0.5) + 0.5;
      vec3 color = u_color1;
      color = mix(color, u_color2, smoothstep(0.0, 0.6, intensity));
      color = mix(color, u_color3, smoothstep(0.4, 1.0, intensity));
      vec3 mouse_proj = vec3(u_mouse.x, u_mouse.y, 0.5);
      float light_dist = distance(v_position, mouse_proj);
      float velocity_factor = smoothstep(0.0, 0.01, u_mouse_velocity);
      float hover_light = smoothstep(0.6, 0.0, light_dist) * 0.25 * velocity_factor;
      float click_light = smoothstep(0.6, 0.0, light_dist) * u_click_strength * 0.5;
      float total_light = hover_light + click_light;
      vec3 final_color = color + vec3(total_light);
      gl_FragColor = vec4(final_color, 1.0);
    }
  `;

  /* ── Kick off after first paint so offsetWidth/Height are real ── */
  requestAnimationFrame(function () {
    var THREE = window.THREE;
    if (!THREE) {
      console.error('blob.js: window.THREE not found. Is js/three.min.js loading?');
      return;
    }

    /* IDs match blobb/index.html exactly */
    var blobContainer = document.getElementById('blob-container');
    var mount         = document.getElementById('blob-canvas-wrapper');
    var blobLogo      = document.getElementById('blob-logo');   /* JM overlay */
    var closeBtn      = document.getElementById('close-blob');  /* matches blobb */
    var backdrop      = document.getElementById('blob-backdrop');

    if (!blobContainer || !mount) {
      console.warn('blob.js: required DOM elements not found');
      return;
    }

    /* ── Three.js setup — identical to blobb/main.ts ──────────── */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, mount.offsetWidth / mount.offsetHeight, 0.1, 1000);
    camera.position.z = 3;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.offsetWidth, mount.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    var geometry = new THREE.SphereGeometry(1, 128, 128);
    var material = new THREE.ShaderMaterial({
      vertexShader:   vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        u_time:           { value: 0 },
        u_mouse:          { value: new THREE.Vector2(0, 0) },
        u_mouse_velocity: { value: 0.0 },
        u_click_strength: { value: 0 },
        u_color1:         { value: new THREE.Color(0x3BE9EB) },
        u_color2:         { value: new THREE.Color(0x1848A1) },
        u_color3:         { value: new THREE.Color(0x981EC0) },
      },
    });

    var blob = new THREE.Mesh(geometry, material);
    blob.scale.set(1.5, 1.5, 1.5);
    scene.add(blob);

    /* ── State ────────────────────────────────────────────────── */
    var clock             = new THREE.Clock();
    var mouse             = new THREE.Vector2(0, 0);
    var smoothedMouse     = new THREE.Vector2(0, 0);
    var lastSmoothedMouse = new THREE.Vector2(0, 0);
    var mouseVelocity     = 0;
    var isMouseDown       = false;
    var clickStrength     = 0;
    var isExpanded        = false;

    /* Performance: cap logo at 30 fps, full 60 fps when expanded */
    var lastFrameTs    = 0;
    var LOGO_FRAME_MS  = 1000 / 30;

    /* ── Mouse — identical to blobb/main.ts ───────────────────── */
    window.addEventListener('mousemove', function (e) {
      var rect = mount.getBoundingClientRect();
      mouse.set(
         ((e.clientX - rect.left) / mount.clientWidth)  * 2 - 1,
        -((e.clientY - rect.top)  / mount.clientHeight) * 2 + 1
      );
    });
    window.addEventListener('mousedown', function () { isMouseDown = true;  });
    window.addEventListener('mouseup',   function () { isMouseDown = false; });

    /* ── Render loop ──────────────────────────────────────────── */
    function animate(ts) {
      requestAnimationFrame(animate);

      /* Skip entirely when tab is hidden */
      if (document.hidden) return;

      /* Throttle to 30 fps while blob is just a logo */
      if (!isExpanded && (ts - lastFrameTs) < LOGO_FRAME_MS) return;
      lastFrameTs = ts;

      var elapsedTime = clock.getElapsedTime();

      smoothedMouse.lerp(mouse, 0.075);
      var dist = lastSmoothedMouse.distanceTo(smoothedMouse);
      mouseVelocity = THREE.MathUtils.lerp(mouseVelocity, dist, 0.1);
      lastSmoothedMouse.copy(smoothedMouse);

      material.uniforms.u_mouse_velocity.value = mouseVelocity;
      material.uniforms.u_mouse.value.copy(smoothedMouse);
      var targetStrength = isMouseDown ? 1.0 : 0.0;
      clickStrength += (targetStrength - clickStrength) * 0.1;
      material.uniforms.u_click_strength.value = clickStrength;
      material.uniforms.u_time.value = elapsedTime;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    /* ── Resize — only after transition ends to avoid GPU thrash ─ */
    blobContainer.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'width') return;
      var w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isExpanded ? 2 : 1.5));
      renderer.setSize(w, h);
    });

    /* Real window resize (not expansion) */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (isExpanded) return; /* transitionend handles expansion */
        var w = mount.clientWidth, h = mount.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 150);
    });

    /* ── Expand / collapse — adapted for site CSS classes ─────── */
    function expand() {
      isExpanded = true;
      blobContainer.classList.add('is-expanded');
      if (backdrop)  backdrop.classList.add('is-visible');
      if (blobLogo)  blobLogo.style.opacity = '0';
    }

    function collapse() {
      isExpanded = false;
      blobContainer.classList.remove('is-expanded');
      if (backdrop)  backdrop.classList.remove('is-visible');
      if (blobLogo)  blobLogo.style.opacity = '';
    }

    blobContainer.addEventListener('click', function () {
      if (!isExpanded) expand();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        collapse();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', collapse);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isExpanded) collapse();
    });
  });

}());
