import { Logger, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Patient } from './entities/patient.entity';
import { ProSante } from './entities/pro-sante.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { PatientRepository } from './repositories/patient.repository';
import { ProSanteRepository } from './repositories/pro-sante.repository';
// REMOVE this line: import { RendezVous } from '../rendez-vous/entities/rendez-vous.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Patient, ProSante])],
  providers: [UsersService, PatientRepository, ProSanteRepository],
  controllers: [UsersController],
  exports: [
    UsersService, 
    TypeOrmModule, 
    PatientRepository, 
    ProSanteRepository
  ],
})
export class UsersModule {
  
}