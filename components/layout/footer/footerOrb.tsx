'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function cssVarHex(name: string): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return (r << 16) | (g << 8) | b;
}

export default function FooterOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let solidMat: any = null;
    let wireMat: any = null;
    let cleanup = () => {};

    import('three').then((THREE) => {
      const W = canvas.offsetWidth || 280;
      const H = canvas.offsetHeight || 280;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, 0, 4.5);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      const geo = new THREE.TorusKnotGeometry(1, 0.32, 160, 24, 2, 3);

      const accentHex = cssVarHex('--color-accent');
      const bgHex = cssVarHex('--color-bg-muted');

      wireMat = new THREE.MeshBasicMaterial({
        color: accentHex,
        wireframe: true,
        opacity: 0.22,
        transparent: true,
      });

      solidMat = new THREE.MeshStandardMaterial({
        color: bgHex,
        metalness: 0.35,
        roughness: 0.55,
        opacity: 0.9,
        transparent: true,
      });

      const solidMesh = new THREE.Mesh(geo, solidMat);
      const wireMesh = new THREE.Mesh(geo, wireMat);
      scene.add(solidMesh, wireMesh);

      const ambient = new THREE.AmbientLight(0xffffff, 0.35);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(accentHex, 1.8);
      key.position.set(2, 3, 3);
      scene.add(key);

      const fill = new THREE.DirectionalLight(cssVarHex('--color-pt-fill'), 0.7);
      fill.position.set(-3, -1, 1);
      scene.add(fill);

      const updateColors = () => {
        if (!solidMat || !wireMat) return;
        const newAccent = cssVarHex('--color-accent');
        const newBg = cssVarHex('--color-bg-muted');
        wireMat.color.setHex(newAccent);
        solidMat.color.setHex(newBg);
        key.color.setHex(newAccent);
      };

      const observer = new MutationObserver(updateColors);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMouseMove);

      let t = 0;
      const tick = () => {
        rafRef.current = requestAnimationFrame(tick);
        t += 0.004;
        targetRef.current.x += (mouseRef.current.y * 0.6 - targetRef.current.x) * 0.04;
        targetRef.current.y += (mouseRef.current.x * 0.6 - targetRef.current.y) * 0.04;
        solidMesh.rotation.x = targetRef.current.x + t * 0.25;
        solidMesh.rotation.y = targetRef.current.y + t * 0.4;
        wireMesh.rotation.x = solidMesh.rotation.x;
        wireMesh.rotation.y = solidMesh.rotation.y;
        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      gsap.fromTo(
        [solidMesh.scale, wireMesh.scale],
        { x: 0.6, y: 0.6, z: 0.6 },
        { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
      );

      cleanup = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        observer.disconnect();
        renderer.dispose();
        geo.dispose();
        solidMat?.dispose();
        wireMat?.dispose();
      };
    });

    return () => cleanup();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block size-full pointer-events-none"
    />
  );
}