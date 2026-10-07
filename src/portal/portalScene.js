import {
    AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CircleGeometry, Clock, Color, Group,
    Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Scene,
    ShaderMaterial, TorusGeometry, WebGLRenderer,
} from "three";

// A small swirling portal: a shader vortex inside a glowing ring, orbiting
// chevrons and particles being pulled into the middle.

const VORTEX_VERT = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const VORTEX_FRAG = `
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uCore;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    float swirl = a + 2.4 / (r + 0.22) - uTime;
    float n = noise(vec2(cos(swirl), sin(swirl)) * 2.5 + vec2(r * 5.0 - uTime * 0.7));
    float bands = 0.5 + 0.5 * sin(swirl * 3.0 + n * 2.5);
    vec3 col = mix(uB, uA, bands);
    col *= 0.35 + 0.85 * bands * smoothstep(1.0, 0.35, r);
    col = mix(col, uCore, smoothstep(0.38, 0.0, r));
    col += uA * smoothstep(0.7, 0.98, r) * 0.5;
    float alpha = smoothstep(1.0, 0.93, r);
    gl_FragColor = vec4(col, alpha);
}`;

const HALO_FRAG = `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main() {
    float r = length(vUv * 2.0 - 1.0);
    float g = smoothstep(1.0, 0.3, r) * smoothstep(0.25, 0.55, r);
    gl_FragColor = vec4(uColor * g * uStrength, g * uStrength);
}`;

const PARTICLES = 90;
const CHEVRONS = 9;

export function createPortalScene(canvas, { colorA = '#B4F25A', colorB = '#2E8BA8', core = '#F4FFE0', still = false } = {}) {
    let renderer;
    try {
        renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 20);
    camera.position.set(0, 0, 4.6);

    const disposables = [];
    const keep = (x) => { disposables.push(x); return x; };

    const portal = new Group();
    scene.add(portal);

    const halo = new Mesh(keep(new PlaneGeometry(3.2, 3.2)), keep(new ShaderMaterial({
        vertexShader: VORTEX_VERT,
        fragmentShader: HALO_FRAG,
        uniforms: { uColor: { value: new Color(colorA) }, uStrength: { value: 0.55 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    })));
    halo.position.z = -0.1;
    portal.add(halo);

    const vortexMat = keep(new ShaderMaterial({
        vertexShader: VORTEX_VERT,
        fragmentShader: VORTEX_FRAG,
        uniforms: {
            uTime: { value: 0 },
            uA: { value: new Color(colorA) },
            uB: { value: new Color(colorB) },
            uCore: { value: new Color(core) },
        },
        transparent: true,
    }));
    portal.add(new Mesh(keep(new CircleGeometry(1, 96)), vortexMat));

    const ringMat = keep(new MeshBasicMaterial({ color: new Color(colorA), toneMapped: false }));
    portal.add(new Mesh(keep(new TorusGeometry(1.02, 0.06, 16, 128)), ringMat));

    const chevronGeo = keep(new BoxGeometry(0.16, 0.12, 0.08));
    const chevronMat = keep(new MeshBasicMaterial({ color: new Color('#2A2C33') }));
    const chevronLit = keep(new MeshBasicMaterial({ color: new Color(core), toneMapped: false }));
    const chevrons = new Group();
    for (let i = 0; i < CHEVRONS; i++) {
        const a = (i / CHEVRONS) * Math.PI * 2;
        const c = new Mesh(chevronGeo, chevronMat);
        c.position.set(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.04);
        c.rotation.z = a;
        chevrons.add(c);
    }
    portal.add(chevrons);

    // particles spiral inwards and respawn at the rim
    const radius = new Float32Array(PARTICLES);
    const angle = new Float32Array(PARTICLES);
    const positions = new Float32Array(PARTICLES * 3);
    const spawn = (i, r) => { radius[i] = r; angle[i] = Math.random() * Math.PI * 2; };
    for (let i = 0; i < PARTICLES; i++) spawn(i, 0.2 + Math.random() * 1.2);
    const particleGeo = keep(new BufferGeometry());
    particleGeo.setAttribute('position', new BufferAttribute(positions, 3));
    const particles = new Points(particleGeo, keep(new PointsMaterial({
        color: new Color(core),
        size: 0.05,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: AdditiveBlending,
    })));
    particles.position.z = 0.05;
    portal.add(particles);

    const clock = new Clock();
    let spin = 0;
    let speed = 1;
    let targetSpeed = 1;
    let hover = 0;
    let hovered = false;
    let surging = false;
    let raf = 0;
    let alive = true;

    function update(dt) {
        targetSpeed = surging ? 7 : hovered ? 2.6 : 1;
        speed += (targetSpeed - speed) * Math.min(1, dt * 4);
        hover += ((hovered ? 1 : 0) - hover) * Math.min(1, dt * 6);
        spin += dt * speed * 1.4;
        vortexMat.uniforms.uTime.value = spin;
        halo.material.uniforms.uStrength.value = 0.55 + hover * 0.45;
        chevrons.rotation.z = -spin * 0.15;
        chevrons.children.forEach((c, i) => {
            c.material = (Math.floor(spin * 2) + i) % CHEVRONS < 2 + hover * 4 ? chevronLit : chevronMat;
        });
        portal.scale.setScalar(1 + hover * 0.06);
        portal.rotation.x = Math.sin(spin * 0.35) * 0.12;
        portal.rotation.y = Math.cos(spin * 0.3) * 0.12;
        for (let i = 0; i < PARTICLES; i++) {
            radius[i] -= dt * speed * (0.18 + 0.45 * (1.3 - radius[i]));
            angle[i] += dt * speed * (1.2 / (radius[i] + 0.25));
            if (radius[i] < 0.06) spawn(i, 1.15 + Math.random() * 0.3);
            positions[i * 3] = Math.cos(angle[i]) * radius[i];
            positions[i * 3 + 1] = Math.sin(angle[i]) * radius[i];
            positions[i * 3 + 2] = 0;
        }
        particleGeo.attributes.position.needsUpdate = true;
    }

    function render() {
        renderer.render(scene, camera);
    }

    function frame() {
        raf = 0;
        if (!alive) return;
        update(Math.min(clock.getDelta(), 0.05));
        render();
        if (!still && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function start() {
        if (!raf && alive) {
            clock.getDelta();
            raf = requestAnimationFrame(frame);
        }
    }

    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (still) { update(0); render(); }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onVisibility = () => { if (!document.hidden) start(); };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    if (still) { update(0); render(); } else start();

    return {
        setHover(on) {
            hovered = on;
            if (still) { hover = on ? 1 : 0; update(0); render(); }
        },
        // spin up hard while someone steps through
        setSurge(on) {
            surging = on;
        },
        dispose() {
            alive = false;
            if (raf) cancelAnimationFrame(raf);
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            disposables.forEach((x) => x.dispose());
            renderer.dispose();
        },
    };
}
