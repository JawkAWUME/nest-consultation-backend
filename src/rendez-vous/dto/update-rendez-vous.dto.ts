import { IsDate, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateRendezVousDto {
  @ApiPropertyOptional({ 
    description: 'Nouvelle date et heure du rendez-vous', 
    example: '2024-12-25T15:30:00' 
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateHeure?: Date;

  @ApiPropertyOptional({ 
    description: 'Nouveau statut du rendez-vous', 
    example: 'CONFIRMÉ',
    enum: ['EN_ATTENTE', 'CONFIRMÉ', 'ANNULÉ', 'NON_HONORE', 'TERMINE']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['EN_ATTENTE', 'CONFIRMÉ', 'ANNULÉ', 'NON_HONORE', 'TERMINE'])
  statut?: string;

  @ApiPropertyOptional({ 
    description: 'ID du nouveau professionnel de santé', 
    example: 2
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prosanteId?: number;
}