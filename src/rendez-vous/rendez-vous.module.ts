import { Logger, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVous } from './entities/rendez-vous.entity';
import { RendezVousController } from './controllers/rendez-vous.controller';
import { RendezVousService } from './services/rendez-vous.service';
import { EmailService } from '../email/email.service';
import { WebsocketService } from '../websocket/websocket.service';
import { UsersModule } from 'src/users/users.module';
import { Patient } from 'src/users/entities/patient.entity';
import { ProSante } from 'src/users/entities/pro-sante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RendezVous, Patient, ProSante]), // Ajoutez Patient et ProSante ici
    forwardRef(() => UsersModule), // Utilisez forwardRef pour éviter la dépendance circulaire
  ],
  providers: [
    RendezVousService,
    EmailService
  ],
  controllers: [RendezVousController],
  exports: [RendezVousService],
})
export class RendezVousModule {
  
}