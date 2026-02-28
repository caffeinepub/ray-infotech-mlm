import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, LayoutDashboard, UserPlus, Shield, Zap } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate({ to: '/login' });
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/40">
              <Zap size={20} className="text-gold-400" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg font-bold text-gold-400 tracking-widest" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.12em' }}>
                RAY INFOTECH
              </span>
              <span className="text-navy-400 text-[9px] tracking-[0.25em] uppercase mt-0.5">
                Matrix MLM Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate({ to: '/' })}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-gold-400 bg-navy-700'
                  : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
              }`}
            >
              Home
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate({ to: '/dashboard' })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate({ to: '/register' })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/register')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Register Member
                </button>
                <button
                  onClick={() => navigate({ to: '/admin' })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              </>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-2 border-navy-500 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLoginClick}
                disabled={isLoggingIn}
                className="ml-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
              >
                <LogIn className="h-4 w-4 mr-1.5" />
                Member Login
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-navy-200 hover:text-gold-400 hover:bg-navy-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-700 py-3 space-y-1">
            <button
              onClick={() => { navigate({ to: '/' }); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-gold-400 bg-navy-700'
                  : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
              }`}
            >
              Home
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate({ to: '/dashboard' }); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => { navigate({ to: '/register' }); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/register')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Register Member
                </button>
                <button
                  onClick={() => { navigate({ to: '/admin' }); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-gold-400 bg-navy-700'
                      : 'text-navy-200 hover:text-gold-400 hover:bg-navy-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              </>
            )}

            <div className="pt-2 px-4">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-navy-500 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLoginClick}
                  disabled={isLoggingIn}
                  className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Member Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
