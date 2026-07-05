import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useAppStore } from "../../store/useAppStore";
import { setPreviewCanvas } from "../../engine/preview/canvasRegistry";
import { ParticleForms } from "../../engine/three/particleForms";

/* ------------------------------------------------------------------ */
/*  Real-time 3D viewport (Three.js). Perspective camera + orbit        */
/*  controls, minimal lighting + grid, and the Particle Forms 3D cloud. */
/*  Reads settings live from the store each frame; registers its canvas */
/*  so Capture can read the WebGL output.                              */
/* ------------------------------------------------------------------ */

export function ThreeViewport() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true, // allow Capture to read pixels
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    setPreviewCanvas(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.2, 5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 1.5;
    controls.maxDistance = 20;

    // Minimal lighting.
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(3, 5, 4);
    scene.add(key);

    // Subtle floor grid.
    const grid = new THREE.GridHelper(14, 28, 0x333333, 0x1a1a1a);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.25;
    grid.position.y = -2;
    scene.add(grid);

    const forms = new ParticleForms();
    scene.add(forms.points);

    let raf = 0;
    let last = performance.now();
    let lastFov = -1;
    const bg = new THREE.Color();

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = useAppStore.getState().particleForms3D;

      bg.set(s.background);
      scene.background = bg;

      const fov = 25 + (s.perspective / 100) * 55;
      if (fov !== lastFov) {
        lastFov = fov;
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }

      forms.sync(s);
      forms.tick(now / 1000, dt, s);

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      forms.dispose();
      renderer.dispose();
      setPreviewCanvas(null);
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} className="size-full" />;
}
