// src/rendez-vous/entities/rendez-vous.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../users/entities/patient.entity';
import { ProSante } from '../../users/entities/pro-sante.entity';

@Entity('rendez_vous')
export class RendezVous {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'date_heure',
    type: 'timestamp',
  })
  dateHeure: Date;

  @Column({ nullable: true})
  statut: string; // Ex: 'EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE'

  @ManyToOne(
    () => Patient,
    patient => patient.rendezVous,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(
    () => ProSante,
    proSante => proSante.rendezVous,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'prosante_id' })
  prosante: ProSante;

  @CreateDateColumn({
    name: 'date_creation',
    update: false,
  })
  dateCreation: Date;

  @UpdateDateColumn({
    name: 'date_modification',
  })
  dateModification: Date;

  // Méthodes utilitaires si nécessaire
  isConfirmed(): boolean {
    return this.statut === 'CONFIRME';
  }

  isCancelled(): boolean {
    return this.statut === 'ANNULE';
  }

  isCompleted(): boolean {
    return this.statut === 'TERMINE';
  }
}