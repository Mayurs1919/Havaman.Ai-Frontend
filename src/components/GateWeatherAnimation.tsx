import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const clouds = [
  { w: 180, h: 60, x: -10, y: 8, opacity: 0.06, dur: 45 },
  { w: 240, h: 70, x: 60, y: 18, opacity: 0.04, dur: 60 },
  { w: 140, h: 50, x: 30, y: 65, opacity: 0.05, dur: 50 },
  { w: 200, h: 55, x: 80, y: 78, opacity: 0.03, dur: 55 },
];

const raindrops = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  duration: 0.5 + Math.random() * 0.4,
  opacity: 0.1 + Math.random() * 0.25,
  height: 14 + Math.random() * 12,
}));

const lightningFlash = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0, 0, 0.2, 0, 0.12, 0, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  transition: { duration: 6, repeat: Infinity, ease: 'linear' as const },
};

const GateWeatherAnimation: React.FC = () => {
  // Generate snowflakes
  const snowflakes = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.4,
      size: 2 + Math.random() * 5,
      drift: -30 + Math.random() * 60,
    })),
  []);

  // Generate lightning bolt paths
  const lightningBolts = useMemo(() => [
    { x: '25%', delay: 0, duration: 7 },
    { x: '70%', delay: 3.5, duration: 8 },
    { x: '45%', delay: 6, duration: 9 },
  ], []);

  return (
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

      {/* Rain */}
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

      {/* Snow particles */}
      {snowflakes.map((s) => (
        <motion.div
          key={`snow-${s.id}`}
          className="absolute rounded-full"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, rgba(255,255,255,${s.opacity}), rgba(200,220,255,${s.opacity * 0.5}))`,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,${s.opacity * 0.3})`,
          }}
          animate={{
            y: ['-5vh', '105vh'],
            x: [0, s.drift, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: s.duration * 0.8, delay: s.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: s.duration * 1.5, repeat: Infinity, ease: 'linear' },
          }}
        />
      ))}

      {/* Lightning bolts */}
      {lightningBolts.map((bolt, i) => (
        <motion.div
          key={`bolt-${i}`}
          className="absolute top-0"
          style={{
            left: bolt.x,
            width: '3px',
            height: '40%',
            background: 'linear-gradient(180deg, rgba(200,220,255,0.8), rgba(140,180,255,0.4), transparent)',
            filter: 'blur(1px)',
            transformOrigin: 'top center',
          }}
          animate={{
            opacity: [0, 0, 0, 0.9, 0.3, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            scaleY: [0, 0, 0, 1, 0.8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          }}
          transition={{ duration: bolt.duration, delay: bolt.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Thunder flash overlay */}
      <motion.div
        className="absolute inset-0 bg-blue-200/10"
        {...lightningFlash}
      />

      {/* Secondary thunder flash - purple tint */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08), transparent 60%)' }}
        animate={{
          opacity: [0, 0, 0, 0, 0, 0.6, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/[0.03] to-transparent" />

      {/* Aurora */}
      <motion.div
        className="absolute top-0 left-1/4 right-1/4 h-1/2"
        style={{
          background: 'linear-gradient(180deg, rgba(56,189,248,0.03), rgba(139,92,246,0.02), transparent)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [-50, 50, -50], scaleX: [1, 1.3, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Fog / mist layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/4"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(100,150,200,0.03))',
          filter: 'blur(40px)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default GateWeatherAnimation;
