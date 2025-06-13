import { Router } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase Admin client with service role
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Verify Telegram authentication data
function verifyTelegramAuth(authData: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  // Create data check string
  const checkData = Object.keys(authData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${authData[key as keyof TelegramAuthData]}`)
    .join('\n');

  // Create secret key
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkData)
    .digest('hex');

  return calculatedHash === authData.hash;
}

router.post('/telegram', async (req, res) => {
  try {
    const authData: TelegramAuthData = req.body;
    
    console.log('🔐 Telegram auth request for user:', authData.id);

    // Verify the authentication data
    if (!verifyTelegramAuth(authData)) {
      console.error('❌ Invalid Telegram authentication hash');
      return res.status(401).json({ error: 'Invalid authentication data' });
    }

    // Check if auth_date is not too old (5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authData.auth_date > 300) {
      console.error('❌ Telegram auth data is too old');
      return res.status(401).json({ error: 'Authentication data expired' });
    }

    // Generate user email and metadata
    const email = `telegram_${authData.id}@protokol57.app`;
    const password = `tg_${authData.id}_${authData.auth_date}_protokol57`; // Add app-specific suffix
    const userMetadata = {
      name: `${authData.first_name} ${authData.last_name || ''}`.trim(),
      telegram_id: authData.id,
      username: authData.username,
      avatar_url: authData.photo_url,
      provider: 'telegram'
    };

    console.log('✅ Telegram auth verified, processing user:', email);

    // Try to sign in first (for existing users)
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (signInData?.session) {
      console.log('✅ Existing user signed in successfully');
      return res.json({
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_in: signInData.session.expires_in,
        token_type: 'bearer',
        user: signInData.user
      });
    }

    // If sign in failed, create new user
    if (signInError?.message?.includes('Invalid login credentials')) {
      console.log('🆕 Creating new user...');
      
      // First create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email for Telegram users
        user_metadata: userMetadata,
        app_metadata: {
          provider: 'telegram',
          telegram_id: authData.id
        }
      });

      if (createError) {
        console.error('❌ User creation error:', createError);
        
        // If user already exists with different password, we can't sign them in
        if (createError.message?.includes('already exists')) {
          return res.status(400).json({ 
            error: 'User exists with different credentials. Please contact support.' 
          });
        }
        
        return res.status(500).json({ 
          error: createError.message || 'Failed to create user' 
        });
      }

      console.log('✅ User created, signing in...');

      // Now sign in the newly created user
      const { data: newSignInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (newSignInError || !newSignInData?.session) {
        console.error('❌ Failed to sign in new user:', newSignInError);
        return res.status(500).json({ 
          error: 'User created but failed to sign in' 
        });
      }

      console.log('✅ New user signed in successfully');
      return res.json({
        access_token: newSignInData.session.access_token,
        refresh_token: newSignInData.session.refresh_token,
        expires_in: newSignInData.session.expires_in,
        token_type: 'bearer',
        user: newSignInData.user
      });
    }

    // Other sign in errors
    console.error('❌ Sign in error:', signInError);
    return res.status(500).json({ 
      error: signInError?.message || 'Authentication failed' 
    });

  } catch (error: any) {
    console.error('❌ Telegram auth error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

export default router;