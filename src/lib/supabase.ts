
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment or use placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbWVyZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.somevalue';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Display a warning message if using placeholder credentials
if (supabaseUrl === 'https://example.supabase.co') {
  console.warn(
    'Using placeholder Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Define types for our database tables
export type User = {
  id: string;
  email: string;
  organization_name: string;
  created_at?: string;
};

export type Report = {
  report_id: string;
  user_id: string;
  initial_context: string;
  text_paragraph_markdown?: string;
  other_json_data?: any;
  created_at?: string;
};

export type ChatMessage = {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  timestamp: string;
};

// Helper function to check if a user is logged in
export const isUserLoggedIn = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData.session) {
    return null;
  }
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();
    
  return data;
};
