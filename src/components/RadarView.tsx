import React from 'react';

interface RadarViewProps {
  conditionCode: string;
  location: string;
}

const RadarView = ({ conditionCode, location }: RadarViewProps) => {
  const isRainy = ['Rain', 'Drizzle', 'Thunderstorm'].includes(conditionCode);
  const isSnowy = conditionCode === 'Snow';
  const isClear = conditionCode === 'Clear';
  
  return (
    <div className="px-4 pb-4">
      <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">
        Live Radar
      </h3>
      <div className="glass-card rounded-3xl overflow-hidden aspect-square relative flex items-center justify-center">
        <div className="absolute inset-0 radar-grid" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          {[60, 45, 30, 15].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${size}%`,
                height: `${size}%`,
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="radar-sweep" />
        </div>
        
        {isRainy && (
          <>
            <div className="absolute w-16 h-16 rounded-full bg-blue-400/30 blur-xl top-[30%] left-[40%] animate-pulse" style={{ animationDuration: '2s' }} />
            <div className="absolute w-24 h-12 rounded-full bg-blue-500/25 blur-xl top-[45%] left-[25%] animate-pulse" style={{ animationDuration: '2.5s' }} />
            <div className="absolute w-12 h-12 rounded-full bg-indigo-400/30 blur-xl top-[35%] right-[25%] animate-pulse" style={{ animationDuration: '3s' }} />
          </>
        )}
        {isSnowy && (
          <>
            <div className="absolute w-20 h-16 rounded-full bg-white/20 blur-xl top-[35%] left-[35%] animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute w-16 h-12 rounded-full bg-cyan-200/25 blur-xl bottom-[30%] right-[30%] animate-pulse" style={{ animationDuration: '2.5s' }} />
          </>
        )}
        {isClear && (
          <div className="absolute w-16 h-16 rounded-full bg-yellow-400/20 blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
        )}
        
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse" />
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-0.5">
            <p className="text-white text-xs font-medium">{location}</p>
          </div>
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-green-400/30 radar-ring"
              style={{
                animationDelay: `${i * 1}s`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          {isRainy && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400/80" />
              <span className="text-white/60 text-xs">Precipitation</span>
            </div>
          )}
          {isSnowy && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-200/80" />
              <span className="text-white/60 text-xs">Snow</span>
            </div>
          )}
          {isClear && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
              <span className="text-white/60 text-xs">Clear skies</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadarView;
