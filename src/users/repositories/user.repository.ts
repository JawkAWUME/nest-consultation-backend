import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RoleUser } from '../enums/role-user.enum';

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.coordonnees.email = :email', { email })
      .addSelect('user.motDePasse')
      .getOne();
  }

  async findByTelephone(numeroTelephone: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.coordonnees.numeroTelephone = :numeroTelephone', { numeroTelephone })
      .getOne();
  }

  async searchByAdresse(adresse: string): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('LOWER(user.coordonnees.adresse) LIKE LOWER(:adresse)', { adresse: `%${adresse}%` })
      .getMany();
  }

  async countByRoleAndYear(role: RoleUser, year: number): Promise<number> {
    return this.createQueryBuilder('user')
      .where('user.role = :role', { role })
      .andWhere('EXTRACT(YEAR FROM user.dateCreation) = :year', { year })
      .getCount();
  }

  async countByRole(role: RoleUser): Promise<number> {
    return this.count({ where: { role } });
  }

  async countEnabled(): Promise<number> {
    return this.count({ where: { enabled: true } });
  }

  async findBySearchTerm(search: string, page: number = 1, limit: number = 10): Promise<[User[], number]> {
    const query = this.createQueryBuilder('user')
      .where('LOWER(user.nom) LIKE LOWER(:search)', { search: `%${search}%` })
      .orWhere('LOWER(user.prenom) LIKE LOWER(:search)', { search: `%${search}%` })
      .orWhere('LOWER(user.coordonnees.email) LIKE LOWER(:search)', { search: `%${search}%` });

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return [users, total];
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.createQueryBuilder('user')
      .where('user.coordonnees.email = :email', { email })
      .getCount();
    
    return count > 0;
  }
}