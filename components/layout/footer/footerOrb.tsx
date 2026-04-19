'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FooterOrb() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ── Dynamic Three.js import (avoids SSR issues) ──────────────
        let cleanup = () => { };

        import('three').then((THREE) => {
            const W = canvas.offsetWidth;
            const H = canvas.offsetHeight;

            // ── Scene ────────────────────────────────────────────────────
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
            camera.position.set(0, 0, 4.5);

            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(W, H);
            renderer.setClearColor(0x000000, 0);

            // ── Geometry — torus knot ─────────────────────────────────
            // p=2 q=3 gives an elegant twist matching the PT/YT split metaphor
            const geo = new THREE.TorusKnotGeometry(1, 0.32, 160, 24, 2, 3);

            // Wireframe overlay
            const wireMat = new THREE.MeshBasicMaterial({
                color: 0x2A7A5C,   // accent emerald
                wireframe: true,
                opacity: 0.18,
                transparent: true,
            });

            // Solid shell — muted graphite with slight emerald tint
            const solidMat = new THREE.MeshStandardMaterial({
                color: 0x1E2824,
                metalness: 0.4,
                roughness: 0.6,
                opacity: 0.88,
                transparent: true,
            });

            const solidMesh = new THREE.Mesh(geo, solidMat);
            const wireMesh = new THREE.Mesh(geo, wireMat);
            scene.add(solidMesh, wireMesh);

            // ── Lighting ─────────────────────────────────────────────
            const ambient = new THREE.AmbientLight(0xffffff, 0.3);
            scene.add(ambient);

            const key = new THREE.DirectionalLight(0xB5DDD0, 1.6);  // cool emerald key
            key.position.set(2, 3, 3);
            scene.add(key);

            const fill = new THREE.DirectionalLight(0x4A6FA5, 0.6); // PT blue fill
            fill.position.set(-3, -1, 1);
            scene.add(fill);

            // ── Mouse tracking via GSAP ───────────────────────────────
            const onMouseMove = (e: MouseEvent) => {
                const rect = canvas.getBoundingClientRect();
                // Normalised -1..1 relative to canvas centre
                mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            };
            window.addEventListener('mousemove', onMouseMove);

            // ── Render loop ───────────────────────────────────────────
            let t = 0;
            const tick = () => {
                rafRef.current = requestAnimationFrame(tick);
                t += 0.004;

                // Smooth lerp of target rotation toward mouse
                targetRef.current.x += (mouseRef.current.y * 0.6 - targetRef.current.x) * 0.04;
                targetRef.current.y += (mouseRef.current.x * 0.6 - targetRef.current.y) * 0.04;

                // Slow autonomous spin + mouse influence
                solidMesh.rotation.x = targetRef.current.x + t * 0.25;
                solidMesh.rotation.y = targetRef.current.y + t * 0.4;
                wireMesh.rotation.x = solidMesh.rotation.x;
                wireMesh.rotation.y = solidMesh.rotation.y;

                renderer.render(scene, camera);
            };
            tick();

            // ── Resize ───────────────────────────────────────────────
            const onResize = () => {
                const w = canvas.offsetWidth;
                const h = canvas.offsetHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            };
            window.addEventListener('resize', onResize);

            // ── GSAP entrance ────────────────────────────────────────
            // Scale from 0.6 to 1.0 when footer mounts
            gsap.fromTo(
                [solidMesh.scale, wireMesh.scale],
                { x: 0.6, y: 0.6, z: 0.6 },
                { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
            );

            cleanup = () => {
                cancelAnimationFrame(rafRef.current);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('resize', onResize);
                renderer.dispose();
                geo.dispose();
                solidMat.dispose();
                wireMat.dispose();
            };
        });

        return () => cleanup();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                pointerEvents: 'none',
            }}
        />
    );
}