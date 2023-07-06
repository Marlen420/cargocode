import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { CompaniesModule } from './companies/companies.module';
import { MapboxModule } from './mapbox/mapbox.module';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { TrimbleModule } from './trimble/trimble.module';
import { UsersModule } from './users/users.module';
import { StripeController } from './stripe/stripe.controller';
import { StripeModule } from './stripe/stripe.module';
import { SocketModule } from './socket/socket.module';
import { SocketGateway } from './socket/socket.gateway';
import { AwsS3Module } from './aws-s3/aws-s3.module';

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
    CompaniesModule,
    AuthModule,
    MapboxModule,
    OrdersModule,
    TrimbleModule,
    StripeModule,
    AwsS3Module,
  ],
  controllers: [StripeController],
  providers: [
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    SocketGateway
  ],
})
export class AppModule {}
