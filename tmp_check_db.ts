import { supabase } from './src/integrations/supabase/client';

async function checkSchema() {
  console.log('Checking user_doubt...');
  const { data: doubtData, error: doubtError } = await supabase
    .from('user_doubt')
    .select('*')
    .limit(1);
  
  if (doubtError) {
    console.error('Error fetching user_doubt:', doubtError);
  } else {
    console.log('user_doubt columns:', Object.keys(doubtData[0] || {}));
  }

  console.log('\nChecking contact_us...');
  const { data: contactData, error: contactError } = await supabase
    .from('contact_us')
    .select('*')
    .limit(1);
  
  if (contactError) {
    console.error('Error fetching contact_us:', contactError);
  } else {
    console.log('contact_us columns:', Object.keys(contactData[0] || {}));
  }
}

checkSchema();
