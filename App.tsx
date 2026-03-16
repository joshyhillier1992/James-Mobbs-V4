
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// --- Icons ---

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// --- Spotlight Button Component ---
const SpotlightButton = ({ text, icon: Icon, onClick }: { text: string, icon?: any, onClick?: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-full bg-white/10 border border-white/10 px-8 py-3.5 transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(150px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.3), transparent 100%)`,
        }}
      />
      <div className="relative flex items-center gap-3 text-white font-bold tracking-wide text-sm md:text-base">
        {Icon && <Icon />}
        <span>{text}</span>
      </div>
    </button>
  );
};

// --- Shaders ---

const vertexShader = `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_click_strength;
  uniform float u_mouse_velocity;
  
  varying vec3 v_position;

  // Simplex 3D Noise
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

    // Mouse interactions
    vec3 mouse_proj = vec3(u_mouse.x, u_mouse.y, 0.5);
    float mouse_dist = distance(position, mouse_proj);
    
    // Create a factor based on mouse velocity for the elastic effect
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
    // Base color gradient
    float intensity = (v_position.x * 0.5) + 0.5;
    vec3 color = u_color1;
    color = mix(color, u_color2, smoothstep(0.0, 0.6, intensity));
    color = mix(color, u_color3, smoothstep(0.4, 1.0, intensity));
    
    // Mouse lighting effect
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

// --- Blob3D Component ---
const Blob3D: React.FC<{ isInteractive: boolean }> = ({ isInteractive }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mouse = useRef(new THREE.Vector2(0, 0));
    const smoothedMouse = useRef(new THREE.Vector2(0, 0));
    const lastSmoothedMouse = useRef(new THREE.Vector2(0, 0));
    const mouseVelocity = useRef(0);
    const isMouseDown = useRef(false);
    const clickStrength = useRef(0);
    
    const isInteractiveRef = useRef(true);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

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
                u_color1: { value: new THREE.Color(0x3BE9EB) }, // Cyan
                u_color2: { value: new THREE.Color(0x1848A1) }, // Blue
                u_color3: { value: new THREE.Color(0x981EC0) }, // Purple
            },
        });

        const blob = new THREE.Mesh(geometry, material);
        blob.scale.set(1.5, 1.5, 1.5);
        blob.position.set(0, 0, 0);
        scene.add(blob);

        const clock = new THREE.Clock();
        let animationFrameId: number;
        
        const handleMouseMove = (event: MouseEvent) => {
            if (mount && isInteractiveRef.current) {
                 const rect = mount.getBoundingClientRect();
                 const x = ((event.clientX - rect.left) / mount.clientWidth) * 2 - 1;
                 const y = -((event.clientY - rect.top) / mount.clientHeight) * 2 + 1;
                 mouse.current.set(x, y);
            }
        };
        
        const handleMouseDown = () => { if (isInteractiveRef.current) isMouseDown.current = true; };
        const handleMouseUp = () => { isMouseDown.current = false; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            
            const targetMouse = mouse.current;
            smoothedMouse.current.lerp(targetMouse, 0.075);
            
            const dist = lastSmoothedMouse.current.distanceTo(smoothedMouse.current);
            mouseVelocity.current = THREE.MathUtils.lerp(mouseVelocity.current, dist, 0.1);
            lastSmoothedMouse.current.copy(smoothedMouse.current);
            material.uniforms.u_mouse_velocity.value = mouseVelocity.current;

            material.uniforms.u_mouse.value.copy(smoothedMouse.current);

            const targetStrength = isMouseDown.current ? 1.0 : 0.0;
            clickStrength.current += (targetStrength - clickStrength.current) * 0.1;
            material.uniforms.u_click_strength.value = clickStrength.current;

            material.uniforms.u_time.value = elapsedTime;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!mount || mount.clientWidth === 0) return;
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(mount);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (mount && renderer.domElement) {
                mount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
};


// --- UI Components ---

const projects = [
  { id: 1, title: 'Abstract AI', category: 'Machine Learning', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop' },
  { id: 2, title: 'Cyber Dynamics', category: 'WebGL Experiment', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop' },
  { id: 3, title: 'Neon Flux', category: 'App Design', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop' },
  { id: 4, title: 'Data Scape', category: 'Visualization', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  { id: 5, title: 'Quantum Mesh', category: 'Research', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop' },
];

function App() {
  const [isBlobExpanded, setIsBlobExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const toggleBlob = () => {
    setIsBlobExpanded(!isBlobExpanded);
  };

  const navLinks = ['Home', 'Projects', 'About', 'Playground'];

  return (
    <div className="bg-[#141414] min-h-screen w-full text-white font-sans selection:bg-[#E50914] selection:text-white overflow-x-hidden">
      
      {/* Blob - Fixed Position for Seamless Transition */}
      <div 
          className={`fixed z-50 transition-all duration-[700ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${
            isBlobExpanded 
              ? 'top-0 left-0 w-full h-full rounded-none' 
              : 'top-6 left-6 w-24 h-24 rounded-full hover:scale-105 cursor-pointer'
          }`}
          onClick={!isBlobExpanded ? toggleBlob : undefined}
          style={{ transformOrigin: 'center center' }} // Ensures growth from center if scaling, but here we animate properties
      >
           <div className="w-full h-full relative">
               <Blob3D isInteractive={true} />
               
               {/* Logo Text Overlay - Smaller, solid, clean */}
               <div 
                 className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-200 ${
                   isBlobExpanded ? 'opacity-0 delay-0' : 'opacity-100 delay-100'
                 }`}
               >
                 <span className="text-white text-xl font-bold font-sans tracking-tight leading-none"></span>
               </div>
               
               {/* Close button for expanded state */}
               {isBlobExpanded && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); toggleBlob(); }}
                   className="absolute top-8 right-8 text-white/70 hover:text-white z-50 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10"
                 >
                   <span className="text-sm font-bold uppercase tracking-widest">Close</span>
                 </button>
               )}
           </div>
      </div>

      {/* Navigation */}
      <nav 
        className="fixed top-0 w-full z-40 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-none"
      >
        {/* Placeholder for Blob to maintain alignment */}
        <div className="w-24 h-24 opacity-0 pointer-events-none"></div>

        {/* Center: Pill Tabs */}
        <div className={`pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2 z-40 transition-all duration-500 delay-100 ${isBlobExpanded ? 'opacity-0 translate-y-[-20px]' : 'opacity-100 translate-y-0'}`}>
           <div className="bg-[#2a2a2a]/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center shadow-lg">
              {navLinks.map((link) => (
                <button 
                  key={link}
                  onClick={() => setActiveTab(link)}
                  className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    activeTab === link 
                      ? 'bg-gray-100 text-black shadow-sm' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link}
                </button>
              ))}
           </div>
        </div>

        {/* Right: Search Only */}
        <div className={`pointer-events-auto flex items-center justify-end w-12 z-40 transition-opacity duration-300 ${isBlobExpanded ? 'opacity-0' : 'opacity-100'}`}>
           <button className="text-gray-200 hover:text-white transition-colors p-2">
             <SearchIcon />
           </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`relative z-0 transition-opacity duration-500 delay-75 ${isBlobExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Featured Contained Hero Card */}
        <div className="pt-24 md:pt-32 px-4 md:px-12 flex justify-center pb-8">
            
            {/* Card Container */}
            <div className="relative w-full aspect-[4/5] md:aspect-[2.35/1] rounded-3xl overflow-visible group">
                
                {/* Ambient Light Emitter */}
                <div className="absolute -inset-10 bg-gradient-to-r from-[#4f46e5] via-[#a855f7] to-[#ec4899] opacity-60 blur-[100px] -z-10 mix-blend-screen animate-pulse duration-[4000ms]"></div>
                
                {/* Glass Border Container */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-white/5 opacity-100 pointer-events-none z-20"></div>

                {/* Main Card Content Clip */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#1a1a1a] shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10">
                    
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                        <img 
                          src="https://jamesmobbs.com/wp-content/uploads/2024/12/The-Circle-Hero-1920x630.webp" 
                          alt="Hero" 
                          className="w-full h-full object-cover transition-transform duration-[10s] ease-in-out group-hover:scale-105"
                        />
                        {/* Vignette & Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/30 to-transparent opacity-90"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60"></div>
                        
                        {/* Inner Glass Shine */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-30 h-full flex flex-col justify-end p-8 md:p-16 space-y-6 md:w-2/3">
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight drop-shadow-2xl">
                          THE CIRCLE
                        </h1>

                        <p className="text-sm md:text-base text-gray-200 max-w-lg line-clamp-3 font-medium leading-relaxed drop-shadow-md text-shadow">
                          A comprehensive design exploration for the hit social media competition. 
                          Creating an immersive graphical language that defines the bridge between digital persona and reality.
                        </p>

                        <div className="flex items-center gap-3 pt-4">
                           <SpotlightButton 
                             text="View Case Study" 
                             icon={PlayIcon} 
                             onClick={() => {}}
                           />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Rows */}
        <div className="px-4 md:px-12 py-8 space-y-12 pb-24">
            
            {/* Section: Latest Projects */}
            <section>
              <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-4 pl-1 border-l-4 border-[#E50914] leading-none">Latest Projects</h3>
              <div className="relative w-full overflow-x-auto pb-8 hide-scrollbar">
                 <div className="flex gap-4 min-w-max">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="group relative w-60 md:w-80 aspect-video rounded-lg overflow-hidden bg-[#2f2f2f] cursor-pointer hover:z-20 hover:scale-105 transition-all duration-300 origin-center shadow-lg border border-white/5"
                      >
                         <img 
                           src={project.image} 
                           alt={project.title} 
                           className="w-full h-full object-cover transition-opacity duration-300 opacity-80 group-hover:opacity-100"
                         />
                         
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <h4 className="font-bold text-white text-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{project.title}</h4>
                            <div className="flex items-center gap-2 mt-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                              <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">{project.category}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </section>
        </div>
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

export default App;
