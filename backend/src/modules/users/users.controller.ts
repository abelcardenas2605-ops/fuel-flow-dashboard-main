import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
        return this.usersService.update(id, body);
    }
}
