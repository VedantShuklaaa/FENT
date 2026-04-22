'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
	motion,
	useMotionValue,
	useSpring,
	useTransform,
	useInView,
} from 'framer-motion';

// ─── Per-card tilt hook ───────────────────────────────────────────
function useTilt(strength = 8) {
	const mx = useMotionValue(0);
	const my = useMotionValue(0);
	const sx = useSpring(mx, { stiffness: 120, damping: 22 });
	const sy = useSpring(my, { stiffness: 120, damping: 22 });
	const rotateX = useTransform(sy, [-1, 1], [strength, -strength]);
	const rotateY = useTransform(sx, [-1, 1], [-strength, strength]);

	const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
		my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
	}, [mx, my]);

	const onMouseLeave = useCallback(() => {
		mx.set(0);
		my.set(0);
	}, [mx, my]);

	return { rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─── Animated progress bar (vault fill) ──────────────────────────
function VaultBar({
	pct,
	color,
	label,
	delay,
}: {
	pct: number;
	color: string;
	label: string;
	delay: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true });

	return (
		<div ref={ref} className="mb-[10px]">
			<div className="mb-[5px] flex justify-between">
				<span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
					{label}
				</span>
				<span
					className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.06em]"
					style={{ color }}
				>
					{pct}%
				</span>
			</div>

			<div className="h-1 overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)]">
				<motion.div
					className="h-full rounded-[2px]"
					style={{ background: color, originX: 0 }}
					initial={{ scaleX: 0 }}
					animate={inView ? { scaleX: pct / 100 } : {}}
					transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
				/>
			</div>
		</div>
	);
}

// ─── Card 01: Vault deposit visual ────────────────────────────────
function VaultVisual() {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true });

	return (
		<div ref={ref} className="relative overflow-hidden pt-1">
			<div className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-[var(--color-accent-bg)] opacity-50 blur-[50px]" />

			<div className="mb-[14px] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)]">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--color-accent)"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<path d="M8 21h8M12 17v4" />
					<circle cx="12" cy="10" r="3" />
				</svg>
			</div>

			<div className="mb-3 block font-[var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
				Vault Allocation
			</div>

			<VaultBar pct={74} color="var(--color-accent)" label="jitoSOL" delay={0.3} />
			<VaultBar pct={16} color="var(--color-pt-fill)" label="mSOL" delay={0.5} />
			<VaultBar pct={10} color="var(--color-yt-fill)" label="bSOL" delay={0.7} />

			<motion.div
				className="mt-4 flex flex-col gap-[3px] rounded-[6px] border border-[var(--color-border-soft)] bg-[var(--color-bg-muted)] px-3 py-[10px]"
				initial={{ opacity: 0, y: 8 }}
				animate={inView ? { opacity: 1, y: 0 } : {}}
				transition={{ delay: 0.9, duration: 0.5 }}
			>
				<span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
					Total locked
				</span>
				<span className="font-[var(--font-mono)] text-[15px] font-medium tabular-nums text-[var(--color-text-primary)]">
					$142.4M
				</span>
			</motion.div>
		</div>
	);
}

// ─── Card 02: PT / YT split orb (Three.js) ───────────────────────
function SplitOrb() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let animId: number;
		let cleanup: (() => void) | undefined;

		import('three').then((THREE) => {
			const W = canvas.clientWidth, H = canvas.clientHeight;
			const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.setSize(W, H);
			renderer.setClearColor(0x000000, 0);

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
			camera.position.set(0, 0, 5);

			scene.add(new THREE.AmbientLight(0xffffff, 0.5));
			const p1 = new THREE.PointLight(0x4A6FA5, 3, 8); p1.position.set(2, 2, 2); scene.add(p1);
			const p2 = new THREE.PointLight(0xC47D2A, 2, 8); p2.position.set(-2, -1, 2); scene.add(p2);
			const p3 = new THREE.PointLight(0x2A7A5C, 1.5, 6); p3.position.set(0, -2, 1); scene.add(p3);

			const ptGeo = new THREE.SphereGeometry(0.9, 32, 32, 0, Math.PI);
			const ptMat = new THREE.MeshStandardMaterial({ color: 0x4A6FA5, metalness: 0.4, roughness: 0.3 });
			const ptMesh = new THREE.Mesh(ptGeo, ptMat);
			ptMesh.rotation.y = Math.PI / 2;
			scene.add(ptMesh);

			const ytGeo = new THREE.SphereGeometry(0.9, 32, 32, Math.PI, Math.PI);
			const ytMat = new THREE.MeshStandardMaterial({ color: 0xC47D2A, metalness: 0.4, roughness: 0.3 });
			const ytMesh = new THREE.Mesh(ytGeo, ytMat);
			ytMesh.rotation.y = Math.PI / 2;
			scene.add(ytMesh);

			const ringGeo = new THREE.TorusGeometry(0.91, 0.012, 8, 64);
			const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.25, transparent: true });
			const ring = new THREE.Mesh(ringGeo, ringMat);
			ring.rotation.y = Math.PI / 2;
			scene.add(ring);

			const ptDotGeo = new THREE.SphereGeometry(0.06, 12, 12);
			const ptDotMat = new THREE.MeshStandardMaterial({ color: 0x8AAED4, emissive: 0x4A6FA5, emissiveIntensity: 0.8 });
			const ptDot = new THREE.Mesh(ptDotGeo, ptDotMat);
			scene.add(ptDot);

			const ytDotGeo = new THREE.SphereGeometry(0.05, 12, 12);
			const ytDotMat = new THREE.MeshStandardMaterial({ color: 0xE8B87A, emissive: 0xC47D2A, emissiveIntensity: 0.8 });
			const ytDot = new THREE.Mesh(ytDotGeo, ytDotMat);
			scene.add(ytDot);

			let t = 0;
			const animate = () => {
				animId = requestAnimationFrame(animate);
				t += 0.01;
				ptMesh.rotation.x += 0.004;
				ytMesh.rotation.x += 0.004;
				ring.rotation.x += 0.002;
				ptDot.position.set(Math.cos(t * 1.1) * 1.25, Math.sin(t * 1.1) * 0.4, Math.sin(t * 0.7) * 0.3);
				ytDot.position.set(Math.cos(t * 0.9 + Math.PI) * 1.3, Math.sin(t * 0.9 + Math.PI) * 0.5, Math.cos(t * 0.6) * 0.2);
				renderer.render(scene, camera);
			};
			animate();

			cleanup = () => {
				cancelAnimationFrame(animId);
				renderer.dispose();
			};
		});

		return () => cleanup?.();
	}, []);

	return (
		<div className="relative overflow-hidden pt-1">
			<div className="pointer-events-none absolute -left-[30px] -top-[30px] h-[200px] w-[200px] rounded-full bg-[var(--color-pt-bg)] opacity-50 blur-[50px]" />
			<div className="pointer-events-none absolute -bottom-[30px] -right-[30px] h-[200px] w-[200px] rounded-full bg-[var(--color-yt-bg)] opacity-50 blur-[50px]" />

			<canvas ref={canvasRef} className="block h-[160px] w-full" />

			<div className="mt-3 flex gap-[10px]">
				<div className="rounded-[4px] px-[10px] py-1 font-[var(--font-mono)] text-[10px] font-medium tracking-[0.06em] text-[var(--color-pt)] border border-[var(--color-pt-border)] bg-[var(--color-pt-bg)]">
					PT · 1:1
				</div>
				<div className="rounded-[4px] px-[10px] py-1 font-[var(--font-mono)] text-[10px] font-medium tracking-[0.06em] text-[var(--color-yt)] border border-[var(--color-yt-border)] bg-[var(--color-yt-bg)]">
					YT · 1:1
				</div>
			</div>
		</div>
	);
}

// ─── Card 03: Auction price chart (SVG sparkline) ─────────────────
function AuctionChart() {
	const [points, setPoints] = useState<number[]>([68, 72, 70, 75, 73, 78, 76, 80, 79, 84]);
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true });

	const [revealed, setRevealed] = useState(0);

	useEffect(() => {
		if (!inView) return;
		let i = 0;
		const id = setInterval(() => {
			i++;
			setRevealed(i);
			if (i >= points.length) clearInterval(id);
		}, 120);
		return () => clearInterval(id);
	}, [inView, points.length]);

	useEffect(() => {
		const id = setInterval(() => {
			setPoints((prev) => {
				const next = [...prev];
				next[next.length - 1] = Math.max(
					70,
					Math.min(95, next[next.length - 1] + (Math.random() - 0.48) * 2)
				);
				return next;
			});
		}, 1200);
		return () => clearInterval(id);
	}, []);

	const visible = points.slice(0, Math.max(1, revealed));
	const W = 220, H = 80, PAD = 6;
	const min = 60, max = 100;
	const toX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
	const toY = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
	const polyline = visible.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
	const lastX = toX(visible.length - 1);
	const lastY = toY(visible[visible.length - 1]);
	const lastVal = visible[visible.length - 1];

	return (
		<div ref={ref} className="relative overflow-hidden pt-1">
			<div className="pointer-events-none absolute -bottom-10 -left-5 h-[200px] w-[200px] rounded-full bg-[var(--color-accent-bg)] opacity-50 blur-[50px]" />

			<div className="mb-3 flex items-center justify-between">
				<span className="block font-[var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
					Implied APY · Round #14
				</span>

				<motion.span
					className="font-[var(--font-mono)] text-[13px] font-medium tabular-nums text-[var(--color-positive)]"
					animate={{ opacity: [1, 0.5, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				>
					{lastVal.toFixed(1)}%
				</motion.span>
			</div>

			<svg
				width="100%"
				viewBox={`0 0 ${W} ${H}`}
				className="block overflow-visible"
			>
				{[70, 80, 90].map((y) => (
					<line
						key={y}
						x1={PAD}
						x2={W - PAD}
						y1={toY(y)}
						y2={toY(y)}
						stroke="var(--color-border-soft)"
						strokeWidth={0.5}
					/>
				))}

				{visible.length > 1 && (
					<motion.polygon
						points={`${polyline} ${lastX.toFixed(1)},${H - PAD} ${PAD.toFixed(1)},${H - PAD}`}
						fill="var(--color-accent)"
						opacity={0.08}
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.08 }}
					/>
				)}

				{visible.length > 1 && (
					<polyline
						points={polyline}
						fill="none"
						stroke="var(--color-accent)"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				)}

				{visible.length > 0 && (
					<>
						<motion.circle
							cx={lastX}
							cy={lastY}
							r={5}
							fill="var(--color-accent)"
							animate={{ r: [4, 7, 4], opacity: [1, 0.3, 1] }}
							transition={{ duration: 1.5, repeat: Infinity }}
						/>
						<circle cx={lastX} cy={lastY} r={3} fill="var(--color-accent)" />
					</>
				)}
			</svg>

			<div className="mt-3 flex justify-between rounded-[6px] bg-[var(--color-bg-muted)] px-3 py-2">
				<span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
					Clearing price
				</span>
				<span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
					0.9712 jitoSOL
				</span>
			</div>
		</div>
	);
}

// ─── Individual card ──────────────────────────────────────────────
function StepCard({
	num,
	title,
	body,
	accentColor,
	accentBg,
	accentBorder,
	floatDelay,
	floatOffset,
	visual,
	gsapIndex,
}: {
	num: string;
	title: string;
	body: string;
	accentColor: string;
	accentBg: string;
	accentBorder: string;
	floatDelay: number;
	floatOffset: number;
	visual: React.ReactNode;
	gsapIndex: number;
}) {
	const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(7);

	return (
		<motion.div
			className="relative"
			style={{ perspective: 1000, marginTop: floatOffset }}
			initial={{ opacity: 0, y: 48 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.65, delay: gsapIndex * 0.12, ease: [0.22, 1, 0.36, 1] }}
		>
			<motion.div
				className="relative cursor-default overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] shadow-[0_24px_48px_var(--color-border-medium)]"
				style={{
					rotateX,
					rotateY,
					transformStyle: 'preserve-3d',
				}}
				onMouseMove={onMouseMove}
				onMouseLeave={onMouseLeave}
				animate={{ y: [0 + floatOffset, -10 + floatOffset, 0 + floatOffset] }}
				transition={{
					y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
					rotateX: { duration: 0.3 },
					rotateY: { duration: 0.3 },
				}}
				whileHover={{
					boxShadow: `0 32px 64px var(--color-border-medium), 0 0 0 0.5px ${accentBorder}`,
				}}
			>
				<div className="h-[2px] opacity-70" style={{ background: accentColor }} />

				<div className="flex items-center justify-between border-b border-[var(--color-border-soft)] bg-[var(--color-bg-subtle)] px-5 pb-3 pt-[14px]">
					<div className="flex items-center gap-[10px]">
						<span
							className="rounded-[4px] px-2 py-[3px] font-[var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.08em]"
							style={{
								background: accentBg,
								color: accentColor,
								border: `0.5px solid ${accentBorder}`,
							}}
						>
							Step {num}
						</span>
					</div>

					<div className="flex gap-[5px]">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className="h-[5px] w-[5px] rounded-full bg-[var(--color-bg-muted)]"
							/>
						))}
					</div>
				</div>

				<div className="bg-[var(--color-bg-subtle)] px-5 pb-0 pt-5">
					{visual}
				</div>

				<div className="px-5 pb-[22px] pt-[18px]">
					<h3 className="mb-2 font-[var(--font-sans)] text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--color-text-primary)]">
						{title}
					</h3>
					<p className="m-0 font-[var(--font-sans)] text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
						{body}
					</p>
				</div>

				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-[60px] opacity-50"
					style={{ background: `linear-gradient(to top, ${accentBg}, transparent)` }}
				/>
			</motion.div>
		</motion.div>
	);
}

// ─── Main section ─────────────────────────────────────────────────
const CARDS = [
	{
		num: '01',
		title: 'Deposit LST',
		body: 'Lock jitoSOL, mSOL, or bSOL into the FENt vault for a chosen maturity date. Your deposit is secured on-chain — no custodians.',
		accentColor: 'var(--color-accent)',
		accentBg: 'var(--color-accent-bg)',
		accentBorder: 'var(--color-accent-border)',
		floatDelay: 0,
		floatOffset: 0,
	},
	{
		num: '02',
		title: 'Mint PT & YT',
		body: 'Receive your Principal and Yield Tokens instantly — a perfect 1:1 ratio. Both are liquid SPL tokens, freely tradeable on any DEX.',
		accentColor: 'var(--color-pt-fill)',
		accentBg: 'var(--color-pt-bg)',
		accentBorder: 'var(--color-pt-border)',
		floatDelay: 0.6,
		floatOffset: 24,
	},
	{
		num: '03',
		title: 'Trade or Hold',
		body: 'Participate in on-chain auctions to discover implied rates, or hold to maturity for guaranteed 1:1 PT redemption and full YT yield claim.',
		accentColor: 'var(--color-yt-fill)',
		accentBg: 'var(--color-yt-bg)',
		accentBorder: 'var(--color-yt-border)',
		floatDelay: 1.2,
		floatOffset: -16,
	},
];

const VISUALS = [<VaultVisual key="v" />, <SplitOrb key="s" />, <AuctionChart key="a" />];

export default function FlowSection() {
	return (
		<section className="relative mx-4 mb-20 overflow-hidden rounded-[48px] bg-[var(--color-bg-base)] px-0 pb-[100px] pt-[80px]">
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-accent-bg)_0%,transparent_65%)] opacity-40 blur-[40px]" />

			<div className="relative z-[1] mx-auto max-w-[1200px] px-10">
				<motion.div
					className="mb-[72px]"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-60px' }}
					transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="mb-[18px] flex items-center gap-3">
						<span className="block h-px w-8 bg-[var(--color-accent)]" />
						<span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-accent)]">
							The flow
						</span>
					</div>

					<div className="flex flex-wrap items-end justify-between gap-6">
						<h2 className="m-0 max-w-[520px] font-[var(--font-sans)] text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--color-text-primary)]">
							A fluid experience from
							<br />
							<span className="text-[var(--color-text-tertiary)]">deposit to maturity.</span>
						</h2>

						<p className="m-0 max-w-[280px] font-[var(--font-sans)] text-[15px] leading-[1.6] text-[var(--color-text-secondary)]">
							Three steps to unlock the full potential of your staked assets.
						</p>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 items-start gap-7 md:grid-cols-2 xl:grid-cols-3">
					{CARDS.map((card, i) => (
						<StepCard
							key={card.num}
							{...card}
							visual={VISUALS[i]}
							gsapIndex={i}
						/>
					))}
				</div>
			</div>
		</section>
	);
}