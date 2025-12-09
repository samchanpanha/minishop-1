'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';

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

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: ''
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      if (cart.length === 0) {
        router.push('/cart');
        return;
      }

      // Fetch product details for each cart item
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

      // Filter out null items and check stock
      const validItems = itemsWithProducts.filter(item => item !== null) as CartItem[];
      const outOfStockItems = validItems.filter(item =>
        item.quantity > (item.product?.stock || 0)
      );

      if (outOfStockItems.length > 0) {
        alert('Some items in your cart are out of stock. Please update your cart.');
        router.push('/cart');
        return;
      }

      setCartItems(validItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!orderData.customerName.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!orderData.customerEmail.trim()) {
      alert('Please enter your email');
      return false;
    }
    if (!orderData.customerPhone.trim()) {
      alert('Please enter your phone number');
      return false;
    }
    if (!orderData.shippingAddress.trim()) {
      alert('Please enter your shipping address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cartItems.length === 0) return;

    // Save order data to localStorage for payment page
    localStorage.setItem('checkoutOrderData', JSON.stringify(orderData));

    // Redirect to payment page
    router.push('/payment');
  };

  const calculateSubtotal = (item: CartItem) => {
    if (!item.product) return 0;
    return item.product.price * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateSubtotal(item), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No items in cart</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/cart" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Badge>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>
                    Please provide your contact and shipping information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        type="text"
                        required
                        value={orderData.customerName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email Address *</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        required
                        value={orderData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      required
                      value={orderData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Shipping Address *</Label>
                    <Input
                      id="shippingAddress"
                      name="shippingAddress"
                      type="text"
                      required
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Items Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
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
                          ${calculateSubtotal(item).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  form="checkout-form"
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}