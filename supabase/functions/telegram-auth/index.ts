import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user } = await req.json();
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Verifying Telegram user:', user.id, user.first_name);

    // 1. Verify the data is from Telegram using Web Crypto API
    const dataCheckString = Object.keys(user)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${user[key]}`)
      .join('\n');

    // Create secret key using Web Crypto API
    const encoder = new TextEncoder();
    const botTokenBytes = encoder.encode(botToken);
    const secretKey = await crypto.subtle.digest('SHA-256', botTokenBytes);

    // Create HMAC using Web Crypto API  
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const dataBytes = encoder.encode(dataCheckString);
    const signature = await crypto.subtle.sign('HMAC', key, dataBytes);
    const hash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hash !== user.hash) {
      console.error('Hash verification failed:', { expected: user.hash, calculated: hash });
      return new Response(JSON.stringify({ error: 'Invalid hash. Data is not from Telegram.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('Telegram hash verification successful');

    // 2. Data is valid, create a Supabase client with service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating/finding user with Telegram ID:', user.id);

    // 3. Check if user with this telegram_id already exists in auth.users
    const telegramEmail = `tg_${user.id}@telegram.local`;
    
    let authUser;
    try {
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUsersByEmail(telegramEmail);
      authUser = existingUser.users[0];
    } catch (error) {
      console.log('No existing user found, will create new one');
    }

    if (!authUser) {
      // 4. Create new user in auth
      console.log('Creating new auth user');
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: telegramEmail,
        email_confirm: true,
        user_metadata: {
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          avatar_url: user.photo_url,
          telegram_id: user.id,
          provider: 'telegram'
        },
      });

      if (createError) {
        console.error('Failed to create user:', createError);
        throw createError;
      }
      authUser = newUser.user;
      console.log('User created successfully:', authUser.id);
    }

    // 5. Generate access token for the user
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateAccessToken(authUser.id);

    if (tokenError) {
      console.error('Failed to generate token:', tokenError);
      throw tokenError;
    }

    console.log('Token generated successfully');

    return new Response(JSON.stringify({ 
      access_token: tokenData.access_token,
      user: authUser,
      session: tokenData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Authentication failed',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
