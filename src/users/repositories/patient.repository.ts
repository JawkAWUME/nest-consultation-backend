import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { RoleUser } from '../enums/role-user.enum';

@Injectable()
export class PatientRepository extends Repository<Patient> {
  constructor(private dataSource: DataSource) {
    super(Patient, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<Patient | null> {
    return this.createQueryBuilder('patient')
      .where('patient.coordonnees.email = :email', { email })
      .getOne();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.createQueryBuilder('patient')
      .where('patient.coordonnees.email = :email', { email })
      .getCount();
    
    return count > 0;
  }

  async findByRole(role: RoleUser): Promise<Patient[]> {
    return this.find({ where: { role } });
  }

  async countByRole(role: RoleUser): Promise<number> {
    return this.count({ where: { role } });
  }

  async countByEnabled(enabled: boolean): Promise<number> {
    return this.count({ where: { enabled } });
  }

  async findBySearchTerm(searchTerm: string): Promise<Patient[]> {
    return this.createQueryBuilder('patient')
      .where('LOWER(patient.nom) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orWhere('LOWER(patient.prenom) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .orWhere('LOWER(patient.coordonnees.email) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  async countByRoleAndYear(role: RoleUser, year: number): Promise<number> {
    return this.createQueryBuilder('patient')
      .where('patient.role = :role', { role })
      .andWhere('EXTRACT(YEAR FROM patient.dateCreation) = :year', { year })
      .getCount();
  }

  async findByLieuNaissance(lieuNaissance: string): Promise<Patient[]> {
    return this.find({ where: { lieuNaissance } });
  }

  async findBySituationFamiliale(situationFamiliale: string): Promise<Patient[]> {
    return this.find({ where: { situationFamiliale } });
  }

  async findByMatricule(matricule: string): Promise<Patient | null> {
    return this.findOne({ where: { matricule } });
  }

  async findByNomAndPrenom(nom: string, prenom: string): Promise<Patient | null> {
    return this.createQueryBuilder('patient')
      .where('LOWER(patient.nom) = LOWER(:nom)', { nom })
      .andWhere('LOWER(patient.prenom) = LOWER(:prenom)', { prenom })
      .getOne();
  }
}