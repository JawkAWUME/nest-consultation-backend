import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';


// 🔐 Import des décorateurs de rôles
import {
  PatientOnly,
  ProSanteOnly,
  AdminOnly,
  PatientOrPro,
  ProOrAdmin,
} from '../../auth/decorators/role-guards.decorator';
import { ProSanteDto } from 'src/users/dto/pro-sante.dto';
import { CreateRendezVousDto } from '../dto/create-rendez-vous.dto';
import { RechercheProDto } from '../dto/recherche-pro.dto';
import { RendezVousDto } from '../dto/rendez-vous.dto';
import { TourneeOptimiseeDto } from '../dto/tournee-optimisee.dto';
import { UpdateRendezVousDto } from '../dto/update-rendez-vous.dto';
import { RendezVousService } from '../services/rendez-vous.service';

@ApiTags('Rendez-vous')
@ApiBearerAuth()
@Controller('api/rendezvous')
export class RendezVousController {
  constructor(private readonly service: RendezVousService) {}

  @Post()
  @PatientOnly() // ✅ Seul un patient peut créer un rendez-vous
  @ApiOperation({ summary: 'Créer un nouveau rendez-vous (patients seulement)' })
  async creer(@Body() dto: CreateRendezVousDto): Promise<RendezVousDto> {
    return this.service.creerRendezVous(dto);
  }

  @Delete(':id')
  @PatientOrPro() // ✅ Patient ou professionnel peut annuler
  @ApiOperation({ summary: 'Annuler un rendez-vous (patients ou pros)' })
  async annuler(@Param('id') id: number): Promise<void> {
    await this.service.annulerRendezVous(id);
  }

  @Get('patient/:id')
  @ProOrAdmin() // ✅ Pros et admin peuvent consulter les rendez-vous d’un patient
  @ApiOperation({ summary: 'Lister les rendez-vous d’un patient (pros/admin)' })
  async lister(@Param('id') id: number): Promise<RendezVousDto[]> {
    return this.service.listerRendezVousParPatient(id);
  }

  @Get('pro/:id')
  @PatientOrPro() // ✅ Patient ou pro peut consulter les rendez-vous d’un professionnel
  @ApiOperation({ summary: 'Lister les rendez-vous d’un professionnel (patients/pros)' })
  async listerPro(@Param('id') id: number): Promise<RendezVousDto[]> {
    return this.service.listerRendezVousParPro(id);
  }

  @Put(':id')
  @ProSanteOnly() // ✅ Seul un professionnel peut modifier un rendez-vous
  @ApiOperation({ summary: 'Modifier un rendez-vous (pros seulement)' })
  async modifier(
    @Param('id') id: number,
    @Body() dto: UpdateRendezVousDto,
  ): Promise<RendezVousDto> {
    const rdv = await this.service.modifierRendezVous(id, dto);
    if (!rdv) {
      throw new NotFoundException(`Rendez-vous avec ID ${id} non trouvé`);
    }
    return rdv;
  }

  @Post('recherche')
  @PatientOrPro() // ✅ Patients et pros peuvent rechercher des professionnels
  @ApiOperation({ summary: 'Rechercher des professionnels (patients/pros)' })
  async rechercher(@Body() criteres: RechercheProDto): Promise<ProSanteDto[]> {
    return this.service.rechercherProfessionnels(criteres);
  }

  @Post('test-rappel')
  @AdminOnly() // ✅ Seul un admin peut tester l’envoi des rappels
  @ApiOperation({ summary: 'Tester l’envoi des rappels (admin seulement)' })
  async testerRappel(): Promise<string> {
    await this.service.envoyerRappels();
    return 'Rappels envoyés !';
  }

  @Get('optimiser-tournee/:id')
  @ProSanteOnly() // ✅ Seul un professionnel peut optimiser sa tournée
  @ApiOperation({ summary: 'Optimiser une tournée médicale (pros seulement)' })
  async optimiserTournee(
    @Param('id') id: number,
  ): Promise<TourneeOptimiseeDto> {
    return this.service.optimiserTournee(id);
  }

  @Get('statistiques/:proId')
  @ProOrAdmin() // ✅ Pros et admin peuvent consulter les stats
  @ApiOperation({ summary: 'Statistiques hebdomadaires d’un professionnel (pros/admin)' })
  async statistiques(@Param('proId') proId: number): Promise<any> {
    return this.service.statistiquesHebdo(proId);
  }

  @Get('creneaux-disponibles')
  @PatientOrPro() // ✅ Patients et pros peuvent consulter les créneaux
  @ApiOperation({ summary: 'Créneaux disponibles d’un professionnel (patients/pros)' })
  async getCreneauxDisponibles(
    @Query('proId') proId: number,
    @Query('date') date: Date,
  ): Promise<Date[]> {
    return this.service.getCreneauxDisponibles(proId, new Date(date));
  }

  @Get('carte-patients/:proId')
  @ProSanteOnly() // ✅ Seul un professionnel peut voir la carte de ses patients
  @ApiOperation({ summary: 'Carte des patients d’un professionnel (pros seulement)' })
  async getCartePatients(@Param('proId') proId: number): Promise<any[]> {
    return this.service.getCartePatients(proId);
  }
}
