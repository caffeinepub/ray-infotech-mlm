import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Gift, Shield, ChevronRight, Star, Zap } from 'lucide-react';

const commissionLevels = [
  { level: 1, label: 'Level 1', desc: 'Fee Refund', amount: '₹2,750', color: 'text-gold-400', bg: 'bg-gold-500/10' },
  { level: 2, label: 'Level 2', desc: '9% Commission', amount: '₹247.50', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 3, label: 'Level 3', desc: '8% Commission', amount: '₹220', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 4, label: 'Level 4', desc: '7% Commission', amount: '₹192.50', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 5, label: 'Level 5', desc: '6% Commission', amount: '₹165', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 6, label: 'Level 6', desc: '5% Commission', amount: '₹137.50', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 7, label: 'Level 7', desc: '4% Commission', amount: '₹110', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 8, label: 'Level 8', desc: '3% Commission', amount: '₹82.50', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 9, label: 'Level 9', desc: '2% Commission', amount: '₹55', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { level: 10, label: 'Level 10', desc: '1% Commission', amount: '₹27.50', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 opacity-90" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* Text-based logo mark */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/20 border-2 border-gold-500/50 shadow-lg">
                    <Zap size={28} className="text-gold-400" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-4xl font-bold text-gold-400 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Ray Infotech
                    </span>
                    <span className="text-navy-300 text-xs tracking-[0.3em] uppercase mt-1">
                      Matrix MLM Platform
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className="mb-4 bg-gold-500/20 text-gold-400 border-gold-500/30 text-sm px-4 py-1">
              <Star size={12} className="mr-1" /> Matrix MLM Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Build Your Network,{' '}
              <span className="text-gold-400">Grow Your Income</span>
            </h1>
            <p className="text-navy-200 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Join Ray Infotech's 3×10 Matrix MLM with just ₹2,750. Get your joining fee refunded on your first success, then earn commissions from 9% down to 1% across 10 levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate({ to: '/register' })}
                    size="lg"
                    className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-base px-8 border-0"
                  >
                    Register a Member <ChevronRight size={18} className="ml-1" />
                  </Button>
                  <Button
                    onClick={() => navigate({ to: '/dashboard' })}
                    size="lg"
                    variant="outline"
                    className="border-gold-500/40 text-gold-300 hover:bg-gold-500/10 text-base px-8"
                  >
                    View Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-base px-10 border-0"
                >
                  {isLoggingIn ? 'Logging in...' : 'Get Started — Login'}
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-navy-800 border-y border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Joining Fee', value: '₹2,750', icon: <Gift size={20} /> },
              { label: 'Matrix Width', value: '3 Wide', icon: <Users size={20} /> },
              { label: 'Max Levels', value: '10 Levels', icon: <TrendingUp size={20} /> },
              { label: 'Max Commission', value: '9%', icon: <Shield size={20} /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <div className="text-gold-400 mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-navy-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Commission Structure</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Earn commissions across 10 levels. Your joining fee is refunded when your first 3 direct downlines join.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {commissionLevels.map((lvl) => (
              <Card key={lvl.level} className="bg-card border-border hover:border-gold-500/40 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${lvl.bg} mb-2`}>
                    <span className={`text-xs font-bold ${lvl.color}`}>{lvl.level}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{lvl.label}</div>
                  <div className={`text-sm font-semibold ${lvl.color}`}>{lvl.desc}</div>
                  <div className="text-base font-bold text-foreground mt-1">{lvl.amount}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Pay Joining Fee',
                desc: 'Register with a one-time joining fee of ₹2,750 and get your unique member ID.',
                icon: <Gift size={28} />,
              },
              {
                step: '02',
                title: 'Recruit 3 Members',
                desc: 'Refer 3 people to join under you. Once all 3 slots are filled, your ₹2,750 is refunded.',
                icon: <Users size={28} />,
              },
              {
                step: '03',
                title: 'Earn Commissions',
                desc: 'Earn 9% to 1% commissions as your downline grows across 10 levels of the matrix.',
                icon: <TrendingUp size={28} />,
              },
            ].map((item) => (
              <Card key={item.step} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center text-gold-400">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gold-500 mb-1">STEP {item.step}</div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 bg-navy-900">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
            <p className="text-navy-200 mb-8">Join thousands of members building their financial future with Ray Infotech.</p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-base px-10 border-0"
            >
              {isLoggingIn ? 'Logging in...' : 'Login to Get Started'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
