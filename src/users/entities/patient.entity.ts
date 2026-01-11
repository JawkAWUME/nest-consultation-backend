// src/users/entities/patient.entity.ts
import { Entity, Column, ChildEntity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RoleUser } from '../enums/role-user.enum';
import { RendezVous } from '../../rendez-vous/entities/rendez-vous.entity';

@ChildEntity('PATIENT')
export class Patient extends User {
  constructor() {
    super();
    this.role = RoleUser.PATIENT;
  }

  @Column({ unique: true, nullable: true })
  matricule: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ 
    name: 'lieu_naissance',
    nullable: true 
  })
  lieuNaissance: string;

  @Column({ 
    name: 'date_naissance',
    type: 'date',
    nullable: true 
  })
  dateNaissance: Date;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ 
    name: 'situation_familiale',
    nullable: true 
  })
  situationFamiliale: string;

  @OneToMany(
    () => RendezVous, 
    rendezVous => rendezVous.patient,
    { cascade: true }
  )
  rendezVous: RendezVous[];
}