
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
    console.log('Initializing database schema...');
    
    // Create users table SQL
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create reports table SQL
    const createReportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) NOT NULL,
        initial_context TEXT NOT NULL,
        text_paragraph_markdown TEXT,
        other_json_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create chat_messages table SQL
    const createChatMessagesTable = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        report_id UUID REFERENCES reports(report_id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Execute SQL through Supabase functions
    await supabase.rpc('exec_sql', { sql: createUsersTable }).catch(e => {
      console.error('Error creating users table:', e);
      // Fallback: Try to check if the table exists first
      checkTableExists('users');
    });

    await supabase.rpc('exec_sql', { sql: createReportsTable }).catch(e => {
      console.error('Error creating reports table:', e);
      checkTableExists('reports');
    });

    await supabase.rpc('exec_sql', { sql: createChatMessagesTable }).catch(e => {
      console.error('Error creating chat_messages table:', e);
      checkTableExists('chat_messages');
    });
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    console.log('You may need to manually create the tables in Supabase Studio');
  }
};

// Helper function to check if a table exists
const checkTableExists = async (tableName: string) => {
  try {
    console.log(`Checking if ${tableName} table exists...`);
    const { error } = await supabase
      .from(tableName)
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error(`Table ${tableName} does not exist or cannot be accessed:`, error);
      console.log(`You need to manually create the ${tableName} table in Supabase Studio`);
    } else {
      console.log(`Table ${tableName} exists and is accessible`);
    }
  } catch (e) {
    console.error(`Error checking ${tableName} table:`, e);
  }
};
