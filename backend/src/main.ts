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
        origin: process.env.ALLOWED_ORIGIN || '*', // Use env var or allow all for dev/testing
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
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

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port} (CORS Enabled)`);
}
bootstrap();
