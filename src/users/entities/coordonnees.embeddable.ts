import { Column } from "typeorm";
import { IsEmail, IsOptional } from 'class-validator';


// src/users/entities/coordonnees.embeddable.ts
export class Coordonnees {
  @Column({ nullable: true })
  @IsOptional()
  adresse?: string;

  @Column({ nullable: true })
  @IsOptional()
  numeroTelephone?: string;

  @Column({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;
}