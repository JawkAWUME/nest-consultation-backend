import { Controller, Post, Delete, Get, Put, Body, Param, Query, UseInterceptors, ParseIntPipe} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PatientOnly, ProSanteOnly, AdminOnly, PatientOrPro, ProOrAdmin } from '../../auth/decorators/role-guards.decorator';
import { ProSanteDto } from 'src/users/dto/pro-sante.dto';
import { CreateRendezVousDto } from '../dto/create-rendez-vous.dto';
import { RechercheProDto } from '../dto/recherche-pro.dto';
import { RendezVousDto } from '../dto/rendez-vous.dto';
import { TourneeOptimiseeDto } from '../dto/tournee-optimisee.dto';
import { UpdateRendezVousDto } from '../dto/update-rendez-vous.dto';
import { RendezVousService } from '../services/rendez-vous.service';
import { ParseDatePipe } from 'src/common/pipes/parse-date.pipe';

@ApiTags('Rendez-vous')
@ApiBearerAuth()
@Controller('api/rendezvous')
@UseInterceptors(CacheInterceptor)
export class RendezVousController {
  constructor(private readonly service: RendezVousService) {}

  @Post()
  @PatientOnly()
  @ApiOperation({ summary: 'Créer un rendez-vous' })
  async creer(@Body() dto: CreateRendezVousDto): Promise<RendezVousDto> {
    return this.service.creerRendezVous(dto);
  }

  @Delete(':id')
  @PatientOrPro()
  @ApiOperation({ summary: 'Annuler un rendez-vous' })
  async annuler(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.annulerRendezVous(id);
  }

  @Get('patient/:id')
  @ProOrAdmin()
  @CacheTTL(30)
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiOperation({ summary: 'Lister les rendez-vous d\'un patient' })
  async lister(
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate', new ParseDatePipe({ optional: true })) startDate?: Date,
    @Query('endDate', new ParseDatePipe({ optional: true })) endDate?: Date,
  ): Promise<RendezVousDto[]> {
    // Limiter la période pour éviter des chargements trop lourds
    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30); // 30 jours max
    
    return this.service.listerRendezVousParPatient(
      id
    );
  }

  @Get('pro/:id')
  @PatientOrPro()
  @CacheTTL(30)
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiOperation({ summary: 'Lister les rendez-vous d\'un professionnel' })
  async listerPro(
    @Param('id', ParseIntPipe) id: number,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ): Promise<RendezVousDto[]> {
    // Se limiter à une journée spécifique
    const targetDate = date || new Date();
    return this.service.listerRendezVousParPro(id);
  }

  @Put(':id')
  @ProSanteOnly()
  @ApiOperation({ summary: 'Modifier un rendez-vous' })
  async modifier(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRendezVousDto,
  ): Promise<RendezVousDto> {
    return this.service.modifierRendezVous(id, dto);
  }

  @Post('recherche')
  @PatientOrPro()
  @CacheTTL(60) // Cache 1 minute pour les recherches fréquentes
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Rechercher des professionnels' })
  async rechercher(
    @Body() criteres: RechercheProDto,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20
  ): Promise<ProSanteDto[]> {
    // Limiter le nombre de résultats
    const safeLimit = Math.min(limit, 50);
    return this.service.rechercherProfessionnels(criteres);
  }

  @Get('optimiser-tournee/:id')
  @ProSanteOnly()
  @CacheTTL(300) // Cache long car calcul coûteux
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiOperation({ summary: 'Optimiser une tournée médicale' })
  async optimiserTournee(
    @Param('id', ParseIntPipe) id: number,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ): Promise<TourneeOptimiseeDto> {
    const targetDate = date || new Date();
    return this.service.optimiserTournee(id);
  }

  @Get('statistiques/:proId')
  @ProOrAdmin()
  @CacheTTL(3600) // Cache 1 heure pour les stats
  @ApiQuery({ name: 'weeks', required: false, type: Number, description: 'Nombre de semaines (max 8)' })
  @ApiOperation({ summary: 'Statistiques hebdomadaires' })
  async statistiques(
    @Param('proId', ParseIntPipe) proId: number,
    @Query('weeks', new ParseIntPipe({ optional: true })) weeks: number = 4
  ): Promise<any> {
    // Limiter le nombre de semaines pour éviter des calculs trop lourds
    const safeWeeks = Math.min(weeks, 8);
    return this.service.statistiquesHebdo(proId);
  }

  @Get('creneaux-disponibles')
  @PatientOrPro()
  @CacheTTL(60) // Cache court car disponibilités changent
  @ApiOperation({ summary: 'Créneaux disponibles' })
  async getCreneauxDisponibles(
    @Query('proId', ParseIntPipe) proId: number,
    @Query('date', ParseDatePipe) date: Date,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7
  ): Promise<Date[]> {
    // Limiter la période de recherche
    const safeDays = Math.min(days, 14); // Max 2 semaines
    return this.service.getCreneauxDisponibles(proId, new Date(date));
  }

  @Get('carte-patients/:proId')
  @ProSanteOnly()
  @CacheTTL(600) // Cache 10 minutes
  @ApiOperation({ summary: 'Carte des patients d\'un professionnel' })
  async getCartePatients(@Param('proId', ParseIntPipe) proId: number): Promise<any[]> {
    return this.service.getCartePatients(proId);
  }
}