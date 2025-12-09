import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(process.cwd(), '.env');

const questions = [
    { key: 'DATABASE_URL', question: 'Enter DATABASE_URL (default: "file:./dev.db"): ', default: 'file:./dev.db' },
    { key: 'STRIPE_SECRET_KEY', question: 'Enter STRIPE_SECRET_KEY: ' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', question: 'Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ' },
    { key: 'TELEGRAM_BOT_TOKEN', question: 'Enter TELEGRAM_BOT_TOKEN: ' },
    { key: 'TELEGRAM_CHAT_ID', question: 'Enter TELEGRAM_CHAT_ID: ' },
];

async function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log('🔧 Setting up environment variables...');

    let envContent = '';
    if (fs.existsSync(envPath)) {
        console.log('Found existing .env file. Reading...');
        envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const newEnv: Record<string, string> = {};

    // Parse existing env
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            newEnv[key.trim()] = value.trim();
        }
    });

    for (const q of questions) {
        const currentValue = newEnv[q.key];
        const prompt = currentValue ? `${q.question}[${currentValue}]: ` : q.question;

        const answer = await ask(prompt);

        if (answer) {
            newEnv[q.key] = answer;
        } else if (!currentValue && q.default) {
            newEnv[q.key] = q.default;
        }
    }

    // Write back to .env
    const newContent = Object.entries(newEnv)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(envPath, newContent);
    console.log('✅ .env file updated successfully!');

    rl.close();
}

main().catch(console.error);
