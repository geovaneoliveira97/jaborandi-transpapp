import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctnnmkxvzrqderlafcgg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bm5ta3h2enJxZGVybGFmY2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTUwNDIsImV4cCI6MjA4NzI3MTA0Mn0.HQZHtXYzu9-8IUdc-keBwmid678eXD0HDsvNrnLqowo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)