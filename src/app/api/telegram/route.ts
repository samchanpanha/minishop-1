import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Telegram bot command handler
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle different update types
    if (update.message) {
      return await handleMessage(update.message);
    } else if (update.callback_query) {
      return await handleCallback(update.callback_query);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram bot error:', error);
    return NextResponse.json({ error: 'Bot error' }, { status: 500 });
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text;
  
  if (!text || !text.startsWith('/')) {
    return NextResponse.json({ ok: true });
  }

  const [command, ...args] = text.split(' ');
  
  switch (command) {
    case '/start':
      return await sendStartMessage(chatId);
    case '/help':
      return await sendHelpMessage(chatId);
    case '/orders':
      return await sendOrdersMessage(chatId);
    case '/order':
      return await sendOrderDetails(chatId, args[0]);
    case '/stats':
      return await sendStatsMessage(chatId);
    default:
      return await sendUnknownCommandMessage(chatId);
  }
}

async function sendStartMessage(chatId: number) {
  const message = `🤖 Welcome to MiniShop Bot!\n\n` +
    'Available commands:\n' +
    '/orders - View recent orders\n' +
    '/order <id> - View specific order\n' +
    '/stats - View order statistics\n' +
    '/help - Show this help message';
  
  return await sendTelegramMessage(chatId, message);
}

async function sendHelpMessage(chatId: number) {
  const message = `📚 *MiniShop Bot Commands:*\n\n` +
    '/orders - View recent orders\n' +
    '/order <id> - View specific order details\n' +
    '/stats - View order statistics\n' +
    '/help - Show this help message\n\n' +
    'Example: /order 123';
  
  return await sendTelegramMessage(chatId, message, 'Markdown');
}

async function sendOrdersMessage(chatId: number) {
  try {
    const orders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (orders.length === 0) {
      return await sendTelegramMessage(chatId, '📭 No orders found.');
    }

    let message = '📋 *Recent Orders:*\n\n';
    orders.forEach((order) => {
      message += `📦 #${order.id} - $${order.totalAmount.toFixed(2)}\n`;
      message += `👤 ${order.customerName}\n`;
      message += `📅 ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
    });

    return await sendTelegramMessage(chatId, message, 'Markdown');
  } catch (error) {
    console.error('Error fetching orders:', error);
    return await sendTelegramMessage(chatId, '❌ Error fetching orders. Please try again.');
  }
}

async function sendOrderDetails(chatId: number, orderIdStr?: string) {
  const orderId = parseInt(orderIdStr || '');
  
  if (!orderId) {
    return await sendTelegramMessage(chatId, '❌ Please provide an order ID.\nExample: /order 123');
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return await sendTelegramMessage(chatId, `❌ Order #${orderId} not found.`);
    }

    let message = `📦 *Order #${order.id}*\n\n`;
    message += `👤 *Customer:* ${order.customerName}\n`;
    message += `📧 *Email:* ${order.customerEmail}\n`;
    message += `📱 *Phone:* ${order.customerPhone}\n`;
    message += `🏠 *Address:* ${order.shippingAddress}\n`;
    message += `💰 *Total:* $${order.totalAmount.toFixed(2)}\n`;
    message += `📅 *Date:* ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
    message += `🛍️ *Items:*\n`;

    order.orderItems.forEach((item) => {
      message += `• ${item.product.name} x${item.quantity} = $${item.subtotal.toFixed(2)}\n`;
    });

    return await sendTelegramMessage(chatId, message, 'Markdown');
  } catch (error) {
    console.error('Error fetching order:', error);
    return await sendTelegramMessage(chatId, '❌ Error fetching order. Please try again.');
  }
}

async function sendStatsMessage(chatId: number) {
  try {
    const totalOrders = await db.order.count();
    const orders = await db.order.findMany({
      select: { totalAmount: true }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const message = `📊 *MiniShop Statistics*\n\n` +
      `📦 Total Orders: ${totalOrders}\n` +
      `💰 Total Revenue: $${totalRevenue.toFixed(2)}\n` +
      `📈 Average Order Value: $${averageOrderValue.toFixed(2)}\n`;

    return await sendTelegramMessage(chatId, message, 'Markdown');
  } catch (error) {
    console.error('Error fetching stats:', error);
    return await sendTelegramMessage(chatId, '❌ Error fetching statistics. Please try again.');
  }
}

async function sendUnknownCommandMessage(chatId: number) {
  return await sendTelegramMessage(chatId, '🤖 Use /help to see available commands.');
}

async function handleCallback(callbackQuery: any) {
  // Handle inline keyboard callbacks if needed
  return NextResponse.json({ ok: true });
}

async function sendTelegramMessage(chatId: number, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode,
    disable_web_page_preview: true
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Webhook setup endpoint
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/api/telegram`;
  
  if (!token) {
    return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
  }

  try {
    const url = `https://api.telegram.org/bot${token}/setWebhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({ 
        message: 'Webhook set successfully',
        webhook_url: webhookUrl,
        result 
      });
    } else {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json({ error: 'Failed to set webhook' }, { status: 500 });
  }
}