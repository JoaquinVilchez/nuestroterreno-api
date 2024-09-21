import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('El usuario no existe');

    return user;
  }

  async getOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user)
      throw new NotFoundException(
        `No existe ningun usuario con el email ${email}`,
      );

    return user;
  }

  async editOne(id: number, dto: EditUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...dto,
    });

    if (!user) throw new NotFoundException('El usuario no existe');

    return await this.userRepository.save(user);
  }

  async deleteOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('El usuario no existe');

    return await this.userRepository.delete(id);
  }
}
