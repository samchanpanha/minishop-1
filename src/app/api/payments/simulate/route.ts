import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTelegramNotification } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // Fetch the order with items
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Send Telegram notification for successful payment
        await sendTelegramNotification({
            type: 'payment_success',
            order,
            paymentId: `SIMULATED-${Date.now()}`,
            amount: order.totalAmount,
        });

        return NextResponse.json({
            success: true,
            message: 'Simulated payment successful! Telegram notification sent.',
            orderId: order.id,
        });
    } catch (error) {
        console.error('Simulate payment error:', error);
        return NextResponse.json({ error: 'Simulated payment failed' }, { status: 500 });
    }
}
