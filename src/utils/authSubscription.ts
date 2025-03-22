
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";

export const setupAuthSubscription = (
  setUser: (user: User | null) => void
) => {
  // Set up auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User signed in, get their profile
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setUser({
            id: data.id,
            email: data.email,
            organization_name: data.organization_name
          });
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUser(null);
      }
    }
  );

  return subscription;
};
