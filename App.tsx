
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// --- Shaders ---

const vertexShader = `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_click_strength;
  
  varying vec3 v_position;

  // Simplex 3D Noise - used for organic movement
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
    
    // Hover effect: pulls vertices outward
    float hover_strength = smoothstep(0.6, 0.0, mouse_dist) * 0.2;
    
    // Click effect: pushes vertices inward
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

  varying vec3 v_position;

  void main() {
    float intensity = (v_position.x * 0.5) + 0.5;
    
    vec3 color = u_color1;
    color = mix(color, u_color2, smoothstep(0.0, 0.6, intensity));
    color = mix(color, u_color3, smoothstep(0.4, 1.0, intensity));
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- Blob3D Component ---
const Blob3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mouse = useRef(new THREE.Vector2(0, 0));
    const smoothedMouse = useRef(new THREE.Vector2(0, 0));
    const isMouseDown = useRef(false);
    const clickStrength = useRef(0);


    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.z = 3;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);
        
        // Geometry and Material
        const geometry = new THREE.SphereGeometry(1, 128, 128);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                u_time: { value: 0 },
                u_mouse: { value: new THREE.Vector2(0, 0) },
                u_click_strength: { value: 0 },
                u_color1: { value: new THREE.Color(0x3BE9EB) }, // Cyan
                u_color2: { value: new THREE.Color(0x1848A1) }, // Blue
                u_color3: { value: new THREE.Color(0x981EC0) }, // Purple
            },
        });

        const blob = new THREE.Mesh(geometry, material);
        // Scale and center the blob
        blob.scale.set(1.5, 1.5, 1.5);
        blob.position.set(0, 0, 0);
        scene.add(blob);

        // Animation and Interaction
        const clock = new THREE.Clock();
        let animationFrameId: number;
        
        const handleMouseMove = (event: MouseEvent) => {
            if (mount) {
                 const rect = mount.getBoundingClientRect();
                 const x = ((event.clientX - rect.left) / mount.clientWidth) * 2 - 1;
                 const y = -((event.clientY - rect.top) / mount.clientHeight) * 2 + 1;
                 mouse.current.set(x, y);
            }
        };
        
        const handleMouseDown = () => { isMouseDown.current = true; };
        const handleMouseUp = () => { isMouseDown.current = false; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            // Smooth mouse position for interaction
            smoothedMouse.current.lerp(mouse.current, 0.075);
            material.uniforms.u_mouse.value.copy(smoothedMouse.current);

            // Animate click strength
            const targetStrength = isMouseDown.current ? 1.0 : 0.0;
            clickStrength.current += (targetStrength - clickStrength.current) * 0.1;
            material.uniforms.u_click_strength.value = clickStrength.current;

            material.uniforms.u_time.value = elapsedTime;

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // Handle Resize
        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
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

    return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};


// --- App Component ---
function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#03001C]">
      <Blob3D />
    </main>
  );
}

export default App;
