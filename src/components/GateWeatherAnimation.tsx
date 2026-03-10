import React from 'react';
import { motion } from 'framer-motion';

const clouds = [
  { w: 180, h: 60, x: -10, y: 8, opacity: 0.06, dur: 45 },
  { w: 240, h: 70, x: 60, y: 18, opacity: 0.04, dur: 60 },
  { w: 140, h: 50, x: 30, y: 65, opacity: 0.05, dur: 50 },
  { w: 200, h: 55, x: 80, y: 78, opacity: 0.03, dur: 55 },
];

const raindrops = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  duration: 0.6 + Math.random() * 0.5,
  opacity: 0.1 + Math.random() * 0.2,
  height: 12 + Math.random() * 10,
}));

const lightningFlash = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0, 0, 0.15, 0, 0.08, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  transition: { duration: 8, repeat: Infinity, ease: 'linear' as const },
};

const GateWeatherAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Animated clouds */}
    {clouds.map((c, i) => (
      <motion.div
        key={`cloud-${i}`}
        className="absolute rounded-full"
        style={{
          width: c.w,
          height: c.h,
          top: `${c.y}%`,
          background: `radial-gradient(ellipse, rgba(100,150,255,${c.opacity}), transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{ x: [`${c.x}vw`, `${c.x + 30}vw`, `${c.x}vw`] }}
        transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}

    {/* Subtle rain */}
    {raindrops.map((d) => (
      <motion.div
        key={`rain-${d.id}`}
        className="absolute w-[1px]"
        style={{
          left: d.left,
          height: d.height,
          background: `linear-gradient(180deg, transparent, rgba(140,180,255,${d.opacity}))`,
        }}
        animate={{ y: ['-5vh', '105vh'] }}
        transition={{
          duration: d.duration,
          delay: d.delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    ))}

    {/* Lightning flash overlay */}
    <motion.div
      className="absolute inset-0 bg-blue-200/10"
      {...lightningFlash}
    />

    {/* Horizon glow */}
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/[0.03] to-transparent" />

    {/* Subtle aurora */}
    <motion.div
      className="absolute top-0 left-1/4 right-1/4 h-1/2"
      style={{
        background: 'linear-gradient(180deg, rgba(56,189,248,0.03), rgba(139,92,246,0.02), transparent)',
        filter: 'blur(60px)',
      }}
      animate={{ x: [-50, 50, -50], scaleX: [1, 1.3, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

export default GateWeatherAnimation;
