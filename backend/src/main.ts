import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // CORS
    app.enableCors({
        origin: '*', // Allow all for development
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    // Swagger Configuration
    const config = new DocumentBuilder()
        .setTitle('Gas Station API')
        .setDescription('The Gas Station Management API description')
        .setVersion('1.0')
        .addTag('transactions')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000 (CORS Enabled)');
}
bootstrap();
