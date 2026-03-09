import React, { useState } from 'react';
import { User, LogOut, LogIn } from 'lucide-react';
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
    } catch (e) {
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

  return (
    <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2">
      {/* App Name - Left */}
      <div className="flex items-center gap-1.5">
        <span className="text-white font-bold text-lg tracking-tight">Havaman</span>
        <span className="text-white/60 font-light text-lg">.</span>
        <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent font-bold text-lg">Ai</span>
      </div>

      {/* Profile - Right */}
      {loading ? (
        <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
      ) : user ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white/70" />
              </div>
            )}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl overflow-hidden bg-white/[0.12] backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-white/50 text-xs truncate">{email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-white/80 hover:bg-white/10 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-2 h-9 px-3 rounded-full bg-white/[0.12] backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white text-sm"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-xs font-medium">Sign In</span>
        </button>
      )}
    </div>
  );
};

export default AppHeader;
