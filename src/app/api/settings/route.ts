import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram-bot';

export async function GET() {
    // Return current configuration status (not actual values for security)
    const config = {
        stripe: {
            secretKey: !!process.env.STRIPE_SECRET_KEY,
            publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        },
        telegram: {
            botToken: !!process.env.TELEGRAM_BOT_TOKEN,
            chatId: !!process.env.TELEGRAM_CHAT_ID,
        },
    };

    return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
    try {
        const { action } = await request.json();

        if (action === 'testTelegram') {
            const chatId = process.env.TELEGRAM_CHAT_ID;
            const token = process.env.TELEGRAM_BOT_TOKEN;

            if (!chatId || !token) {
                return NextResponse.json(
                    { error: 'Telegram not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env' },
                    { status: 400 }
                );
            }

            // Send test message
            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: '🧪 *Test Message from MiniShop*\n\nYour Telegram integration is working correctly!',
                    parse_mode: 'Markdown',
                }),
            });

            if (response.ok) {
                return NextResponse.json({ success: true, message: 'Test message sent!' });
            } else {
                const error = await response.text();
                return NextResponse.json({ error: `Telegram API error: ${error}` }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('Settings API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
