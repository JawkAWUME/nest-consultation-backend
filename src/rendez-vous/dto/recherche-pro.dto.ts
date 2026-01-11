import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RechercheProDto {
  @ApiPropertyOptional({ description: 'Latitude de référence pour la recherche', example: 48.8566 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude de référence pour la recherche', example: 2.3522 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Spécialité recherchée', example: 'Cardiologue' })
  @IsOptional()
  @IsString()
  specialite?: string;

  @ApiPropertyOptional({ description: 'Tarif maximum', example: 150 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tarifMax?: number;

  @ApiPropertyOptional({ description: 'Rayon de recherche en kilomètres', example: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  rayonKm?: number;
}