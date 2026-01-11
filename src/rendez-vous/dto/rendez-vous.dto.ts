import { IsNumber, IsString, IsDate, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { PatientDto } from 'src/users/dto/patient.dto';
import { ProSanteDto } from 'src/users/dto/pro-sante.dto';

export class RendezVousDto {
  @ApiPropertyOptional({ description: 'ID du rendez-vous' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Patient associé au rendez-vous', type: () => PatientDto })
  @ValidateNested()
  @Type(() => PatientDto)
  patient: PatientDto | null;

  @ApiProperty({ description: 'Professionnel de santé associé', type: () => ProSanteDto })
  @ValidateNested()
  @Type(() => ProSanteDto)
  proSante: ProSanteDto | null;

  @ApiProperty({ description: 'Date et heure du rendez-vous', example: '2024-12-25T14:30:00' })
  @IsDate()
  @Type(() => Date)
  dateHeure: Date;

  @ApiProperty({ 
    description: 'Statut du rendez-vous', 
    example: 'EN_ATTENTE',
    enum: ['EN_ATTENTE', 'CONFIRMÉ', 'ANNULÉ', 'NON_HONORE', 'TERMINE']
  })
  @IsString()
  statut: string;

  // Méthodes statiques pour la conversion (optionnel)
  static fromEntity(entity: any): RendezVousDto |null {
    if (!entity) return null;

    const dto = new RendezVousDto();
    dto.id = entity.id;
    dto.patient = PatientDto.fromEntity(entity.patient);
    dto.proSante = ProSanteDto.fromEntity(entity.prosante || entity.proSante);
    dto.dateHeure = entity.dateHeure;
    dto.statut = entity.statut;

    return dto;
  }

  static toEntity(dto: RendezVousDto): any | null {
    if (!dto) return null;

    const entity: any = {};
    if (dto.id !== undefined) entity.id = dto.id;
    entity.patient = PatientDto.toEntity(dto.patient);
    entity.prosante = ProSanteDto.toEntity(dto.proSante);
    entity.dateHeure = dto.dateHeure;
    entity.statut = dto.statut;

    return entity;
  }

  static fromEntities(entities: any): RendezVousDto[] | null {
    if (!entities) return null;
    return entities.map(entity => RendezVousDto.fromEntity(entity));
  }
}