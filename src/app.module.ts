import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { MapboxModule } from './mapbox/mapbox.module';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { UsersModule } from './users/users.module';

config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    MapboxModule,
    OrdersModule
  ],
  controllers: [],
  providers: [RedisService],
})
export class AppModule {}
