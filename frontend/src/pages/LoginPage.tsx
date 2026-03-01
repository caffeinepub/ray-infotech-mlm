import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { Zap, Shield, Users, TrendingUp, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();

  // Redirect after login based on role — only once identity is fully initialized
  useEffect(() => {
    if (isInitializing || !isAuthenticated || roleLoading) return;

    if (userRole === 'admin') {
      navigate({ to: '/admin' });
    } else if (userRole === 'user') {
      navigate({ to: '/dashboard' });
    }
    // guest role stays on login page (will be prompted to register)
  }, [isAuthenticated, userRole, roleLoading, isInitializing, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        // already logged in, role redirect will handle it
      } else {
        console.error('Login error:', err);
      }
    }
  };

  // While identity is being restored, show a loading state instead of the login form
  // to prevent the login UI from flashing for already-authenticated users
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
          <p className="text-muted-foreground text-sm">Restoring your session…</p>
        </div>
      </div>
    );
  }

  // If already authenticated and role is loading, show a loading state
  if (isAuthenticated && roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold-400" />
          <p className="text-muted-foreground text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center shadow-gold">
            <Zap className="w-7 h-7 text-navy-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gold-400 tracking-widest uppercase font-poppins">
              RAY INFOTECH
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">
              Member Portal
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground font-poppins mb-2">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your member dashboard and track your earnings
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-muted-foreground text-center">Track Earnings</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Users className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-muted-foreground text-center">View Downline</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Shield className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-muted-foreground text-center">Secure Login</span>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold py-3 rounded-xl text-base"
            size="lg"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Not a member yet?{' '}
              <a
                href="/register"
                className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
              >
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 max-w-md text-center">
          <p className="text-xs text-muted-foreground">
            RAY INFOTECH uses secure Internet Identity authentication.
            Your data is protected and stored on the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
