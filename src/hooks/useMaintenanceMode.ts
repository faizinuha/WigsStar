import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceMode {
  id: string;
  page_path: string;
  is_active: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'blocked';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useMaintenanceMode(pagePath?: string) {
  return useQuery({
    queryKey: ['maintenance-mode', pagePath],
    queryFn: async () => {
      const query = supabase.from('maintenance_mode').select('*');
      
      if (pagePath) {
        query.eq('page_path', pagePath).eq('is_active', true).maybeSingle();
      } else {
        query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaintenanceMode | MaintenanceMode[] | null;
    },
  });
}

export function useSetMaintenanceMode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      page_path: string;
      is_active: boolean;
      title: string;
      message: string;
      type: 'info' | 'warning' | 'maintenance' | 'blocked';
    }) => {
      const { data, error } = await supabase
        .from('maintenance_mode')
        .upsert(params, { onConflict: 'page_path' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      toast({
        title: 'Maintenance Mode Updated',
        description: 'The maintenance status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update maintenance mode: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
}
