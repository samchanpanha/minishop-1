'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, CheckCircle, XCircle, Send, Loader2, CreditCard, MessageCircle } from 'lucide-react';

interface ConfigStatus {
    stripe: {
        secretKey: boolean;
        publishableKey: boolean;
    };
    telegram: {
        botToken: boolean;
        chatId: boolean;
    };
}

export default function SettingsPage() {
    const [config, setConfig] = useState<ConfigStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setConfig(data);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const testTelegram = async () => {
        setTesting('telegram');
        setMessage(null);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'testTelegram' }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to test Telegram' });
        } finally {
            setTesting(null);
        }
    };

    const StatusIcon = ({ configured }: { configured: boolean }) => (
        configured ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
            <XCircle className="w-5 h-5 text-red-500" />
        )
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
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
                            <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Admin
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h2>
                    <p className="text-gray-600">Manage your payment and notification settings</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Stripe Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Stripe Payment
                            </CardTitle>
                            <CardDescription>
                                Configure Stripe for payment processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon configured={config?.stripe.secretKey || false} />
                                        <span>STRIPE_SECRET_KEY</span>
                                    </div>
                                    <Badge variant={config?.stripe.secretKey ? "default" : "secondary"}>
                                        {config?.stripe.secretKey ? 'Configured' : 'Not Set'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon configured={config?.stripe.publishableKey || false} />
                                        <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                                    </div>
                                    <Badge variant={config?.stripe.publishableKey ? "default" : "secondary"}>
                                        {config?.stripe.publishableKey ? 'Configured' : 'Not Set'}
                                    </Badge>
                                </div>
                                <div className="pt-2 text-sm text-gray-500">
                                    <p>Get your keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-600 hover:underline">Stripe Dashboard</a></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Telegram Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageCircle className="w-5 h-5 mr-2" />
                                Telegram Notifications
                            </CardTitle>
                            <CardDescription>
                                Configure Telegram bot for order notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon configured={config?.telegram.botToken || false} />
                                        <span>TELEGRAM_BOT_TOKEN</span>
                                    </div>
                                    <Badge variant={config?.telegram.botToken ? "default" : "secondary"}>
                                        {config?.telegram.botToken ? 'Configured' : 'Not Set'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <StatusIcon configured={config?.telegram.chatId || false} />
                                        <span>TELEGRAM_CHAT_ID</span>
                                    </div>
                                    <Badge variant={config?.telegram.chatId ? "default" : "secondary"}>
                                        {config?.telegram.chatId ? 'Configured' : 'Not Set'}
                                    </Badge>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        onClick={testTelegram}
                                        disabled={testing === 'telegram' || !config?.telegram.botToken || !config?.telegram.chatId}
                                    >
                                        {testing === 'telegram' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Test Telegram
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="pt-2 text-sm text-gray-500">
                                    <p>1. Create a bot with <a href="https://t.me/BotFather" target="_blank" className="text-blue-600 hover:underline">@BotFather</a></p>
                                    <p>2. Get your Chat ID by messaging <a href="https://t.me/userinfobot" target="_blank" className="text-blue-600 hover:underline">@userinfobot</a></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How to Configure */}
                    <Card>
                        <CardHeader>
                            <CardTitle>How to Configure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <p>Add these variables to your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file:</p>
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                    {`# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Telegram (optional)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789`}
                                </pre>
                                <p className="text-gray-500">After updating .env, restart the server with <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
