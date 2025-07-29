import fetch from 'node-fetch';

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

class TelegramNotificationService {
  private botToken: string;
  private supportChatId: string;
  private personalChatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.supportChatId = process.env.TELEGRAM_SUPPORT_CHAT_ID || '';
    this.personalChatId = process.env.TELEGRAM_PERSONAL_CHAT_ID || '343572370';
    
    if (!this.botToken) {
      console.warn('⚠️ Telegram bot token not configured. Notifications will be disabled.');
    }
  }

  private async sendMessage(chatId: string, message: TelegramMessage): Promise<boolean> {
    if (!this.botToken || !chatId) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.text,
          parse_mode: message.parse_mode || 'HTML'
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        console.error(`❌ Telegram API error:`, result);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to send Telegram message to ${chatId}:`, error);
      return false;
    }
  }

  private async sendToAllAdmins(message: TelegramMessage): Promise<void> {
    const chatIds = [this.supportChatId, this.personalChatId].filter(id => id);
    console.log(`📤 Sending to chat IDs: ${chatIds.join(', ')}`);
    
    await Promise.all(
      chatIds.map(chatId => this.sendMessage(chatId, message))
    );
  }

  async notifyNewUserRegistration(user: {
    email: string;
    name?: string;
    id: string;
    signupMethod: 'email' | 'google';
    timestamp: Date;
  }): Promise<void> {
    const message: TelegramMessage = {
      text: `
🎉 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>

👤 <b>Email:</b> ${user.email}
📝 <b>Ism:</b> ${user.name || 'Ko\'rsatilmagan'}
🔑 <b>ID:</b> <code>${user.id}</code>
🔐 <b>Ro'yxatdan o'tish usuli:</b> ${user.signupMethod === 'google' ? 'Google' : 'Email/Parol'}
🕐 <b>Vaqt:</b> ${user.timestamp.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
🌐 <b>Platform:</b> https://app.p57.uz
`,
      parse_mode: 'HTML'
    };

    await this.sendToAllAdmins(message);
  }

  async notifyPaymentSuccess(payment: {
    userId: string;
    userEmail: string;
    userName?: string;
    amount: number;
    paymentMethod: 'click' | 'atmos';
    transactionId: string;
    couponCode?: string;
    couponDiscount?: number;
    timestamp: Date;
  }): Promise<void> {
    const originalAmount = payment.couponDiscount 
      ? payment.amount + payment.couponDiscount 
      : payment.amount;
    
    const message: TelegramMessage = {
      text: `
💰 <b>Yangi to'lov qabul qilindi!</b>

👤 <b>Foydalanuvchi:</b> ${payment.userEmail}
📝 <b>Ism:</b> ${payment.userName || 'Ko\'rsatilmagan'}
🔑 <b>User ID:</b> <code>${payment.userId}</code>
💳 <b>To'lov usuli:</b> ${payment.paymentMethod === 'click' ? 'Click.uz' : 'Atmos'}
📄 <b>Tranzaksiya ID:</b> <code>${payment.transactionId}</code>
${payment.couponCode ? `🎟️ <b>Kupon kodi:</b> ${payment.couponCode}` : ''}
${payment.couponDiscount ? `💸 <b>Asl narx:</b> ${originalAmount.toLocaleString('uz-UZ')} UZS` : ''}
${payment.couponDiscount ? `🎁 <b>Chegirma:</b> -${payment.couponDiscount.toLocaleString('uz-UZ')} UZS` : ''}
💵 <b>To'lov summasi:</b> ${payment.amount.toLocaleString('uz-UZ')} UZS
🕐 <b>Vaqt:</b> ${payment.timestamp.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
✅ <b>Status:</b> Muvaffaqiyatli

🌐 <b>Platform:</b> https://app.p57.uz
`,
      parse_mode: 'HTML'
    };

    await this.sendToAllAdmins(message);
  }

  async notifyPaymentFailed(payment: {
    userId?: string;
    userEmail?: string;
    amount: number;
    paymentMethod: 'click' | 'atmos';
    transactionId?: string;
    error: string;
    timestamp: Date;
  }): Promise<void> {
    const message: TelegramMessage = {
      text: `
❌ <b>To'lov amalga oshmadi!</b>

👤 <b>Foydalanuvchi:</b> ${payment.userEmail || 'Noma\'lum'}
${payment.userId ? `🔑 <b>User ID:</b> <code>${payment.userId}</code>` : ''}
💳 <b>To'lov usuli:</b> ${payment.paymentMethod === 'click' ? 'Click.uz' : 'Atmos'}
${payment.transactionId ? `📄 <b>Tranzaksiya ID:</b> <code>${payment.transactionId}</code>` : ''}
💵 <b>To'lov summasi:</b> ${payment.amount.toLocaleString('uz-UZ')} UZS
⚠️ <b>Xatolik:</b> ${payment.error}
🕐 <b>Vaqt:</b> ${payment.timestamp.toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}

🌐 <b>Platform:</b> https://app.p57.uz
`,
      parse_mode: 'HTML'
    };

    await this.sendToAllAdmins(message);
  }

  async sendCustomNotification(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<void> {
    await this.sendToAllAdmins({ text, parse_mode: parseMode });
  }
}

// Export singleton instance
export const telegramNotifications = new TelegramNotificationService();