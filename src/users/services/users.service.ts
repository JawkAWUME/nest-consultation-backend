import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { RoleUser } from '../enums/role-user.enum';
import { UserDto } from 'src/auth/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  /* ==================== CREATE ==================== */
  async create(dto: UserDto): Promise<User> {
    if (!dto.email) {
      throw new ConflictException('Email requis');
    }

    const exists = await this.userRepository.existsByEmail(dto.email);

    if (exists) {
      throw new ConflictException(
        'Un utilisateur avec cet email existe déjà',
      );
    }

    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  /* ==================== READ ==================== */

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec ID ${id} introuvable`,
      );
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /* ==================== READ BY ROLE ==================== */

  async findAllPatients(): Promise<User[]> {
    return this.findByRole(RoleUser.PATIENT);
  }

  async findAllProSante(): Promise<User[]> {
    return this.findByRole(RoleUser.PRO_SANTE);
  }

  async findAllAdmins(): Promise<User[]> {
    return this.findByRole(RoleUser.ADMIN);
  }

  private async findByRole(role: RoleUser): Promise<User[]> {
    return this.userRepository.find({
      where: { role },
    });
  }

  /* ==================== UPDATE ==================== */

  async update(id: number, dto: UserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async enableUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.enabled = true;
    return this.userRepository.save(user);
  }

  async disableUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.enabled = false;
    return this.userRepository.save(user);
  }

  /* ==================== DELETE ==================== */

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
