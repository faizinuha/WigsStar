import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .order('display_name', { ascending: true });

      if (error) throw error;

      return data as UserProfile[];
    },
    // Cache untuk 10 menit karena data profiles tidak sering berubah
    // staleTime: 10 * 60 * 1000,
    // gcTime: 30 * 60 * 1000,
  });
}

export function useSearchProfiles(searchQuery: string) {
  return useQuery({
    queryKey: ['searchProfiles', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const query = searchQuery.toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      return data as UserProfile[];
    },
    enabled: searchQuery.trim().length > 0,
  });
}
