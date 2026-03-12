import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Clock, ChevronUp, ChevronDown, Phone, X, Zap } from 'lucide-react';

export interface WeatherAlert {
  type: 'flash_flood' | 'storm' | 'high_heat' | 'tornado' | 'blizzard' | 'hurricane';
  severity: 'warning' | 'extreme';
  title: string;
  description: string;
  expiresAt: Date;
  survivalSteps: string[];
}

interface SevereWeatherAlertProps {
  alert: WeatherAlert | null;
  onDismiss: () => void;
  language: string;
}

const ALERT_CONFIG: Record<string, { emoji: string; color: string; bgGlow: string }> = {
  flash_flood: { emoji: '🌊', color: 'hsl(0 72% 51%)', bgGlow: 'rgba(230,57,70,0.15)' },
  storm: { emoji: '⛈️', color: 'hsl(0 72% 51%)', bgGlow: 'rgba(230,57,70,0.15)' },
  high_heat: { emoji: '🔥', color: 'hsl(25 95% 53%)', bgGlow: 'rgba(249,115,22,0.15)' },
  tornado: { emoji: '🌪️', color: 'hsl(0 72% 51%)', bgGlow: 'rgba(230,57,70,0.2)' },
  blizzard: { emoji: '🌨️', color: 'hsl(200 80% 60%)', bgGlow: 'rgba(56,189,248,0.15)' },
  hurricane: { emoji: '🌀', color: 'hsl(0 72% 51%)', bgGlow: 'rgba(230,57,70,0.2)' },
};

const getTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

const SevereWeatherAlert: React.FC<SevereWeatherAlertProps> = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!alert) return;
    const update = () => setTimeRemaining(getTimeRemaining(alert.expiresAt));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [alert]);

  // Pulsing animation cycle
  useEffect(() => {
    if (!alert) return;
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [alert]);

  if (!alert) return null;

  const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.storm;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="px-4 pb-4"
      >
        {/* Main Alert Card */}
        <div
          className="severe-alert-card rounded-2xl overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, rgba(230,57,70,0.12) 0%, rgba(15,23,42,0.95) 40%, rgba(15,23,42,0.98) 100%)`,
            boxShadow: `0 0 ${20 + pulseIntensity * 10}px rgba(230,57,70,${0.2 + pulseIntensity * 0.1}), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Pulsing border */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-1000"
            style={{
              border: `2px solid rgba(230,57,70,${0.4 + pulseIntensity * 0.2})`,
              boxShadow: `inset 0 0 ${8 + pulseIntensity * 4}px rgba(230,57,70,${0.1 + pulseIntensity * 0.05})`,
            }}
          />

          {/* Crack/fracture lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
              <path d="M0,50 L80,45 L120,80 L200,75 L250,90 L400,85" stroke="rgba(230,57,70,0.6)" strokeWidth="0.5" fill="none" />
              <path d="M0,150 L50,145 L100,160 L180,155 L300,170 L400,165" stroke="rgba(230,57,70,0.4)" strokeWidth="0.3" fill="none" />
            </svg>
          </div>

          {/* Header */}
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(230,57,70,0.25)', border: '1px solid rgba(230,57,70,0.4)' }}
                >
                  <AlertTriangle className="w-5 h-5" style={{ color: '#E63946' }} />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E63946', fontFamily: 'var(--font-heading)' }}>
                      {alert.severity === 'extreme' ? '⚠️ EXTREME' : '⚠️ WARNING'}
                    </span>
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#E63946' }}
                    />
                  </div>
                  <h3 className="text-white font-bold text-base mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                    {config.emoji} {alert.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-3" style={{ fontFamily: 'var(--font-body)' }}>
              {alert.description}
            </p>

            {/* All Clear Timer */}
            <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2.5 border border-white/[0.06] mb-3">
              <Clock className="w-4 h-4 text-white/40" />
              <div className="flex-1">
                <p className="text-white/40 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>Expected All Clear</p>
                <p className="text-white/90 text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{timeRemaining}</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Shield className="w-4 h-4 text-emerald-400/60" />
              </motion.div>
            </div>

            {/* Expandable Wisdom Card */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: '#E63946' }} />
                <span className="text-white/80 text-sm font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                  Emergency Survival Steps
                </span>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    {alert.survivalSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.05]"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                          style={{ background: 'rgba(230,57,70,0.2)', color: '#E63946', fontFamily: 'var(--font-heading)' }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                          {step}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Emergency Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', damping: 12 }}
          className="flex justify-center mt-3"
        >
          <motion.a
            href="tel:112"
            animate={{ boxShadow: [
              '0 0 0 0 rgba(230,57,70,0.4)',
              '0 0 0 12px rgba(230,57,70,0)',
            ]}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #E63946, #c1121f)',
              color: 'white',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <Phone className="w-4 h-4" />
            Emergency Services
          </motion.a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SevereWeatherAlert;
