import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterMember, useGetMember } from '../hooks/useQueries';
import { Zap, CheckCircle, Copy, Check, AlertCircle, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    sponsorId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sponsorIdNum, setSponsorIdNum] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    id: bigint;
    memberId: string;
  } | null>(null);

  const registerMutation = useRegisterMember();

  // Validate sponsor ID by fetching the member
  const { data: sponsorMember, isLoading: sponsorLoading } = useGetMember(sponsorIdNum);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.replace(/\s/g, '')))
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Enter a valid email address';
    if (!form.sponsorId.trim()) newErrors.sponsorId = 'Sponsor ID is required';
    else if (!/^\d+$/.test(form.sponsorId.trim()))
      newErrors.sponsorId = 'Sponsor ID must be a number';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'sponsorId') {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        setSponsorIdNum(BigInt(num));
      } else {
        setSponsorIdNum(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    // Check sponsor exists
    if (form.sponsorId && sponsorIdNum !== null && sponsorMember === null) {
      validationErrors.sponsorId = 'Sponsor ID not found. Please enter a valid member ID.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: form.name.trim(),
        contactInfo: `${form.mobile.trim()}|${form.email.trim()}`,
        sponsorId: sponsorIdNum ?? undefined,
        uplineId: undefined,
      });
      setRegistrationResult({ id: result.id, memberId: result.memberId });
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error?.message || 'Registration failed. Please try again.';
      if (msg.includes('Sponsor') || msg.includes('upline') || msg.includes('sponsor')) {
        setErrors({ sponsorId: msg });
      } else {
        setErrors({ submit: msg });
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground font-poppins mb-2">
            Registration Successful!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Welcome to RAY INFOTECH. Your account has been created.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Your Member ID</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-gold-400 font-poppins tracking-wider">
                {registrationResult.memberId}
              </span>
              <button
                onClick={() => handleCopy(registrationResult.memberId)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Numeric ID: {registrationResult.id.toString()}
            </p>
          </div>

          <Alert className="mb-6 text-left border-gold-500/30 bg-gold-500/5">
            <IndianRupee className="w-4 h-4 text-gold-400" />
            <AlertDescription className="text-sm">
              <strong className="text-gold-400">Payment Pending:</strong> Your joining fee of ₹2,750
              is pending. Please complete payment to activate your account and start earning.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-navy-900" />
        </div>
        <h1 className="text-xl font-bold text-gold-400 tracking-widest uppercase font-poppins">
          RAY INFOTECH
        </h1>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground font-poppins mb-1">Join Now</h2>
          <p className="text-muted-foreground text-sm">
            Register as a member and start your journey
          </p>
        </div>

        {/* Fee Banner */}
        <div className="flex items-center gap-3 bg-gold-500/10 border border-gold-500/30 rounded-xl p-3 mb-6">
          <IndianRupee className="w-5 h-5 text-gold-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gold-400">Joining Fee: ₹2,750</p>
            <p className="text-xs text-muted-foreground">
              Refunded after recruiting 3 direct members
            </p>
          </div>
        </div>

        {errors.submit && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={errors.mobile ? 'border-destructive' : ''}
            />
            {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="sponsorId">Sponsor ID *</Label>
            <div className="relative">
              <Input
                id="sponsorId"
                name="sponsorId"
                value={form.sponsorId}
                onChange={handleChange}
                placeholder="Enter sponsor's numeric ID"
                className={errors.sponsorId ? 'border-destructive' : ''}
              />
              {sponsorIdNum !== null && !sponsorLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {sponsorMember ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {sponsorIdNum !== null && !sponsorLoading && sponsorMember && (
              <p className="text-xs text-green-500 mt-1">
                Sponsor: {sponsorMember.name}
              </p>
            )}
            {errors.sponsorId && (
              <p className="text-xs text-destructive mt-1">{errors.sponsorId}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={registerMutation.isPending || sponsorLoading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold mt-2"
            size="lg"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              'Register Now'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already a member?{' '}
          <a href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
