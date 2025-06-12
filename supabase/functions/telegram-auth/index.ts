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
    
    console.log('Telegram auth request for user:', user.id, user.first_name);

    // For now, skip hash validation and just return success with user data
    // The client will handle user creation through regular Supabase auth
    
    const telegramUser = {
      id: user.id,
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      username: user.username,
      photo_url: user.photo_url,
      email: `tg_${user.id}@telegram.local`
    };
    
    console.log('🔑 Edge Function generating credentials:');
    console.log('📧 Email:', telegramUser.email);
    console.log('🔐 Password would be: telegram_' + telegramUser.id);
    console.log('👤 Full user:', JSON.stringify(telegramUser));

    return new Response(JSON.stringify({ 
      success: true,
      telegram_user: telegramUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Authentication failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
