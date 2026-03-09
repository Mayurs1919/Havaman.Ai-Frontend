import React, { useMemo } from 'react';

interface WeatherParticlesProps {
  conditionCode: string;
  timeOfDay: string;
}

const WeatherParticles: React.FC<WeatherParticlesProps> = ({ conditionCode, timeOfDay }) => {
  const particles = useMemo(() => {
    const isRain = ['Rain', 'Drizzle', 'Thunderstorm'].includes(conditionCode);
    const isSnow = conditionCode === 'Snow';
    const isClear = conditionCode === 'Clear' || conditionCode === 'Default';
    const isMorningOrAfternoon = ['morning', 'afternoon'].includes(timeOfDay);

    if (isRain) {
      return Array.from({ length: 40 }, (_, i) => ({
        id: i,
        type: 'rain' as const,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${0.4 + Math.random() * 0.4}s`,
        opacity: 0.3 + Math.random() * 0.5,
      }));
    }

    if (isSnow) {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        type: 'snow' as const,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${3 + Math.random() * 4}s`,
        opacity: 0.4 + Math.random() * 0.6,
        size: 4 + Math.random() * 6,
      }));
    }

    if (isClear && isMorningOrAfternoon) {
      return Array.from({ length: 8 }, (_, i) => ({
        id: i,
        type: 'sunray' as const,
        rotation: i * 45,
        delay: `${i * 0.3}s`,
        opacity: 0.08 + Math.random() * 0.12,
      }));
    }

    return [];
  }, [conditionCode, timeOfDay]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {particles[0]?.type === 'rain' &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 w-[1.5px] animate-[rainFall_linear_infinite]"
            style={{
              left: p.left,
              height: '16px',
              background: `linear-gradient(180deg, transparent, rgba(200,220,255,${p.opacity}))`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

      {particles[0]?.type === 'snow' &&
        particles.map((p: any) => (
          <div
            key={p.id}
            className="absolute top-0 rounded-full animate-[snowFall_linear_infinite]"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `rgba(255,255,255,${p.opacity})`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              filter: 'blur(0.5px)',
            }}
          />
        ))}

      {particles[0]?.type === 'sunray' &&
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -top-20">
          {particles.map((p: any) => (
            <div
              key={p.id}
              className="absolute origin-bottom animate-[sunPulse_4s_ease-in-out_infinite]"
              style={{
                width: '2px',
                height: '200px',
                left: '50%',
                top: '-100px',
                background: `linear-gradient(180deg, rgba(255,220,100,${p.opacity}), transparent)`,
                transform: `rotate(${p.rotation}deg)`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      }
    </div>
  );
};

export default WeatherParticles;
