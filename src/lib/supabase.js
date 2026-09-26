import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://exhqdakrfekiotarblua.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aHFkYWtyZmVraW90YXJibHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzI4ODIsImV4cCI6MjEwNjAwODg4Mn0.0CRktEAx7GFTty7oBc2K2sd7acbI62aT6y4BWFw7BX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});