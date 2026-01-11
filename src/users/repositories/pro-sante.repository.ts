import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProSante } from '../entities/pro-sante.entity';

@Injectable()
export class ProSanteRepository extends Repository<ProSante> {
  constructor(private dataSource: DataSource) {
    super(ProSante, dataSource.createEntityManager());
  }

  async findBySpecialiteContaining(specialite: string): Promise<ProSante[]> {
    return this.createQueryBuilder('proSante')
      .where('LOWER(proSante.specialite) LIKE LOWER(:specialite)', { specialite: `%${specialite}%` })
      .getMany();
  }

  async findByNomPrenomOrSpecialite(nom: string, specialite?: string): Promise<ProSante[]> {
    const query = this.createQueryBuilder('proSante');
    
    if (nom) {
      query.where('(LOWER(proSante.nom) LIKE LOWER(:nom) OR LOWER(proSante.prenom) LIKE LOWER(:nom))', { nom: `%${nom}%` });
    }
    
    if (specialite) {
      if (nom) {
        query.andWhere('LOWER(proSante.specialite) LIKE LOWER(:specialite)', { specialite: `%${specialite}%` });
      } else {
        query.where('LOWER(proSante.specialite) LIKE LOWER(:specialite)', { specialite: `%${specialite}%` });
      }
    }
    
    return query.getMany();
  }

  async findBySpecialite(specialite: string): Promise<ProSante[]> {
    return this.find({ where: { specialite } });
  }

  async findByTarifLessThanEqual(tarif: number): Promise<ProSante[]> {
    return this.createQueryBuilder('proSante')
      .where('proSante.tarif <= :tarif', { tarif })
      .getMany();
  }

  async findByNomAndPrenom(nom: string, prenom: string): Promise<ProSante | null> {
    return this.createQueryBuilder('proSante')
      .where('LOWER(proSante.nom) = LOWER(:nom)', { nom })
      .andWhere('LOWER(proSante.prenom) = LOWER(:prenom)', { prenom })
      .getOne();
  }
}