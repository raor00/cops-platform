"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type VideoLoaderProps = {
  onComplete: () => void;
};

export default function VideoLoader({ onComplete }: VideoLoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [loadPercentage, setLoadPercentage] = useState(0);

  const startFadeOut = () => {
    if (isFading) return;
    setIsFading(true);
    window.setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || videoDuration <= 0) return;

    const currentTime = videoRef.current.currentTime;
    const remainingTime = videoDuration - currentTime;

    const percentage = Math.min((currentTime / videoDuration) * 100, 100);
    setLoadPercentage(percentage);

    if (remainingTime <= 2.2) {
      startFadeOut();
    }
  };

  return (
    <AnimatePresence>
      {!isFading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#070f1e]"
        >
          <div className="pointer-events-none absolute h-[200px] w-[200px] animate-pulse rounded-full bg-cyan-600/20 blur-[60px] md:h-[300px] md:w-[300px]" />

          <div
            className="relative flex h-full w-full items-center justify-center mix-blend-screen"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle at center, black 35%, transparent 65%)",
              maskImage:
                "radial-gradient(circle at center, black 35%, transparent 65%)",
            }}
          >
            <video
              ref={videoRef}
              src="/loader-video.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={startFadeOut}
              onError={startFadeOut}
              className="absolute h-full w-full origin-center scale-[1.3] object-cover md:scale-[1.1]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative z-10 mt-8 text-center"
          >
            <span className="font-mono text-xl font-bold tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_10px_rgba(0,210,255,0.8)] md:text-2xl">
              {Math.round(loadPercentage)}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
