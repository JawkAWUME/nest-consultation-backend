import { IsString, IsOptional, IsNumber, IsEmail, IsEnum, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RoleUser } from '../enums/role-user.enum';

export class PatientDto {
  @ApiPropertyOptional({ description: 'ID du patient' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Nom du patient', example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du patient', example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiProperty({ description: 'Sexe du patient', example: 'Masculin' })
  @IsString()
  sexe: string;

  @ApiProperty({ description: 'Matricule du patient', example: 'PAT123456' })
  @IsString()
  matricule: string;

  @ApiProperty({ description: 'Lieu de naissance', example: 'Paris' })
  @IsString()
  lieuNaissance: string;

  @ApiProperty({ description: 'Date de naissance', example: '1990-01-15' })
  @IsDate()
  @Type(() => Date)
  dateNaissance: Date;

  @ApiProperty({ description: 'Situation familiale', example: 'Célibataire' })
  @IsString()
  situationFamiliale: string;

  @ApiProperty({ description: 'Adresse complète', example: '123 Rue de Paris, 75001 Paris' })
  @IsString()
  adresse: string;

  @ApiProperty({ description: 'Email du patient', example: 'jean.dupont@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Téléphone du patient', example: '+33123456789' })
  @IsString()
  telephone: string;

  @ApiPropertyOptional({ description: 'Latitude géographique' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude géographique' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ 
    description: 'Rôle de l\'utilisateur', 
    enum: RoleUser,
    example: RoleUser.PATIENT 
  })
  @IsEnum(RoleUser)
  role: RoleUser;

  // ===== Conversion Entity → DTO =====
  static fromEntity(patient: any): PatientDto | null {
    if (!patient) {
      return null;
    }

    const coord = patient.coordonnees;

    const dto = new PatientDto();
    dto.id = patient.id;
    dto.nom = patient.nom;
    dto.prenom = patient.prenom;
    dto.sexe = patient.sexe;
    dto.matricule = patient.matricule;
    dto.lieuNaissance = patient.lieuNaissance;
    dto.dateNaissance = patient.dateNaissance;
    dto.situationFamiliale = patient.situationFamiliale;
    dto.adresse = coord ? coord.adresse : null;
    dto.email = coord ? coord.email : null;
    dto.telephone = coord ? coord.numeroTelephone : null;
    dto.latitude = patient.latitude;
    dto.longitude = patient.longitude;
    dto.role = patient.role;

    return dto;
  }

  // ===== Conversion DTO → Entity =====
  static toEntity(dto: PatientDto | null): any | null {
    if (!dto) {
      return null;
    }

    const patient: any = {};
    if (dto.id !== undefined) patient.id = dto.id;
    patient.nom = dto.nom;
    patient.prenom = dto.prenom;
    patient.sexe = dto.sexe;
    patient.matricule = dto.matricule;
    patient.lieuNaissance = dto.lieuNaissance;
    patient.dateNaissance = dto.dateNaissance;
    patient.situationFamiliale = dto.situationFamiliale;
    patient.latitude = dto.latitude;
    patient.longitude = dto.longitude;
    patient.role = dto.role;

    patient.coordonnees = {
      adresse: dto.adresse,
      email: dto.email,
      numeroTelephone: dto.telephone
    };

    return patient;
  }
}