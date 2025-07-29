import { Router } from 'express';
import { logger } from './utils/logger';
import https from 'https';

interface SupportSubmission {
  name?: string;
  email: string;
  topic: 'technical' | 'payment' | 'feature' | 'other';
  message: string;
}

export function setupSupportRoutes(): Router {
  const router = Router();
  
  // Track submissions per IP/user
  const submissionTracker = new Map<string, { count: number; resetTime: number }>();
  
  // Rate limiting helper
  const checkRateLimit = (identifier: string): boolean => {
    const now = Date.now();
    const tracking = submissionTracker.get(identifier);
    
    if (!tracking || now > tracking.resetTime) {
      // Reset after 1 hour
      submissionTracker.set(identifier, { count: 1, resetTime: now + 60 * 60 * 1000 });
      return true;
    }
    
    if (tracking.count >= 3) {
      return false; // Rate limit exceeded
    }
    
    tracking.count++;
    return true;
  };
  
  // Submit support request
  router.post('/support/submit', async (req, res) => {
    try {
      const { name, email, topic, message }: SupportSubmission = req.body;
      
      // Get identifier for rate limiting
      const userId = req.session?.user?.id;
      const userIp = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const identifier = userId || userIp;
      
      // Check rate limit
      if (!checkRateLimit(identifier)) {
        return res.status(429).json({
          success: false,
          message: 'Juda ko\'p so\'rov yuborildi. Iltimos 1 soatdan keyin qayta urinib ko\'ring.'
        });
      }
      
      // Validate input
      if (!email || !topic || !message) {
        return res.status(400).json({
          success: false,
          message: 'Email, mavzu va xabar kiritish shart'
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email manzil noto\'g\'ri'
        });
      }
      
      // Validate message length
      if (message.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Xabar kamida 10 ta belgidan iborat bo\'lishi kerak'
        });
      }
      
      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Xabar 1000 ta belgidan oshmasligi kerak'
        });
      }
      
      // Topic labels
      const topicLabels: Record<string, string> = {
        technical: 'Texnik muammo',
        payment: 'To\'lov bilan bog\'liq',
        feature: 'Yangi funksiya so\'rovi',
        other: 'Boshqa'
      };
      
      // Format message for Telegram
      const timestamp = new Date().toLocaleString('uz-UZ', { 
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const telegramMessage = `🆘 <b>YANGI SUPPORT SO'ROV</b>\n\n` +
        `👤 <b>Ism:</b> ${name || 'Ko\'rsatilmagan'}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📌 <b>Mavzu:</b> ${topicLabels[topic] || topic}\n\n` +
        `💬 <b>Xabar:</b>\n${message}\n\n` +
        `⏰ <b>Vaqt:</b> ${timestamp}`;
      
      // Send to Telegram
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = '@birfoizsupport'; // Your Telegram channel
      
      if (!botToken) {
        logger.error('Telegram bot token not configured');
        return res.status(500).json({
          success: false,
          message: 'Telegram konfiguratsiyasi topilmadi'
        });
      }
      
      // Make request to Telegram Bot API
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const telegramData = JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      });
      
      const telegramResponse = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        const request = https.request(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(telegramData)
          }
        }, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              const result = JSON.parse(data);
              if (result.ok) {
                resolve({ success: true });
              } else {
                logger.error('Telegram API error:', result);
                resolve({ success: false, error: result.description || 'Unknown error' });
              }
            } catch (error) {
              logger.error('Failed to parse Telegram response:', error);
              resolve({ success: false, error: 'Invalid response from Telegram' });
            }
          });
        });
        
        request.on('error', (error) => {
          logger.error('Telegram request error:', error);
          resolve({ success: false, error: error.message });
        });
        
        request.write(telegramData);
        request.end();
      });
      
      if (!telegramResponse.success) {
        logger.error('Failed to send message to Telegram:', telegramResponse.error);
        return res.status(500).json({
          success: false,
          message: 'Xabarni yuborishda xatolik yuz berdi. Iltimos keyinroq urinib ko\'ring.'
        });
      }
      
      logger.info('Support message sent successfully', { email, topic });
      
      res.json({
        success: true,
        message: 'Xabaringiz muvaffaqiyatli yuborildi'
      });
      
    } catch (error: any) {
      logger.error('Support submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Server xatosi. Iltimos keyinroq urinib ko\'ring.'
      });
    }
  });
  
  return router;
}