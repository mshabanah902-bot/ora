import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hdliplvcymhjiheguvoa.supabase.co';
// WARNING: This is for verification only. Do not commit real keys.
// The key is masked in the file, so I will check if the client can be initialized.
const supabase = createClient(SUPABASE_URL, 'placeholder-key');

async function testConnection() {
  try {
    const { data, error } = await supabase.from('store_settings').select('*').limit(1);
    if (error) {
        console.log('Supabase connection test failed, but client initialized: ' + error.message);
    } else {
        console.log('Supabase connection successful');
    }
  } catch (e) {
    console.log('Error testing Supabase: ' + e.message);
  }
}

testConnection();
