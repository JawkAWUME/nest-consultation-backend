import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, LessThan } from 'typeorm';

import { ProSante } from '../../users/entities/pro-sante.entity';
import { RendezVous } from 'src/rendez-vous/entities/rendez-vous.entity';

@Injectable()
export class RendezVousRepository extends Repository<RendezVous> {
  constructor(private dataSource: DataSource) {
    super(RendezVous, dataSource.createEntityManager());
  }

  async findByPatientId(patientId: number): Promise<RendezVous[]> {
    return this.find({ 
      where: { patient: { id: patientId } },
      relations: ['prosante'],
      order: { dateHeure: 'ASC' }
    });
  }

  async findByProsanteId(proSanteId: number): Promise<RendezVous[]> {
    return this.find({ 
      where: { prosante: { id: proSanteId } },
      relations: ['patient'],
      order: { dateHeure: 'ASC' }
    });
  }

  async findByProsanteIdAndDateHeureAfter(professionnelId: number, dateHeure: Date): Promise<RendezVous[]> {
    return this.find({
      where: {
        prosante: { id: professionnelId },
        dateHeure: Between(dateHeure, new Date(dateHeure.getTime() + 24 * 60 * 60 * 1000))
      },
      relations: ['patient'],
      order: { dateHeure: 'ASC' }
    });
  }

  async findByDateHeureBetween(start: Date, end: Date): Promise<RendezVous[]> {
    return this.find({
      where: { dateHeure: Between(start, end) },
      relations: ['patient', 'prosante']
    });
  }

  async findByDateHeureBefore(dateTime: Date): Promise<RendezVous[]> {
    return this.find({
      where: { dateHeure: LessThan(dateTime) },
      relations: ['patient', 'prosante']
    });
  }

  async findByProsanteAndDateHeure(prosante: ProSante, dateHeure: Date): Promise<RendezVous[]> {
    return this.find({
      where: { 
        prosante,
        dateHeure
      }
    });
  }

  async findByProsanteAndDate(prosante: ProSante, date: Date): Promise<RendezVous[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return this.createQueryBuilder('rendezVous')
      .where('rendezVous.prosante = :prosante', { prosante: prosante.id })
      .andWhere('rendezVous.dateHeure BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();
  }
}