import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/redis/redis.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompanyEntity } from './entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity]), RedisModule, JwtModule],
  providers: [JwtService, CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
