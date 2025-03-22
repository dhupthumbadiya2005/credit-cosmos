
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/supabase";
import { toast } from "@/lib/toast";

export const setupAuthSubscription = (
  setUser: (user: User | null) => void
) => {
  // Set up auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("Auth state change:", event, session ? "session exists" : "no session");
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // User signed in, get their profile
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            
            // If user profile doesn't exist, create it
            if (error.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('users')
                .insert([
                  {
                    id: session.user.id,
                    email: session.user.email,
                    organization_name: session.user.user_metadata.organization_name || 'My Organization'
                  }
                ]);
                
              if (insertError) {
                console.error("Error creating user profile:", insertError);
                toast.error("Failed to create user profile");
                return;
              }
              
              setUser({
                id: session.user.id,
                email: session.user.email!,
                organization_name: session.user.user_metadata.organization_name || 'My Organization'
              });
            } else {
              toast.error("Failed to fetch user profile");
            }
            
            return;
          }
          
          if (data) {
            setUser({
              id: data.id,
              email: data.email,
              organization_name: data.organization_name
            });
          }
        } catch (error) {
          console.error("Error in auth subscription:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log("User signed out");
        setUser(null);
      }
    }
  );

  return subscription;
};
