'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useSmoothScroll() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        let lenis: any;

        import('@studio-freight/lenis').then(({ default: Lenis }) => {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                syncTouch: false,
                touchMultiplier: 2,
            });

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);

            lenis.on('scroll', ScrollTrigger.update);
        });

        return () => {
            if (lenis) lenis.destroy();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);
}