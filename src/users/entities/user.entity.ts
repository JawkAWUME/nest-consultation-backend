// src/users/entities/user.entity.ts (version mise à jour)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { RoleUser } from '../enums/role-user.enum';
import { Coordonnees } from './coordonnees.embeddable';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' , default: 'USER'} })
export abstract class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  nom: string;

  @Column()
  @Index()
  prenom: string;

  @Column()
  sexe: string;

  @Column({
    name: 'mot_de_passe',
    select: false, // Ne pas sélectionner par défaut
  })
  @Exclude()
  motDePasse: string;

  @Column(() => Coordonnees)
  coordonnees: Coordonnees;

  @Column({
    type: 'enum',
    enum: RoleUser,
  })
  role: RoleUser;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ 
    name: 'date_creation',
    update: false 
  })
  dateCreation: Date;

  @UpdateDateColumn({ 
    name: 'date_modification' 
  })
  dateModification: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.motDePasse) {
      const salt = await bcrypt.genSalt();
      this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.motDePasse);
  }

  // Méthodes de sécurité
  isAccountNonExpired(): boolean {
    return true;
  }

  isAccountNonLocked(): boolean {
    return true;
  }

  isCredentialsNonExpired(): boolean {
    return true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Méthode pour le nom complet
  getFullName(): string {
    return `${this.prenom} ${this.nom}`;
  }
}