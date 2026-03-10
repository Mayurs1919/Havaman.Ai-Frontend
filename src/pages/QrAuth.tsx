import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Cloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const QrAuth: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'idle' | 'signing-in' | 'linking' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setStatus('signing-in');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/qr-auth?token=${token}`,
      });
      if (result.error) {
        setError(String(result.error));
        setStatus('error');
      }
    } catch {
      setError('Sign in failed');
      setStatus('error');
    }
  };

  // After OAuth redirect, link session
  useEffect(() => {
    if (!token) return;

    const linkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setStatus('linking');
      const { error: updateError } = await supabase
        .from('qr_login_sessions')
        .update({
          status: 'authenticated',
          user_id: session.user.id,
        })
        .eq('token', token)
        .eq('status', 'pending');

      if (updateError) {
        setError('Session expired or invalid');
        setStatus('error');
      } else {
        setStatus('done');
      }
    };

    linkSession();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0d1942] to-[#0a1628] flex items-center justify-center p-6">
        <div className="text-center text-white/60">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>Invalid QR code link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0d1942] to-[#0a1628] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-white font-bold text-xl">Havaman</span>
            <span className="text-white/40 font-light text-xl">.</span>
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-xl">Ai</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] p-8 text-center">
          {status === 'done' ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Signed In!</h2>
              <p className="text-white/50 text-sm">You can now close this page. Your desktop session is ready.</p>
            </motion.div>
          ) : status === 'error' ? (
            <div className="space-y-4">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              <p className="text-white/50 text-sm">{error}</p>
              <button onClick={handleGoogleSignIn} className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                Try Again
              </button>
            </div>
          ) : status === 'linking' ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
              <p className="text-white/60 text-sm">Linking your session...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Sign in on Desktop</h2>
                <p className="text-white/40 text-sm">Sign in here to authenticate your desktop session</p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={status === 'signing-in'}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white hover:bg-gray-100 transition-all text-gray-800 font-medium text-sm shadow-lg disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {status === 'signing-in' ? 'Signing in…' : 'Continue with Google'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QrAuth;
