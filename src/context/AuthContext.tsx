
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { supabase, User } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, organization: string) => Promise<void>;
  signup: (email: string, password: string, organization: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Check active session in Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        // Get user profile from Supabase
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            organization_name: userData.organization_name
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
    
    setUser(null);
    return false;
  };

  const login = async (email: string, password: string, organization: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Get user profile from Supabase
        const { data: userData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            organization_name: userData.organization_name
          });
          
          // Show success toast
          toast.success("Login successful", {
            description: `Welcome back to CrediSphere, ${userData.organization_name}!`,
          });
          
          // Redirect to dashboard
          navigate("/dashboard");
        }
      }
    } catch (error) {
      let message = "Login failed";
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error("Authentication failed", {
        description: message,
      });
      
      // Clear any stored data
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, organization: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            organization_name: organization
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Insert into users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              organization_name: organization
            }
          ]);
        
        if (profileError) {
          throw profileError;
        }
        
        toast.success("Account created successfully", {
          description: "Please check your email for verification.",
        });
        
        // Redirect to login page
        navigate("/login");
      }
    } catch (error) {
      let message = "Registration failed";
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast.error("Registration failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): void => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Update context state
      setUser(null);
      
      // Show toast
      toast.success("Logged out successfully");
      
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "Please try again."
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
