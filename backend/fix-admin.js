const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdmin() {
    console.log('🔍 Verificando usuario admin...');

    // Buscar el usuario admin
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@gasstation.com' }
    });

    if (!admin) {
        console.log('❌ Usuario admin no existe. Creándolo...');
        await prisma.user.create({
            data: {
                email: 'admin@gasstation.com',
                name: 'Admin User',
                password: 'hashed_password_here',
                role: 'ADMIN'
            }
        });
        console.log('✅ Usuario admin creado');
    } else {
        console.log('📋 Usuario encontrado:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Nombre: ${admin.name}`);
        console.log(`   Rol ACTUAL: ${admin.role}`);

        if (admin.role !== 'ADMIN') {
            console.log('⚠️  Rol incorrecto. Corrigiendo...');
            await prisma.user.update({
                where: { id: admin.id },
                data: { role: 'ADMIN' }
            });
            console.log('✅ Rol actualizado a ADMIN');
        } else {
            console.log('✅ Rol ya es ADMIN');
        }
    }

    // Verificar de nuevo
    const verified = await prisma.user.findUnique({
        where: { email: 'admin@gasstation.com' }
    });

    console.log('\n📊 Estado final:');
    console.log(`   Email: ${verified.email}`);
    console.log(`   Rol: ${verified.role}`);
    console.log('\n✅ Corrección completada. Ahora:');
    console.log('   1. Cierra sesión en el navegador');
    console.log('   2. Borra localStorage (F12 > Console > localStorage.clear())');
    console.log('   3. Vuelve a iniciar sesión');

    await prisma.$disconnect();
}

fixAdmin()
    .catch(console.error)
    .finally(() => process.exit(0));
