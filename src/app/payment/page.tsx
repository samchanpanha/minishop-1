'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Loader2, Shield, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
  };
}

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

function CheckoutForm({ orderData, cartItems, totalAmount }: {
  orderData: OrderData;
  cartItems: CartItem[];
  totalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Create order first
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      const orderPayload = {
        ...orderData,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderId(order.id);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setMessage('Failed to create order');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !orderId) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          orderId: orderId
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentResponse.json();

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
      } else {
        // Payment successful, redirect to success page
        router.push(`/payment/success?order_id=${orderId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = async () => {
    if (!orderId) return;

    setIsSimulating(true);
    setMessage('');

    try {
      const response = await fetch('/api/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutOrderData');
        // Redirect to success page
        router.push(`/order-confirmation/${orderId}`);
      } else {
        setMessage(data.error || 'Simulation failed');
      }
    } catch (error) {
      setMessage('Failed to simulate payment');
    } finally {
      setIsSimulating(false);
    }
  };

  if (!orderId) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Creating order...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Enter your payment details securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />

          {message && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${totalAmount.toFixed(2)}`
        )}
      </Button>

      {/* Dev Mode: Simulate Payment */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800 mb-2 font-medium">🧪 Development Mode</div>
        <p className="text-xs text-yellow-700 mb-3">Skip Stripe and simulate a successful payment to test Telegram notifications.</p>
        <Button
          type="button"
          variant="outline"
          onClick={simulatePayment}
          disabled={isSimulating}
          className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-100"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulating...
            </>
          ) : (
            'Simulate Payment (Test Telegram)'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Get order data from localStorage (from checkout page)
      const savedOrderData = localStorage.getItem('checkoutOrderData');
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      if (!savedOrderData || cart.length === 0) {
        router.push('/checkout');
        return;
      }

      setOrderData(JSON.parse(savedOrderData));

      // Fetch product details for cart items
      const itemsWithProducts = await Promise.all(
        cart.map(async (item: CartItem) => {
          try {
            const response = await fetch(`/api/products/${item.productId}`);
            if (response.ok) {
              const product = await response.json();
              return { ...item, product };
            }
            return null;
          } catch (error) {
            console.error('Error fetching product:', error);
            return null;
          }
        })
      );

      const validItems = itemsWithProducts.filter(item => item !== null) as CartItem[];
      setCartItems(validItems);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      router.push('/checkout');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total;
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading payment...</div>
      </div>
    );
  }

  if (!orderData || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No order data found</div>
      </div>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/checkout" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Checkout
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Securely complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise} options={{
              mode: 'payment',
              amount: Math.round(totalAmount * 100), // Convert to cents
              currency: 'usd',
            }}>
              <CheckoutForm
                orderData={orderData}
                cartItems={cartItems}
                totalAmount={totalAmount}
              />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Img</span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.product?.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-semibold">
                        ${item.product ? (item.product.price * item.quantity).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Customer Information</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {orderData.customerName}</p>
                    <p><strong>Email:</strong> {orderData.customerEmail}</p>
                    <p><strong>Phone:</strong> {orderData.customerPhone}</p>
                    <p><strong>Address:</strong> {orderData.shippingAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}