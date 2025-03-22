
import React, { createContext, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContextType } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { setupAuthSubscription } from "@/utils/authSubscription";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading } = useAuthState();
  const { checkAuth, login, signup, logout } = useAuthActions(setUser, setIsLoading);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
    
    // Set up auth state change listener
    const subscription = setupAuthSubscription(setUser);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect for redirecting based on auth state
  useEffect(() => {
    if (!user && !location.pathname.includes("/login") && !location.pathname.includes("/signup")) {
      navigate("/login");
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (user && (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/")) {
      navigate("/dashboard");
    }
  }, [user, navigate, location.pathname]);

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
