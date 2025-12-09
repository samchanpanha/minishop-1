'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, XCircle, RefreshCw, CreditCard } from 'lucide-react';

export default function PaymentCancelled() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Payment Cancellation
              </CardTitle>
              <CardDescription>
                What happened and what you can do next
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-900">Payment Cancelled</span>
                </div>
                <p className="text-sm text-red-700">
                  Your payment was cancelled either by you or due to an error. Your order has not been processed and no payment was made.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Possible Reasons:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You clicked the "Cancel" button during payment</li>
                  <li>• Payment window was closed unexpectedly</li>
                  <li>• Card was declined by the bank</li>
                  <li>• Network connectivity issues</li>
                  <li>• Insufficient funds</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">What You Can Do:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your payment details and try again</li>
                  <li>• Use a different payment method</li>
                  <li>• Contact your bank if the card was declined</li>
                  <li>• Ensure you have sufficient funds</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Try Payment Again
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your cart is still available. You can try the payment again with the same or different payment details.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/payment" className="flex-1">
                  <Button className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Payment Again
                  </Button>
                </Link>
                <Link href="/cart" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Review Cart
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/contact" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Support
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}