"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="fixed right-4 top-1/2 z-[150] h-48 w-1 -translate-y-1/2 overflow-hidden rounded-full bg-slate-800/80 shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:right-6 md:right-8 md:h-64">
            <motion.div
                className="w-full origin-top bg-gradient-to-b from-cyan-400 to-blue-600"
                style={{ scaleY, height: "100%" }}
            />
        </div>
    );
}
