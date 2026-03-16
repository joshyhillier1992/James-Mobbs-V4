import * as THREE from 'three';
import './index.css';

// --- Shaders ---
const vertexShader = `
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
    const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
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

const fragmentShader = `
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

// --- Data ---
const projects = [
  { id: 1, title: 'Abstract AI', category: 'Machine Learning', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop' },
  { id: 2, title: 'Cyber Dynamics', category: 'WebGL Experiment', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' },
  { id: 3, title: 'Neon Flux', category: 'App Design', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop' },
  { id: 4, title: 'Data Scape', category: 'Visualization', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 5, title: 'Quantum Mesh', category: 'Research', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop' },
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initBlob();
    initSpotlightButtons();
    initProjects();
    initTabs();
});

function initBlob() {
    const mount = document.getElementById('blob-canvas-wrapper');
    const blobContainer = document.getElementById('blob-container');
    const closeBtn = document.getElementById('close-blob');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    
    if (!mount || !blobContainer || !closeBtn || !mainContent || !mainNav) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 128, 128);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            u_time: { value: 0 },
            u_mouse: { value: new THREE.Vector2(0, 0) },
            u_mouse_velocity: { value: 0.0 },
            u_click_strength: { value: 0 },
            u_color1: { value: new THREE.Color(0x3BE9EB) },
            u_color2: { value: new THREE.Color(0x1848A1) },
            u_color3: { value: new THREE.Color(0x981EC0) },
        },
    });

    const blob = new THREE.Mesh(geometry, material);
    blob.scale.set(1.5, 1.5, 1.5);
    scene.add(blob);

    const clock = new THREE.Clock();
    const mouse = new THREE.Vector2(0, 0);
    const smoothedMouse = new THREE.Vector2(0, 0);
    const lastSmoothedMouse = new THREE.Vector2(0, 0);
    let mouseVelocity = 0;
    let isMouseDown = false;
    let clickStrength = 0;
    let isExpanded = false;

    const handleMouseMove = (event: MouseEvent) => {
        const rect = mount.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / mount.clientWidth) * 2 - 1;
        const y = -((event.clientY - rect.top) / mount.clientHeight) * 2 + 1;
        mouse.set(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        smoothedMouse.lerp(mouse, 0.075);
        const dist = lastSmoothedMouse.distanceTo(smoothedMouse);
        mouseVelocity = THREE.MathUtils.lerp(mouseVelocity, dist, 0.1);
        lastSmoothedMouse.copy(smoothedMouse);
        
        material.uniforms.u_mouse_velocity.value = mouseVelocity;
        material.uniforms.u_mouse.value.copy(smoothedMouse);
        const targetStrength = isMouseDown ? 1.0 : 0.0;
        clickStrength += (targetStrength - clickStrength) * 0.1;
        material.uniforms.u_click_strength.value = clickStrength;
        material.uniforms.u_time.value = elapsedTime;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    new ResizeObserver(handleResize).observe(mount);

    // Expansion Logic
    blobContainer.addEventListener('click', () => {
        if (!isExpanded) {
            isExpanded = true;
            blobContainer.classList.remove('top-6', 'left-6', 'w-24', 'h-24', 'rounded-full', 'hover:scale-105', 'cursor-pointer');
            blobContainer.classList.add('top-0', 'left-0', 'w-full', 'h-full', 'rounded-none');
            closeBtn.classList.remove('hidden');
            mainContent.classList.add('opacity-0', 'pointer-events-none');
            mainNav.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = false;
        blobContainer.classList.add('top-6', 'left-6', 'w-24', 'h-24', 'rounded-full', 'hover:scale-105', 'cursor-pointer');
        blobContainer.classList.remove('top-0', 'left-0', 'w-full', 'h-full', 'rounded-none');
        closeBtn.classList.add('hidden');
        mainContent.classList.remove('opacity-0', 'pointer-events-none');
        mainNav.classList.remove('opacity-0', 'pointer-events-none');
    });
}

function initSpotlightButtons() {
    const buttons = document.querySelectorAll('.spotlight-button');
    buttons.forEach(btn => {
        const effect = btn.querySelector('.spotlight-effect') as HTMLElement;
        btn.addEventListener('mousemove', (e: any) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            effect.style.background = `radial-gradient(150px circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 100%)`;
        });
    });
}

function initProjects() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    
    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'group relative w-60 md:w-80 aspect-video rounded-lg overflow-hidden bg-[#2f2f2f] cursor-pointer hover:z-20 hover:scale-105 transition-all duration-300 origin-center shadow-lg border border-white/5';
        item.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h4 class="font-bold text-white text-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">${project.title}</h4>
                <div class="flex items-center gap-2 mt-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    <span class="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">${project.category}</span>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('bg-gray-100', 'text-black', 'shadow-sm');
                t.classList.add('text-gray-300', 'hover:text-white');
            });
            tab.classList.add('bg-gray-100', 'text-black', 'shadow-sm');
            tab.classList.remove('text-gray-300', 'hover:text-white');
        });
    });
}
