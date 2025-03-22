
import { User } from "@/lib/supabase";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, organization: string) => Promise<void>;
  signup: (email: string, password: string, organization: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}
