import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

export const ProfileUpdater = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    if (user && profile && !profile.display_name) {
      const provider = user.app_metadata.provider;
      const rawMetaData = user.raw_user_meta_data as any;

      if (provider === 'google' && rawMetaData?.full_name) {
        updateProfile({ display_name: rawMetaData.full_name });
      } else if (provider === 'github' && rawMetaData?.name) {
        const updates: { display_name: string, username?: string } = { display_name: rawMetaData.name };
        // Also update username if it's not set, using the github username
        if (!profile.username && rawMetaData.user_name) {
          updates.username = rawMetaData.user_name;
        }
        updateProfile(updates);
      }
    }
  }, [user, profile, updateProfile]);

  return null; // This component doesn't render anything
};
