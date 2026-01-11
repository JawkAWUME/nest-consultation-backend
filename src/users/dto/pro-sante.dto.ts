import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoleUser } from '../enums/role-user.enum';

export class ProSanteDto {
  @ApiPropertyOptional({ description: 'ID du professionnel de santé' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Nom du professionnel', example: 'Martin' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du professionnel', example: 'Sophie' })
  @IsString()
  prenom: string;

  @ApiProperty({ description: 'Spécialité médicale', example: 'Cardiologue' })
  @IsString()
  specialite: string;

  @ApiProperty({ 
    description: 'Rôle de l\'utilisateur', 
    enum: RoleUser,
    example: RoleUser.PRO_SANTE 
  })
  @IsEnum(RoleUser)
  role: RoleUser;

  @ApiProperty({ description: 'Tarif de consultation', example: 120.5 })
  @IsNumber()
  @Type(() => Number)
  tarif: number;

  @ApiPropertyOptional({ description: 'Latitude géographique', example: 48.8566 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude géographique', example: 2.3522 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Distance en kilomètres (calculée)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distanceKm?: number;

  // ===== Conversion Entity → DTO =====
  static fromEntity(proSante: any): ProSanteDto | null {
    if (!proSante) {
      return null;
    }

    const dto = new ProSanteDto();
    dto.id = proSante.id;
    dto.nom = proSante.nom;  // Assurez-vous que l'entité a bien la propriété 'nom'
    dto.prenom = proSante.prenom;
    dto.specialite = proSante.specialite;
    dto.tarif = proSante.tarif;
    dto.latitude = proSante.latitude;
    dto.longitude = proSante.longitude;
    dto.role = proSante.role;
    // distanceKm sera probablement calculée ailleurs

    return dto;
  }

  // ===== Conversion DTO → Entity =====
  static toEntity(dto: ProSanteDto | null): any | null {
    if (!dto) {
      return null;
    }

    const proSante: any = {};
    if (dto.id !== undefined) proSante.id = dto.id;
    proSante.nom = dto.nom;
    proSante.prenom = dto.prenom;
    proSante.specialite = dto.specialite;
    proSante.tarif = dto.tarif;
    proSante.latitude = dto.latitude;
    proSante.longitude = dto.longitude;
    proSante.role = dto.role;

    return proSante;
  }
}