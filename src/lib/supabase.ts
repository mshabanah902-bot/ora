import { createClient } from '@supabase/supabase-js';

// استبدل الروابط بمعلومات مشروعك الحقيقي في سوبابيس
const SUPABASE_URL = 'https://hdliplvcymhjiheguvoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbGlwbHZjeW1oamloZWd1dm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTA0NzcsImV4cCI6MjEwNTY2NjQ3N30.OKKPyVmAVXSJzEf-UfncwjrUEpAQOI0yy7Bdi86UDCk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);