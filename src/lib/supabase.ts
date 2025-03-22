
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY'; 

// Note: In a production environment, these should be environment variables
// Replace with your actual Supabase URL and anon key
export const supabase = createClient(supabaseUrl, supabaseKey);

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
