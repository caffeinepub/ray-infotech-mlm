import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User } from 'lucide-react';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), contactInfo: contactInfo.trim() });
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="bg-navy-800 border-gold-500/30 text-navy-50 sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
              <User className="text-gold-400" size={20} />
            </div>
            <DialogTitle className="text-gold-400 text-xl">Welcome to Ray Infotech</DialogTitle>
          </div>
          <DialogDescription className="text-navy-300">
            Please set up your profile to get started with the MLM platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-navy-200">Full Name *</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-navy-700 border-navy-600 text-navy-50 placeholder:text-navy-400 focus:border-gold-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-contact" className="text-navy-200">Contact Info</Label>
            <Input
              id="profile-contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone or email"
              className="bg-navy-700 border-navy-600 text-navy-50 placeholder:text-navy-400 focus:border-gold-500"
            />
          </div>
          <Button
            type="submit"
            disabled={saveProfile.isPending}
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold border-0"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-navy-900 border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : 'Save Profile & Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
