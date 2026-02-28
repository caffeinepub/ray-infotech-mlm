import React, { useState } from 'react';
import { useRegisterMember, useGetMember } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

interface AddMemberFormProps {
  onSuccess?: () => void;
}

export default function AddMemberForm({ onSuccess }: AddMemberFormProps) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    sponsorId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sponsorIdNum, setSponsorIdNum] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ id: bigint; memberId: string } | null>(null);

  const registerMutation = useRegisterMember();
  const { data: sponsorMember, isLoading: sponsorLoading } = useGetMember(sponsorIdNum);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'sponsorId') {
      const num = parseInt(value, 10);
      setSponsorIdNum(!isNaN(num) && num > 0 ? BigInt(num) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (form.sponsorId && sponsorIdNum !== null && sponsorMember === null) {
      validationErrors.sponsorId = 'Sponsor ID not found';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({
        name: form.name.trim(),
        contactInfo: `${form.mobile.trim()}|${form.email.trim()}`,
        sponsorId: sponsorIdNum ?? undefined,
        uplineId: undefined,
      });
      setResult({ id: res.id, memberId: res.memberId });
    } catch (err: unknown) {
      const error = err as Error;
      setErrors({ submit: error?.message || 'Registration failed' });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setForm({ name: '', mobile: '', email: '', sponsorId: '' });
    setErrors({});
    setSponsorIdNum(null);
    setResult(null);
    if (onSuccess) onSuccess();
  };

  if (result) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Member Added!</h3>
        <p className="text-muted-foreground text-sm mb-4">
          The member has been successfully registered.
        </p>
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Assigned Member ID</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-gold-400 font-poppins tracking-wider">
              {result.memberId}
            </span>
            <button
              onClick={() => handleCopy(result.memberId)}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Add Another
          </Button>
          <Button
            onClick={() => onSuccess?.()}
            className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="add-name">Full Name *</Label>
        <Input
          id="add-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Member's full name"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="add-mobile">Mobile Number *</Label>
        <Input
          id="add-mobile"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          className={errors.mobile ? 'border-destructive' : ''}
        />
        {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
      </div>

      <div>
        <Label htmlFor="add-email">Email Address *</Label>
        <Input
          id="add-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="member@email.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="add-sponsorId">Sponsor ID (optional)</Label>
        <div className="relative">
          <Input
            id="add-sponsorId"
            name="sponsorId"
            value={form.sponsorId}
            onChange={handleChange}
            placeholder="Numeric sponsor ID"
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
          <p className="text-xs text-green-500 mt-1">Sponsor: {sponsorMember.name}</p>
        )}
        {errors.sponsorId && (
          <p className="text-xs text-destructive mt-1">{errors.sponsorId}</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
        >
          {registerMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              Adding...
            </span>
          ) : (
            'Add Member'
          )}
        </Button>
      </div>
    </form>
  );
}
