'use client';
import { useRef, useEffect } from 'react';

export default function YieldSphere3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cleanup: (() => void) | undefined;

        import('three').then((THREE) => {
            // ── Scene setup ───────────────────────────────────────────
            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setClearColor(0x000000, 0);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 6);

            // ── Lighting ──────────────────────────────────────────────
            const ambient = new THREE.AmbientLight(0xffffff, 0.3);
            const point1 = new THREE.PointLight(0x3DAF84, 2, 10); // emerald
            point1.position.set(3, 3, 3);
            const point2 = new THREE.PointLight(0x4A6FA5, 1.5, 10); // PT blue
            point2.position.set(-3, -2, 2);
            const point3 = new THREE.PointLight(0xC47D2A, 1, 8);  // YT amber
            point3.position.set(0, -3, -2);
            scene.add(ambient, point1, point2, point3);

            // ── Central sphere (LST token) ────────────────────────────
            const sphereGeo = new THREE.SphereGeometry(0.65, 64, 64);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: 0x1a2e22,
                metalness: 0.7,
                roughness: 0.2,
                emissive: 0x0d1a12,
                emissiveIntensity: 0.3,
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            scene.add(sphere);

            // Wireframe overlay on sphere
            const wireMat = new THREE.MeshBasicMaterial({ color: 0x2A7A5C, wireframe: true, opacity: 0.15, transparent: true });
            const wireGeo = new THREE.SphereGeometry(0.66, 16, 16);
            const wire = new THREE.Mesh(wireGeo, wireMat);
            scene.add(wire);

            // ── PT orbit ring ─────────────────────────────────────────
            const ptRingGeo = new THREE.TorusGeometry(1.6, 0.008, 8, 120);
            const ptRingMat = new THREE.MeshBasicMaterial({ color: 0x4A6FA5, opacity: 0.6, transparent: true });
            const ptRing = new THREE.Mesh(ptRingGeo, ptRingMat);
            ptRing.rotation.x = Math.PI / 3;
            ptRing.rotation.y = 0.4;
            scene.add(ptRing);

            // PT token (small sphere orbiting)
            const ptDotGeo = new THREE.SphereGeometry(0.08, 16, 16);
            const ptDotMat = new THREE.MeshStandardMaterial({ color: 0x4A6FA5, emissive: 0x2D4A7A, emissiveIntensity: 0.8, metalness: 0.5 });
            const ptDot = new THREE.Mesh(ptDotGeo, ptDotMat);
            scene.add(ptDot);

            // ── YT orbit ring (tilted differently, amber) ─────────────
            const ytRingGeo = new THREE.TorusGeometry(2.0, 0.006, 8, 120);
            const ytRingMat = new THREE.MeshBasicMaterial({ color: 0xC47D2A, opacity: 0.4, transparent: true });
            const ytRing = new THREE.Mesh(ytRingGeo, ytRingMat);
            ytRing.rotation.x = -Math.PI / 5;
            ytRing.rotation.z = 0.6;
            scene.add(ytRing);

            // YT token (small sphere on amber orbit)
            const ytDotGeo = new THREE.SphereGeometry(0.06, 16, 16);
            const ytDotMat = new THREE.MeshStandardMaterial({ color: 0xC47D2A, emissive: 0x7A4E14, emissiveIntensity: 0.8 });
            const ytDot = new THREE.Mesh(ytDotGeo, ytDotMat);
            scene.add(ytDot);

            // ── Particle field ────────────────────────────────────────
            const PARTICLE_COUNT = 300;
            const pPositions = new Float32Array(PARTICLE_COUNT * 3);
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 2.5 + Math.random() * 2.5;
                pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                pPositions[i * 3 + 2] = r * Math.cos(phi);
            }
            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
            const pMat = new THREE.PointsMaterial({ color: 0x3DAF84, size: 0.025, opacity: 0.5, transparent: true });
            const particles = new THREE.Points(pGeo, pMat);
            scene.add(particles);

            // ── Mouse parallax ────────────────────────────────────────
            let mouseX = 0, mouseY = 0;
            const onMouseMove = (e: MouseEvent) => {
                mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            };
            window.addEventListener('mousemove', onMouseMove);

            // ── Resize handler ────────────────────────────────────────
            const onResize = () => {
                if (!canvas) return;
                const w = canvas.clientWidth, h = canvas.clientHeight;
                renderer.setSize(w, h);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            };
            window.addEventListener('resize', onResize);

            // ── Animation loop ────────────────────────────────────────
            let frame = 0;
            let animId: number;

            const animate = () => {
                animId = requestAnimationFrame(animate);
                frame += 0.008;

                sphere.rotation.y += 0.003;
                sphere.rotation.x += 0.001;
                wire.rotation.y -= 0.004;

                const ptAngle = frame * 0.8;
                ptDot.position.set(
                    Math.cos(ptAngle) * 1.6 * Math.cos(ptRing.rotation.z),
                    Math.sin(ptAngle) * 1.6 * Math.sin(ptRing.rotation.x),
                    Math.sin(ptAngle) * 0.5,
                );

                const ytAngle = frame * 1.1 + 1.4;
                ytDot.position.set(
                    Math.cos(ytAngle) * 2.0 * Math.cos(ytRing.rotation.z),
                    Math.sin(ytAngle) * 2.0 * Math.sin(ytRing.rotation.x) - 0.3,
                    Math.sin(ytAngle) * 0.4,
                );

                particles.rotation.y += 0.0008;
                particles.rotation.x += 0.0003;

                scene.rotation.y += (mouseX * 0.3 - scene.rotation.y) * 0.05;
                scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.05;

                (sphereMat as import('three').MeshStandardMaterial).emissiveIntensity =
                    0.2 + Math.sin(frame * 1.5) * 0.1;

                renderer.render(scene, camera);
            };

            animate();

            cleanup = () => {
                cancelAnimationFrame(animId);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('resize', onResize);
                renderer.dispose();
            };
        });

        return () => cleanup?.();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
            }}
        />
    );
}