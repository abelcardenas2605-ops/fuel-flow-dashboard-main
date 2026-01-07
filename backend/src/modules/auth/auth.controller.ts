import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() signInDto: Record<string, any>) {
        const user = await this.authService.validateUser(signInDto.email, signInDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() createUserDto: Record<string, any>) {
        // 1. Create User
        const user = await this.authService.register(createUserDto);
        // 2. Login immediately
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
