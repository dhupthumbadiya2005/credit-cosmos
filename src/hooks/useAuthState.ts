
import { useState } from "react";
import { User } from "@/lib/supabase";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
  };
};
