import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
config();

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class AuthModule {}
