// src/users/entities/admin.entity.ts
import { Entity, Column, ChildEntity } from 'typeorm';
import { User } from './user.entity';
import { RoleUser } from '../enums/role-user.enum';

@ChildEntity('ADMIN')
export class Admin extends User {
  constructor() {
    super();
    this.role = RoleUser.ADMIN;
  }

  @Column({ 
    name: 'niveau_acces',
    nullable: true 
  })
  niveauAcces?: string; // COMPLET, LIMITE, etc.

  @Column({ 
    name: 'est_super_admin',
    default: false 
  })
  estSuperAdmin?: boolean;

  @Column({ nullable: true })
  departement?: string;

  @Column({ 
    name: 'permissions_speciales',
    nullable: true 
  })
  permissionsSpeciales?: string;
}