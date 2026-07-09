import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Crosshair, Maximize } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { setPreviewCanvas } from "../../engine/preview/canvasRegistry";
import { ParticleForms } from "../../engine/three/particleForms";
import { ElasticBubble } from "../../engine/three/elasticBubble";
import { InteractiveParticles } from "../../engine/three/interactiveParticles";
import { ImageParticles } from "../../engine/three/imageParticles";
import type { ThreeToolId } from "../../types/three";

/* ------------------------------------------------------------------ */
/*  Real-time 3D viewport (Three.js). Perspective camera + orbit        */
/*  controls, and the active 3D tool. Reads settings live from the      */
/*  store each frame; registers its canvas so Capture can read it.      */
/*  Particle Form 3D also receives the mouse pointer for interaction.   */
/* ------------------------------------------------------------------ */

export function ThreeViewport() {
  const hostRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const fitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    setPreviewCanvas(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    const DEFAULT_POS = new THREE.Vector3(0, 0.6, 5);
    camera.position.copy(DEFAULT_POS);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 1.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);
    controls.saveState();

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(3, 5, 4);
    scene.add(key);

    const forms = new ParticleForms();
    const bubble = new ElasticBubble();
    const interactive = new InteractiveParticles();
    const imageP = new ImageParticles();

    const objFor = (tool: ThreeToolId): THREE.Object3D => {
      if (tool === "elasticBubble3D") return bubble.mesh;
      if (tool === "interactiveParticles3D") return interactive.points;
      if (tool === "imageParticles3D") return imageP.points;
      return forms.points;
    };

    let currentTool: ThreeToolId = useAppStore.getState().three3DTool;
    scene.add(objFor(currentTool));

    // --- pointer → world (for Particle Form 3D interaction) ---
    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane();
    const planeHit = new THREE.Vector3();
    let pointerInside = false;
    const onPointerMove = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointerInside = true;
    };
    const onPointerLeave = () => { pointerInside = false; };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);

    let raf = 0;
    let last = performance.now();
    const bg = new THREE.Color();

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // Reset / Fit view actions exposed to the overlay buttons.
    resetRef.current = () => {
      controls.reset();
      camera.position.copy(DEFAULT_POS);
      camera.lookAt(0, 0, 0);
    };
    fitRef.current = () => {
      const obj = objFor(useAppStore.getState().three3DTool);
      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const fov = (camera.fov * Math.PI) / 180;
      const dist = (sphere.radius * 1.4) / Math.sin(fov / 2);
      const dir = camera.position.clone().sub(controls.target).normalize();
      controls.target.copy(sphere.center);
      camera.position.copy(sphere.center).addScaledVector(dir, dist);
      controls.update();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = useAppStore.getState();
      const tool = state.three3DTool;

      if (tool !== currentTool) {
        scene.remove(objFor(currentTool));
        currentTool = tool;
        scene.add(objFor(currentTool));
      }

      if (tool === "interactiveParticles3D") {
        const s = state.interactiveParticles3D;
        bg.set(s.background); scene.background = bg;
        // Feed the smoothed pointer onto a plane through the form's centre.
        if (pointerInside) {
          camera.getWorldDirection(plane.normal);
          plane.setFromNormalAndCoplanarPoint(plane.normal, interactive.points.position);
          ray.setFromCamera(ndc, camera);
          if (ray.ray.intersectPlane(plane, planeHit)) interactive.setPointer(planeHit);
          else interactive.setPointer(null);
        } else {
          interactive.setPointer(null);
        }
        interactive.sync(s);
        interactive.tick(now / 1000, dt, s);
      } else if (tool === "imageParticles3D") {
        const s = state.imageParticles3D;
        bg.set(s.background); scene.background = bg;
        imageP.sync(s, state.mediaImage);
        imageP.tick(now / 1000, dt, s);
      } else if (tool === "elasticBubble3D") {
        const s = state.elasticBubble3D;
        bg.set(s.background); scene.background = bg;
        bubble.sync(s);
        bubble.tick(now / 1000, dt, s);
      } else {
        const s = state.particleForms3D;
        bg.set(s.background); scene.background = bg;
        forms.sync(s);
        forms.tick(now / 1000, dt, s);
      }

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
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      forms.dispose();
      bubble.dispose();
      interactive.dispose();
      imageP.dispose();
      renderer.dispose();
      setPreviewCanvas(null);
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative size-full">
      <div ref={hostRef} className="size-full" />
      <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
        <button
          type="button"
          aria-label="Reset view"
          title="Reset view"
          onClick={() => resetRef.current()}
          className="pointer-events-auto grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-black/40 text-linen/70 backdrop-blur transition-colors hover:bg-black/60 hover:text-linen"
        >
          <Crosshair className="size-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Fit view"
          title="Fit view"
          onClick={() => fitRef.current()}
          className="pointer-events-auto grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-black/40 text-linen/70 backdrop-blur transition-colors hover:bg-black/60 hover:text-linen"
        >
          <Maximize className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
