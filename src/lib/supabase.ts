
import { createClient } from '@supabase/supabase-js';

// Default values that will prevent runtime errors but won't connect to a real database
const supabaseUrl = 'https://example.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbWVyZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAwfQ.somevalue';

// Note: In a production environment, these should be environment variables
// Replace with your actual Supabase URL and anon key
export const supabase = createClient(supabaseUrl, supabaseKey);

// Display a warning message in the console
console.warn(
  'Using placeholder Supabase credentials. Replace with actual values in supabase.ts file.'
);

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
