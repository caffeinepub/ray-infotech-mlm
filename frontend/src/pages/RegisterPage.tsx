import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterMember } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, IndianRupee, CheckCircle, Copy, LogIn } from 'lucide-react';

export default function RegisterPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const registerMember = useRegisterMember();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [newMemberId, setNewMemberId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Please enter a valid full name (at least 2 characters)');
      return false;
    }
    if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (sponsorId.trim() && isNaN(Number(sponsorId.trim()))) {
      toast.error('Sponsor ID must be a valid number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const contactInfo = `Mobile: ${mobile.trim()} | Email: ${email.trim()}`;
    const parsedSponsorId = sponsorId.trim() ? BigInt(sponsorId.trim()) : undefined;

    try {
      const memberId = await registerMember.mutateAsync({
        name: name.trim(),
        contactInfo,
        sponsorId: parsedSponsorId,
      });
      setNewMemberId(memberId);
      toast.success('Member registered successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error?.message || 'Registration failed';
      if (msg.includes('already has 3 direct downlines')) {
        toast.error('Sponsor already has 3 direct downlines. Please use a different sponsor ID.');
      } else if (msg.includes('Sponsor (upline) must be an existing member')) {
        toast.error('Sponsor ID not found. Please check and try again.');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleReset = () => {
    setName('');
    setMobile('');
    setEmail('');
    setSponsorId('');
    setNewMemberId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-gold-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Please login to register a new member.</p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
            >
              {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (newMemberId !== null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="bg-card border-border max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-6">The member has been registered in the Ray Infotech matrix.</p>

            <div className="bg-muted rounded-xl p-4 mb-6 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Member ID / Referral Code</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-gold-400">{newMemberId.toString()}</span>
                  <button
                    onClick={() => handleCopy(newMemberId.toString())}
                    className="text-muted-foreground hover:text-gold-400 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="text-xs text-muted-foreground mb-1">Joining Fee</div>
                <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-sm px-3 py-1">
                  ₹2,750 Paid
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-border"
              >
                Register Another
              </Button>
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
              >
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Fee Banner */}
      <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
          <IndianRupee className="text-gold-400" size={22} />
        </div>
        <div>
          <div className="text-gold-400 font-bold text-lg">Joining Fee: ₹2,750</div>
          <div className="text-muted-foreground text-sm">
            Fee is refunded when the member's first 3 direct downlines join the matrix.
          </div>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/15 flex items-center justify-center">
              <UserPlus className="text-gold-400" size={20} />
            </div>
            <div>
              <CardTitle className="text-foreground">Register New Member</CardTitle>
              <CardDescription>Fill in the details to register a new member in the matrix</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="bg-background border-border focus:border-gold-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-foreground font-medium">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="bg-background border-border focus:border-gold-500"
                required
              />
              <p className="text-xs text-muted-foreground">Enter a valid 10-digit Indian mobile number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-background border-border focus:border-gold-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorId" className="text-foreground font-medium">
                Sponsor Member ID <span className="text-muted-foreground text-xs font-normal">(optional for first member)</span>
              </Label>
              <Input
                id="sponsorId"
                value={sponsorId}
                onChange={(e) => setSponsorId(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter sponsor's member ID"
                className="bg-background border-border focus:border-gold-500"
              />
              <p className="text-xs text-muted-foreground">Leave blank if this is the first/root member</p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={registerMember.isPending}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-base py-3 border-0"
                size="lg"
              >
                {registerMember.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-navy-900 border-t-transparent rounded-full" />
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Register Member — Pay ₹2,750
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
