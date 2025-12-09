import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    const products = [
        {
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling headphones with 30h battery life.',
            price: 199.99,
            stock: 50,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            status: 'ACTIVE',
        },
        {
            name: 'Smart Watch',
            description: 'Fitness tracker with heart rate monitor and GPS.',
            price: 149.50,
            stock: 30,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            status: 'ACTIVE',
        },
        {
            name: 'Mechanical Keyboard',
            description: 'RGB mechanical keyboard with Cherry MX Blue switches.',
            price: 120.00,
            stock: 20,
            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=800&q=80',
            status: 'ACTIVE',
        },
        {
            name: 'Gaming Mouse',
            description: 'High-precision gaming mouse with programmable buttons.',
            price: 59.99,
            stock: 100,
            imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
            status: 'ACTIVE',
        },
        {
            name: 'Laptop Stand',
            description: 'Ergonomic aluminum laptop stand for better posture.',
            price: 45.00,
            stock: 75,
            imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
            status: 'ACTIVE',
        },
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log(`✅ Seeded ${products.length} products`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
