// src/users/entities/pro-sante.entity.ts
import { Entity, Column, ChildEntity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RoleUser } from '../enums/role-user.enum';
import { RendezVous } from '../../rendez-vous/entities/rendez-vous.entity';

@ChildEntity('PRO_SANTE')
export class ProSante extends User {
  constructor() {
    super();
    this.role = RoleUser.PRO_SANTE;
  }

  @Column({ nullable: true })
  specialite: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tarif: number;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @OneToMany(
    () => RendezVous, 
    rendezVous => rendezVous.prosante,
    { cascade: true }
  )
  rendezVous: RendezVous[];
}