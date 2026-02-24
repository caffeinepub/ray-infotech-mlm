import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, UserPlus, Shield, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    ...(isAuthenticated ? [{ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> }] : []),
    ...(isAuthenticated ? [{ label: 'Register Member', path: '/register', icon: <UserPlus size={16} /> }] : []),
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: <Shield size={16} /> }] : []),
  ];

  return (
    <header className="bg-navy-900 border-b border-gold-500/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gold-500/20 border border-gold-500/40">
              <Zap size={18} className="text-gold-400" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-gold-400 font-bold text-lg tracking-wide">
                Ray Infotech
              </span>
              <span className="text-navy-300 text-[10px] tracking-widest uppercase">
                Matrix MLM
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate({ to: link.path })}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === link.path
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-navy-100 hover:bg-navy-700 hover:text-gold-300'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className={isAuthenticated
                ? 'border-gold-500/40 text-gold-300 hover:bg-gold-500/10 hover:text-gold-200'
                : 'bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0'
              }
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Logging in...
                </span>
              ) : isAuthenticated ? (
                <span className="flex items-center gap-2"><LogOut size={16} /> Logout</span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={16} /> Login</span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-navy-100 hover:text-gold-400 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gold-500/20 mt-2 pt-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { navigate({ to: link.path }); setMobileOpen(false); }}
                className={`flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === link.path
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-navy-100 hover:bg-navy-700 hover:text-gold-300'
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
            <div className="pt-2">
              <Button
                onClick={() => { handleAuth(); setMobileOpen(false); }}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className={`w-full ${isAuthenticated
                  ? 'border-gold-500/40 text-gold-300 hover:bg-gold-500/10'
                  : 'bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0'
                }`}
              >
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
