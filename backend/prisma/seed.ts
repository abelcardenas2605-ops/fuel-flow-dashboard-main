import { PrismaClient, Role, FuelTypeEnum, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gasstation.com' },
        update: {
            role: Role.ADMIN, // Force Admin role on every seed run
            password: 'hashed_password_here' // Ensure password is consistent
        },
        create: {
            email: 'admin@gasstation.com',
            name: 'Admin User',
            password: 'hashed_password_here', // In real app, hash this!
            role: Role.ADMIN,
        },
    });

    const consumer = await prisma.user.upsert({
        where: { email: 'consumer@example.com' },
        update: {},
        create: {
            email: 'consumer@example.com',
            name: 'John Doe',
            password: 'hashed_password_here',
            role: Role.CONSUMER,
        },
    });

    // 2. Create Fuel Types
    const fuels = [
        { name: FuelTypeEnum.REGULAR_87, price: 4.50, stock: 5000 },
        { name: FuelTypeEnum.PREMIUM_91, price: 5.20, stock: 3000 },
        { name: FuelTypeEnum.DIESEL, price: 4.80, stock: 8000 },
    ];

    for (const f of fuels) {
        await prisma.fuelType.upsert({
            where: { name: f.name },
            update: {
                currentPrice: f.price,
                stockLevel: f.stock,
            },
            create: {
                name: f.name,
                currentPrice: f.price,
                stockLevel: f.stock,
                unit: 'Gallons',
            },
        });
    }

    // 3. Create Vehicle for Consumer
    await prisma.vehicle.upsert({
        where: { plate: 'ABC-123' },
        update: {},
        create: {
            plate: 'ABC-123',
            type: VehicleType.CAR,
            tankCapacity: 15,
            userId: consumer.id,
        },
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
