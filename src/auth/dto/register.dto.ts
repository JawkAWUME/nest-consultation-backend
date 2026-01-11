import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleUser } from '../../users/enums/role-user.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'Admin',
  })
  @IsNotEmpty()
  @IsString()
  nom: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'System',
  })
  @IsNotEmpty()
  @IsString()
  prenom: string;

  @ApiProperty({
    description: 'Sexe',
    example: 'Masculin',
    enum: ['Masculin', 'Féminin', 'Autre'],
  })
  @IsNotEmpty()
  @IsString()
  sexe: string;

  @ApiProperty({
    description: 'Email de l\'utilisateur',
    example: 'admin@santeado.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'Admin123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  motDePasse: string;

    @ApiProperty({
        description: 'Numéro de téléphone',
        example: '771234567',
        required: false,
    })
    @IsOptional()
    @IsString()
    telephone?: string;

  @ApiProperty({
    description: 'Adresse',
    example: 'Siège Social, Dakar Plateau',
    required: false,
  })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    example: 'ADMIN',
    enum: RoleUser,
  })
  @IsNotEmpty()
  @IsEnum(RoleUser)
  role: RoleUser;

  // Champs spécifiques aux patients
  @ApiProperty({
    description: 'Matricule du patient',
    example: 'PAT-0001',
    required: false,
  })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({
    description: 'Date de naissance',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateNaissance?: string;

  @ApiProperty({
    description: 'Lieu de naissance',
    example: 'Dakar',
    required: false,
  })
  @IsOptional()
  @IsString()
  lieuNaissance?: string;

  @ApiProperty({
    description: 'Situation familiale',
    example: 'Célibataire',
    required: false,
  })
  @IsOptional()
  @IsString()
  situationFamiliale?: string;

  @ApiProperty({
    description: 'Latitude',
    example: 14.692778,
    required: false,
  })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude',
    example: -17.446667,
    required: false,
  })
  @IsOptional()
  longitude?: number;

  // Champs spécifiques aux professionnels de santé
  @ApiProperty({
    description: 'Spécialité',
    example: 'Cardiologue',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialite?: string;

  @ApiProperty({
    description: 'Description',
    example: 'Médecin spécialisé en cardiologie',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tarif de consultation',
    example: 15000,
    required: false,
  })
  @IsOptional()
  tarif?: number;
     @IsOptional()
    niveauAcces?: string;
     @IsOptional()
    estSuperAdmin: boolean;
     @IsOptional()
    departement: string;

}