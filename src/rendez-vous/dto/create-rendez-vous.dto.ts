import { IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO pour les informations patient minimales lors de la création
export class PatientCreateDto {
  @ApiProperty({ description: 'Nom du patient', example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du patient', example: 'Jean' })
  @IsString()
  prenom: string;
}

export class CreateRendezVousDto {
  @ApiProperty({ 
    description: 'Date et heure du rendez-vous', 
    example: '2024-12-25T14:30:00' 
  })
  @IsDate()
  @Type(() => Date)
  dateHeure: Date;

  @ApiProperty({ 
    description: 'Informations du patient', 
    type: () => PatientCreateDto 
  })
  @ValidateNested()
  @Type(() => PatientCreateDto)
  patient: PatientCreateDto;

  @ApiPropertyOptional({ 
    description: 'ID du professionnel de santé (si non spécifié, trouvé automatiquement)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prosanteId?: number;

  @ApiPropertyOptional({ 
    description: 'Spécialité recherchée (requise si pas de prosanteId)', 
    example: 'Cardiologue' 
  })
  @IsOptional()
  @IsString()
  specialite?: string;
}