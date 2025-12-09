import { db } from '@/lib/db';

interface NotificationData {
  type: 'payment_success' | 'payment_failed' | 'new_order';
  order: any;
  paymentId?: string;
  amount?: number;
  error?: string;
}

export async function sendTelegramNotification(data: NotificationData) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!chatId || !token) {
      console.log('Telegram bot not configured');
      return;
    }

    let message = '';

    switch (data.type) {
      case 'payment_success':
        message = `✅ *Payment Successful*\n\n`;
        message += `📦 Order #${data.order.id}\n`;
        message += `💰 Amount: $${data.amount?.toFixed(2)}\n`;
        message += `👤 Customer: ${data.order.customerName}\n`;
        message += `📧 Email: ${data.order.customerEmail}\n`;
        message += `📱 Phone: ${data.order.customerPhone}\n`;
        message += `🏠 Address: ${data.order.shippingAddress}\n\n`;
        message += `🛍️ *Items:*\n`;
        data.order.orderItems.forEach((item: any) => {
          message += `• ${item.product.name} x${item.quantity} = $${item.subtotal.toFixed(2)}\n`;
        });
        message += `\n💳 Payment ID: ${data.paymentId}`;
        break;

      case 'payment_failed':
        message = `❌ *Payment Failed*\n\n`;
        message += `📦 Order #${data.order.id}\n`;
        message += `💰 Amount: $${data.amount?.toFixed(2)}\n`;
        message += `👤 Customer: ${data.order.customerName}\n`;
        if (data.error) {
          message += `🚫 Error: ${data.error}\n`;
        }
        message += `\n💳 Payment ID: ${data.paymentId}`;
        break;

      case 'new_order':
        message = `🆕 *New Order*\n\n`;
        message += `📦 Order #${data.order.id}\n`;
        message += `💰 Total: $${data.order.totalAmount.toFixed(2)}\n`;
        message += `👤 Customer: ${data.order.customerName}\n`;
        message += `📧 Email: ${data.order.customerEmail}\n`;
        message += `📱 Phone: ${data.order.customerPhone}\n`;
        message += `🏠 Address: ${data.order.shippingAddress}\n`;
        break;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Telegram notification sent: ${data.type}`);
    } else {
      const error = await response.text();
      console.error('Error sending Telegram notification:', error);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}