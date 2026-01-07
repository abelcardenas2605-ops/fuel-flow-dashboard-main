import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return 'Welcome to Gas Station API! Go to /api/docs for documentation.';
    }
}
