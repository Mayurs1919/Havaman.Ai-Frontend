import React, { useEffect, useState } from 'react';
import { QrCode, Cloud, Thermometer, Wind, Droplets, Sun, CloudRain, Zap, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lovable } from '@/integrations/lovable';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const APP_URL = 'https://id-preview--b28ae43e-61e9-488b-9b8b-111129eaf0f5.lovable.app';

const features = [
  { icon: Thermometer, label: 'Real-time Forecasts', desc: 'Accurate weather predictions powered by AI' },
  { icon: Wind, label: 'Wind & Air Quality', desc: 'Detailed atmospheric conditions at a glance' },
  { icon: Droplets, label: 'Precipitation Alerts', desc: 'Smart rain & storm notifications' },
  { icon: Eye, label: 'AI Weather Insights', desc: 'Personalized weather intelligence' },
];

const floatingIcons = [
  { Icon: Sun, x: '10%', y: '15%', size: 28, delay: 0, duration: 6 },
  { Icon: CloudRain, x: '85%', y: '20%', size: 24, delay: 1, duration: 7 },
  { Icon: Wind, x: '75%', y: '70%', size: 22, delay: 2, duration: 5 },
  { Icon: Droplets, x: '15%', y: '75%', size: 20, delay: 0.5, duration: 8 },
  { Icon: Cloud, x: '50%', y: '8%', size: 30, delay: 1.5, duration: 6 },
  { Icon: Zap, x: '90%', y: '50%', size: 18, delay: 3, duration: 7 },
];

const DesktopGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [bypass, setBypass] = useState(false);
  const [activeTab, setActiveTab] = useState<'google' | 'qr'>('google');
  const [signingIn, setSigningIn] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isWide = window.innerWidth >= 768;
      setIsDesktop(isWide && !isMobileUA);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (user) setBypass(true);
  }, [user]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: 'Sign in failed', description: String(result.error), variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Sign in failed', variant: 'destructive' });
    } finally {
      setSigningIn(false);
    }
  };

  if (!isDesktop || bypass) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0d1942] to-[#0a1628] relative overflow-hidden">
      {/* Floating weather icons */}
      {floatingIcons.map(({ Icon, x, y, size, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/[0.06] pointer-events-none"
          style={{ left: x, top: y }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left: Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center flex-1 px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-white font-bold text-2xl tracking-tight">Havaman</span>
                <span className="text-white/40 font-light text-2xl">.</span>
                <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-2xl">Ai</span>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Your AI-Powered<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                Weather Assistant
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-md mb-12 leading-relaxed">
              Experience intelligent weather forecasting with real-time AI insights, 
              personalized alerts, and beautiful visualizations.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="group p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <f.icon className="w-4.5 h-4.5 text-blue-400" size={18} />
                  </div>
                  <p className="text-white/90 text-sm font-semibold mb-1">{f.label}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Auth Panel */}
        <div className="flex items-center justify-center flex-1 lg:flex-none lg:w-[520px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-white font-bold text-xl">Havaman</span>
                  <span className="text-white/40 font-light text-xl">.</span>
                  <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-xl">Ai</span>
                </div>
              </div>
              <p className="text-white/40 text-sm">AI Weather Intelligence</p>
            </div>

            {/* Card */}
            <div className="rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.06]">
                {(['google', 'qr'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                      activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {tab === 'google' ? 'Sign in with Google' : 'QR Code'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'google' ? (
                    <motion.div
                      key="google"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                        <p className="text-white/40 text-sm">Sign in to access your personalized weather dashboard</p>
                      </div>

                      <button
                        onClick={handleGoogleSignIn}
                        disabled={signingIn}
                        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white hover:bg-gray-100 transition-all text-gray-800 font-medium text-sm shadow-lg shadow-black/10 disabled:opacity-60"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {signingIn ? 'Signing in…' : 'Continue with Google'}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-white/30 text-xs">or scan QR on mobile</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>

                      <p className="text-center text-white/30 text-xs leading-relaxed">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-white">Open on Mobile</h2>
                        <p className="text-white/40 text-sm">Scan with your phone camera for the best experience</p>
                      </div>

                      <div className="flex justify-center">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="bg-white rounded-2xl p-3 shadow-2xl shadow-blue-500/10"
                        >
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APP_URL)}&color=0d1942&bgcolor=ffffff&qzone=2`}
                            alt="QR Code to open Havaman.Ai on mobile"
                            className="w-44 h-44"
                          />
                        </motion.div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Works with iOS & Android cameras</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bypass link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => setBypass(true)}
              className="w-full mt-6 text-white/30 hover:text-white/50 text-xs transition-colors text-center"
            >
              Preview on desktop anyway →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DesktopGate;
