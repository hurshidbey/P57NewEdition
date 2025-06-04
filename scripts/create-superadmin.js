import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  try {
    console.log('Creating superadmin user...');

    // Create the user via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'hurshidbey@gmail.com',
      password: '20031000a',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: 'Hurshidbey',
        role: 'superadmin'
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('✅ Superadmin user already exists');
        
        // Get the existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === 'hurshidbey@gmail.com');
        
        if (existingUser) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', existingUser.id)
            .single();

          if (!profile) {
            console.log('Creating user profile...');
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: existingUser.id,
                email: 'hurshidbey@gmail.com',
                name: 'Hurshidbey',
                role: 'superadmin',
                is_active: true,
                created_at: new Date().toISOString()
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            } else {
              console.log('✅ User profile created successfully');
            }
          } else {
            console.log('✅ User profile already exists');
            
            // Update role to superadmin if needed
            if (profile.role !== 'superadmin') {
              await supabase
                .from('user_profiles')
                .update({ role: 'superadmin' })
                .eq('id', existingUser.id);
              console.log('✅ Role updated to superadmin');
            }
          }
        }
        return;
      } else {
        throw authError;
      }
    }

    if (authData.user) {
      console.log('✅ Auth user created:', authData.user.email);

      // Create the user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: 'hurshidbey@gmail.com',
          name: 'Hurshidbey',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        console.log('✅ User profile created successfully');
      }
    }

    console.log('🎉 Superadmin setup complete!');
    console.log('📧 Email: hurshidbey@gmail.com');
    console.log('🔐 Password: 20031000a');

  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdmin().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});