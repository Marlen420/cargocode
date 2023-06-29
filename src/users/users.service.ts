import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user: User = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    createUserDto.password = await this.hashPassword(createUserDto.password);
    await this.userRepository.save(createUserDto);

    return `User with phone number:${createUserDto.phone} is registered`;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByPhone(phone: string): Promise<User> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
  async remove(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete({ id });
  }
  private async hashPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pass, salt);
  }
  private async validatePassword(
    pass: string,
    hashPass: string,
  ): Promise<boolean> {
    return bcrypt.compare(pass, hashPass);
  }
}
