import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { sendTelegramNotification } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as any;
        await handlePaymentSuccess(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as any;
        await handlePaymentFailure(failedPayment);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const orderId = parseInt(paymentIntent.metadata.orderId);
    
    // Update order status to PAID
    await db.order.update({
      where: { id: orderId },
      data: { 
        // You might want to add a status field to your order schema
        // For now, we'll send notification
      }
    });

    // Send Telegram notification
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (order) {
      await sendTelegramNotification({
        type: 'payment_success',
        order: order,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      });
    }

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const orderId = parseInt(paymentIntent.metadata.orderId);
    
    // Send Telegram notification for failed payment
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (order) {
      await sendTelegramNotification({
        type: 'payment_failed',
        order: order,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        error: paymentIntent.last_payment_error?.message
      });
    }

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}