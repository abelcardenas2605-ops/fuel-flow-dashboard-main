import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        // In a real app, use bcrypt.compare(pass, user.password)
        // For this MVP/Demo we assume simple check (or if seed has plaintext)
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    }

    async register(userDto: any) {
        // Check if exists
        const existing = await this.usersService.findOne(userDto.email);
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }
        return this.usersService.create(userDto);
    }
}
