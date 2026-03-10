import React, { useState } from 'react';
import { User, LogOut, LogIn, MapPin, Clock, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable';
import { toast } from '@/hooks/use-toast';

const AppHeader = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth('google');
      if (result.error) {
        toast({ title: 'Sign in failed', description: String(result.error), variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Sign in failed', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    setShowMenu(false);
    await signOut();
    toast({ title: 'Signed out' });
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || 'User';
  const email = profile?.email || user?.email || '';

  const recentSearches = [
    { city: 'Mumbai', time: '2 min ago' },
    { city: 'London', time: '1 hr ago' },
    { city: 'Tokyo', time: 'Yesterday' },
  ];

  const savedLocations = ['New York', 'Paris', 'Dubai'];

  return (
    <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2">
      {/* App Name */}
      <div className="flex items-center gap-1.5">
        <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Havaman</span>
        <span className="text-white/60 font-light text-lg">.</span>
        <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Ai</span>
      </div>

      {/* Profile */}
      {loading ? (
        <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
      ) : user ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all shadow-lg shadow-black/10"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white/70" />
              </div>
            )}
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-13 z-50 w-72 rounded-2xl overflow-hidden bg-black/70 backdrop-blur-2xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                >
                  {/* User info */}
                  <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-white/70" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-heading)' }}>{displayName}</p>
                      <p className="text-white/40 text-xs truncate">{email}</p>
                    </div>
                  </div>

                  {/* Recent searches */}
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    {recentSearches.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-white/30" />
                          <span className="text-white/70 text-xs">{s.city}</span>
                        </div>
                        <span className="text-white/30 text-[10px]">{s.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Saved locations */}
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3" /> Saved
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {savedLocations.map((loc, i) => (
                        <span key={i} className="text-[10px] text-white/60 bg-white/[0.08] rounded-full px-2.5 py-1 border border-white/[0.08]">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sign out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-300/80 hover:bg-white/[0.06] transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-2 h-9 px-4 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white text-sm shadow-lg shadow-black/10"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Sign In</span>
        </button>
      )}
    </div>
  );
};

export default AppHeader;
