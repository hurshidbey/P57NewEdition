import { Router } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

const router = Router();

// Initialize Supabase Admin client for database operations only
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// JWT secret - in production, use a strong secret from env vars
const JWT_SECRET = process.env.JWT_SECRET || 'protokol57-jwt-secret-' + process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32);

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

// Generate JWT token
function generateToken(userId: string, telegramId: number): string {
  return jwt.sign(
    {
      sub: userId,
      telegram_id: telegramId,
      aud: 'authenticated',
      role: 'authenticated',
      iss: 'protokol57'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Generate refresh token
function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

router.post('/telegram-v2', async (req, res) => {
  try {
    const authData: TelegramAuthData = req.body;
    
    console.log('🔐 Telegram auth v2 request for user:', authData.id);

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

    console.log('✅ Telegram auth verified, processing user...');

    // Check if user exists in telegram_users table
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('telegram_users')
      .select('*')
      .eq('telegram_id', authData.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Database error:', fetchError);
      return res.status(500).json({ error: 'Database error' });
    }

    let userId: string;

    if (existingUser) {
      // Update last login
      userId = existingUser.id;
      console.log('👤 Existing user found:', userId);
      
      await supabaseAdmin
        .from('telegram_users')
        .update({ 
          last_login: new Date().toISOString(),
          // Update user info in case it changed
          first_name: authData.first_name,
          last_name: authData.last_name,
          username: authData.username,
          photo_url: authData.photo_url
        })
        .eq('id', userId);
    } else {
      // Create new user
      console.log('🆕 Creating new Telegram user...');
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('telegram_users')
        .insert({
          telegram_id: authData.id,
          first_name: authData.first_name,
          last_name: authData.last_name,
          username: authData.username,
          photo_url: authData.photo_url,
          auth_date: authData.auth_date
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('❌ Failed to create user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
      console.log('✅ New user created:', userId);
    }

    // Generate tokens
    const accessToken = generateToken(userId, authData.id);
    const refreshToken = generateRefreshToken();
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Store refresh token in sessions table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await supabaseAdmin
      .from('telegram_sessions')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      });

    // Return user data and tokens
    const userData = {
      id: userId,
      telegram_id: authData.id,
      first_name: authData.first_name,
      last_name: authData.last_name,
      username: authData.username,
      photo_url: authData.photo_url
    };

    console.log('✅ Authentication successful for user:', userId);

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 604800, // 7 days in seconds
      user: userData
    });

  } catch (error: any) {
    console.error('❌ Telegram auth error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

// Verify JWT token middleware
export function verifyTelegramToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.telegramUser = {
      id: decoded.sub,
      telegram_id: decoded.telegram_id
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;