import React, { useEffect, useState, useCallback } from 'react';
import { Cloud, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import GateWeatherAnimation from './GateWeatherAnimation';
import LiveWeatherWidget from './LiveWeatherWidget';

const features = [
  { icon: '🌡️', label: 'Real-time Forecasts', desc: 'Accurate weather predictions powered by AI' },
  { icon: '💨', label: 'Wind & Air Quality', desc: 'Detailed atmospheric conditions at a glance' },
  { icon: '🌧️', label: 'Precipitation Alerts', desc: 'Smart rain & storm notifications' },
  { icon: '🧠', label: 'AI Weather Insights', desc: 'Personalized weather intelligence' },
];

const DesktopGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [bypass, setBypass] = useState(false);
  const [activeTab, setActiveTab] = useState<'google' | 'qr'>('google');
  const [signingIn, setSigningIn] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
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

  const createQrSession = useCallback(async () => {
    setQrLoading(true);
    try {
      const { data, error } = await supabase
        .from('qr_login_sessions')
        .insert({})
        .select('token')
        .single();
      if (error || !data) {
        toast({ title: 'Failed to generate QR code', variant: 'destructive' });
        return;
      }
      setQrToken(data.token);
    } catch {
      toast({ title: 'Failed to generate QR code', variant: 'destructive' });
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'qr' && !qrToken) createQrSession();
  }, [activeTab, qrToken, createQrSession]);

  useEffect(() => {
    if (!qrToken) return;
    const channel = supabase
      .channel(`qr-${qrToken}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'qr_login_sessions',
        filter: `token=eq.${qrToken}`,
      }, async (payload: any) => {
        if (payload.new.status === 'authenticated' && payload.new.user_id) {
          toast({ title: 'Signed in via mobile!' });
          setBypass(true);
        }
      })
      .subscribe();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('qr_login_sessions')
        .select('status, user_id')
        .eq('token', qrToken)
        .single();
      if (data?.status === 'authenticated') {
        toast({ title: 'Signed in via mobile!' });
        setBypass(true);
        clearInterval(interval);
      }
    }, 3000);

    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [qrToken]);

  useEffect(() => {
    if (!qrToken) return;
    const timer = setTimeout(() => {
      setQrToken(null);
      if (activeTab === 'qr') createQrSession();
    }, 270000);
    return () => clearTimeout(timer);
  }, [qrToken, activeTab, createQrSession]);

  const qrUrl = qrToken ? `${window.location.origin}/qr-auth?token=${qrToken}` : '';

  if (!isDesktop || bypass) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b1e] via-[#0c1538] to-[#081225] relative overflow-hidden">
      <GateWeatherAnimation />

      {/* Radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left: Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center flex-1 px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Havaman</span>
                <span className="text-white/40 font-light text-2xl">.</span>
                <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Ai</span>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Your AI-Powered<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                Weather Assistant
              </span>
            </h1>
            <p className="text-white/45 text-lg max-w-md mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Experience intelligent weather forecasting with real-time AI insights,
              personalized alerts, and beautiful visualizations.
            </p>

            <div className="grid grid-cols-2 gap-3.5 max-w-lg mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="group p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="text-2xl mb-2.5">{f.icon}</div>
                  <p className="text-white/90 text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{f.label}</p>
                  <p className="text-white/35 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Live weather widget */}
            <LiveWeatherWidget />
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
                  <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-heading)' }}>Havaman</span>
                  <span className="text-white/40 font-light text-xl">.</span>
                  <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-xl" style={{ fontFamily: 'var(--font-heading)' }}>Ai</span>
                </div>
              </div>
              <p className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-body)' }}>AI Weather Intelligence</p>
            </div>

            {/* Auth card */}
            <div className="rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.06]">
                {(['google', 'qr'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                      activeTab === tab ? 'text-white' : 'text-white/35 hover:text-white/55'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {tab === 'google' ? 'Sign in with Google' : 'QR Code Login'}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3 border border-violet-400/10">
                          <Sparkles className="w-7 h-7 text-violet-300" />
                        </div>
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Welcome Back</h2>
                        <p className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-body)' }}>Sign in to access your personalized weather dashboard</p>
                      </div>

                      <button
                        onClick={handleGoogleSignIn}
                        disabled={signingIn}
                        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white hover:bg-gray-50 transition-all text-gray-800 font-medium text-sm shadow-lg shadow-black/10 disabled:opacity-60"
                        style={{ fontFamily: 'var(--font-heading)' }}
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
                        <span className="text-white/25 text-xs">or use QR code</span>
                        <div className="flex-1 h-px bg-white/[0.08]" />
                      </div>

                      <p className="text-center text-white/25 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
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
                        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Scan to Sign In</h2>
                        <p className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-body)' }}>Scan with your phone to authenticate this session</p>
                      </div>

                      <div className="flex justify-center">
                        {qrLoading ? (
                          <div className="w-44 h-44 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                          </div>
                        ) : qrUrl ? (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white rounded-2xl p-3 shadow-2xl shadow-blue-500/10"
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&color=0d1942&bgcolor=ffffff&qzone=2`}
                              alt="QR Code to sign in via mobile"
                              className="w-44 h-44"
                            />
                          </motion.div>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Waiting for mobile authentication...</span>
                        </div>
                        <p className="text-center text-white/25 text-[11px]">
                          QR code refreshes automatically every 5 minutes
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => setBypass(true)}
              className="w-full mt-6 text-white/25 hover:text-white/45 text-xs transition-colors text-center"
              style={{ fontFamily: 'var(--font-body)' }}
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
