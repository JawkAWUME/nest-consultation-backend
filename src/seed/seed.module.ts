// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Admin } from '../users/entities/admin.entity';
import { Patient } from '../users/entities/patient.entity';
import { ProSante } from '../users/entities/pro-sante.entity';
import { RendezVous } from '../rendez-vous/entities/rendez-vous.entity';
import { UsersModule } from 'src/users/users.module';
import { RendezVousModule } from 'src/rendez-vous/rendez-vous.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RendezVousModule,
    TypeOrmModule.forFeature([Admin, Patient, ProSante, RendezVous]), // ✅ ajoute les entités ici
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
