import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id) // ✅ ganti ke user_id
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data && data.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default PrivateRoute;
