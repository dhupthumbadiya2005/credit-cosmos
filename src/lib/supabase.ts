
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Display a warning message if using placeholder credentials
if (supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
  console.warn(
    'Using placeholder Supabase credentials. Please set proper VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
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

// Initialize database schema if needed
export const initializeDatabase = async () => {
  try {
    // Check if users table exists and create it if not
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError && usersError.code === '42P01') { // Table doesn't exist error code
      console.log('Creating users table...');
      // Note: Table creation should be done via Supabase dashboard or migrations
      // This is a fallback mechanism for development
      await supabase.rpc('create_users_table');
    }

    // Check if reports table exists and create it if not
    const { error: reportsError } = await supabase
      .from('reports')
      .select('report_id')
      .limit(1);

    if (reportsError && reportsError.code === '42P01') {
      console.log('Creating reports table...');
      await supabase.rpc('create_reports_table');
    }

    // Check if chat_messages table exists and create it if not
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);

    if (messagesError && messagesError.code === '42P01') {
      console.log('Creating chat_messages table...');
      await supabase.rpc('create_chat_messages_table');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
  }
};
