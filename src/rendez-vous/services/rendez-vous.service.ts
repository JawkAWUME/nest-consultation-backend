import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { kmeans } from 'ml-kmeans';

import { ProSanteRepository } from '../../users/repositories/pro-sante.repository';
import { RendezVous } from '../entities/rendez-vous.entity';
import { RechercheProDto } from '../dto/recherche-pro.dto';
import { RendezVousDto } from '../dto/rendez-vous.dto';
import { PatientDto } from '../../users/dto/patient.dto';
import { ProSanteDto } from '../../users/dto/pro-sante.dto';
import { RendezVousRepository } from '../../users/repositories/rendez-vous.repository';
import { CreateRendezVousDto } from '../dto/create-rendez-vous.dto';
import { UpdateRendezVousDto } from '../dto/update-rendez-vous.dto';
import { PatientRepository } from '../../users/repositories/patient.repository';
import { TourneeOptimiseeDto } from '../dto/tournee-optimisee.dto';
import { EmailService } from 'src/email/email.service';
import { WebsocketService } from 'src/websocket/websocket.service';
import { Patient } from 'src/users/entities/patient.entity';
import { ProSante } from 'src/users/entities/pro-sante.entity';

@Injectable()
export class RendezVousService {
  private readonly logger = new Logger(RendezVousService.name);

  constructor(
    @InjectRepository(RendezVous)
    private readonly rendezVousRepository: RendezVousRepository,
    @InjectRepository(Patient)
    private readonly patientRepository: PatientRepository,
    @InjectRepository(ProSante)
    private readonly proSanteRepository: ProSanteRepository,
    @Inject()
    private readonly emailService: EmailService,
    // @Inject()
    // private readonly websocketService: WebsocketService,
    // private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // 📅 Tâche planifiée : Envoi de rappels toutes les minutes
  @Cron('*/1 * * * *')
  async envoyerRappels(): Promise<void> {
    try {
      const maintenant = new Date();
      const dansTroisHeures = new Date(maintenant.getTime() + 3 * 60 * 60 * 1000);

      const rdvs = await this.rendezVousRepository.findByDateHeureBetween(maintenant, dansTroisHeures);

      for (const rdv of rdvs) {
        if (!await this.rappelDejaEnvoye(rdv)) {
          const patient = rdv.patient;
          const email = patient.coordonnees.email;
          const nom = patient.nom;
          const date = rdv.dateHeure.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const contenu = `Bonjour ${nom}, ceci est un rappel pour votre rendez-vous prévu le ${date}`;

            if (!email) {
            throw new Error('Adresse email du destinataire manquante');
            }

     
          await this.emailService.envoyerEmail({
            to: email,
            subject: 'Rappel de rendez-vous',
            text: contenu,
            html: `<p>${contenu}</p>`
          });

        //   // Notification WebSocket
        //   this.websocketService.envoyerNotification('rappel', {
        //     message: `Rappel envoyé pour le ${date}`,
        //     rendezVousId: rdv.id,
        //     patientId: patient.id
        //   });

          await this.marquerRappelEnvoye(rdv);
        }
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi des rappels:', error);
    }
  }

  // 📅 Tâche planifiée : Mise à jour des statuts tous les jours à minuit
  @Cron('0 0 * * *')
  async mettreAJourStatuts(): Promise<void> {
    try {
      const maintenant = new Date();
      const anciensRdvs = await this.rendezVousRepository.findByDateHeureBefore(maintenant);

      for (const rdv of anciensRdvs) {
        if (rdv.statut === 'EN_ATTENTE') {
          rdv.statut = 'NON_HONORE';
          await this.rendezVousRepository.save(rdv);
        }
      }

      this.logger.log(`Statuts mis à jour pour ${anciensRdvs.length} rendez-vous`);
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour des statuts:', error);
    }
  }

  private async rappelDejaEnvoye(rdv: RendezVous): Promise<boolean> {
    // Implémentez la logique de vérification (cache Redis, champ en base, etc.)
    return false;
  }

  private async marquerRappelEnvoye(rdv: RendezVous): Promise<void> {
    // Implémentez la logique de marquage
  }

  async creerRendezVous(createDto: CreateRendezVousDto): Promise<RendezVousDto> {
    // Récupérer le patient
    const patient = await this.patientRepository.findByNomAndPrenom(
      createDto.patient.nom,
      createDto.patient.prenom
    );

    if (!patient) {
      throw new NotFoundException('Patient non trouvé');
    }

    let prosante;
    
    // Si un professionnel est spécifié
    if (createDto.prosanteId) {
      prosante = await this.proSanteRepository.findOne({ where: { id: createDto.prosanteId } });
      if (!prosante) {
        throw new NotFoundException('Professionnel non trouvé');
      }
    } else {
      // Trouver automatiquement un professionnel disponible
      prosante = await this.trouverProSanteDisponible(
        createDto.dateHeure,
        createDto.specialite
      );

      if (!prosante) {
        throw new NotFoundException('Aucun professionnel disponible trouvé');
      }
    }

    // Créer le rendez-vous
    const rendezVous = new RendezVous();
    rendezVous.dateHeure = createDto.dateHeure;
    rendezVous.statut = 'EN_ATTENTE';
    rendezVous.patient = patient;
    rendezVous.prosante = prosante;

    const savedRdv = await this.rendezVousRepository.save(rendezVous);

    return this.mapToDto(savedRdv);
  }

  private async trouverProSanteDisponible(dateHeure: Date, specialite?: string): Promise<any> {
    let professionnels;
    
    if (specialite) {
      professionnels = await this.proSanteRepository.findBySpecialite(specialite);
    } else {
      professionnels = await this.proSanteRepository.find();
    }

    for (const pro of professionnels) {
      const estDisponible = await this.verifierDisponibilite(pro, dateHeure);
      if (estDisponible) {
        return pro;
      }
    }

    return null;
  }

  private async verifierDisponibilite(pro: any, dateHeure: Date): Promise<boolean> {
    // Vérifier s'il n'y a pas déjà un rendez-vous
    const rdvExistants = await this.rendezVousRepository.findByProsanteAndDateHeure(pro, dateHeure);
    
    // Vérifier les horaires de travail
    const dansLesHoraires = this.estDansLesHorairesTravail(pro, dateHeure);
    
    return rdvExistants.length === 0 && dansLesHoraires;
  }

  private estDansLesHorairesTravail(pro: any, dateHeure: Date): boolean {
    const jour = dateHeure.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const heure = dateHeure.getHours();
    
    // Du lundi au vendredi, 8h-18h
    return jour >= 1 && jour <= 5 && heure >= 8 && heure <= 18;
  }

  async getCreneauxDisponibles(proId: number, date: Date): Promise<Date[]> {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(17, 0, 0, 0);
    
    const existants = await this.rendezVousRepository.findByProsanteIdAndDateHeureAfter(proId, start);
    
    const allSlots: Date[] = [];
    for (let t = new Date(start); t <= end; t = new Date(t.getTime() + 30 * 60000)) {
      allSlots.push(new Date(t));
    }
    
    const pris = new Set(existants
      .filter(r => r.dateHeure.toDateString() === date.toDateString())
      .map(r => r.dateHeure.getTime())
    );
    
    return allSlots.filter(slot => !pris.has(slot.getTime()));
  }

  async statistiquesHebdo(professionnelId: number): Promise<any> {
    const maintenant = new Date();
    const lundi = new Date(maintenant);
    lundi.setDate(maintenant.getDate() - maintenant.getDay() + 1);
    lundi.setHours(0, 0, 0, 0);
    
    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);
    dimanche.setHours(23, 59, 59, 999);
    
    const rdvs = await this.rendezVousRepository.findByDateHeureBetween(lundi, dimanche);
    const rdvsProfessionnel = rdvs.filter(r => r.prosante.id === professionnelId);
    
    const total = rdvsProfessionnel.length;
    const annules = rdvsProfessionnel.filter(r => r.statut === 'ANNULÉ').length;
    const tauxAnnulation = total > 0 ? (annules * 100.0 / total) : 0;
    
    return {
      totalRendezVous: total,
      annulations: annules,
      tauxAnnulation: Math.round(tauxAnnulation * 100) / 100,
      periode: {
        debut: lundi,
        fin: dimanche
      }
    };
  }

  async annulerRendezVous(id: number): Promise<void> {
    const rdv = await this.rendezVousRepository.findOne({ where: { id } });
    
    if (!rdv) {
      throw new NotFoundException(`Rendez-vous avec ID ${id} non trouvé`);
    }
    
    rdv.statut = 'ANNULÉ';
    await this.rendezVousRepository.save(rdv);
  }

  async listerRendezVousParPatient(patientId: number): Promise<RendezVousDto[]> {
    const rdvs = await this.rendezVousRepository.findByPatientId(patientId);
    return rdvs.map(rdv => this.mapToDto(rdv));
  }

  async listerRendezVousParPro(proSanteId: number): Promise<RendezVousDto[]> {
    const rdvs = await this.rendezVousRepository.findByProsanteId(proSanteId);
    return rdvs.map(rdv => this.mapToDto(rdv));
  }

  async rechercherProfessionnels(criteres: RechercheProDto): Promise<ProSanteDto[]> {
    let professionnels = await this.proSanteRepository.find({
      relations: ['rendezVous']
    });
    
    // Filtrer par spécialité
    if (criteres.specialite) {
      professionnels = professionnels.filter(p =>
        p.specialite?.toLowerCase().includes(criteres.specialite!.toLowerCase())
      );
    }
    
    // Filtrer par tarif maximal
    if (criteres.tarifMax) {
      professionnels = professionnels.filter(p => p.tarif <= criteres.tarifMax!);
    }
    
    // Filtrer par rayon
    if (criteres.latitude && criteres.longitude && criteres.rayonKm) {
      professionnels = professionnels.filter(p => {
        const distance = this.calculerDistance(
          criteres.latitude!,
          criteres.longitude!,
          p.latitude,
          p.longitude
        );
        return distance <= criteres.rayonKm!;
      });
    }
    
    // Trier par distance
    if (criteres.latitude && criteres.longitude) {
      professionnels.sort((a, b) => {
        const distanceA = this.calculerDistance(
          criteres.latitude!,
          criteres.longitude!,
          a.latitude,
          a.longitude
        );
        const distanceB = this.calculerDistance(
          criteres.latitude!,
          criteres.longitude!,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });
    }
    
    return professionnels.map(pro => this.mapToProSanteDto(pro, criteres));
  }

  async modifierRendezVous(id: number, updateDto: UpdateRendezVousDto): Promise<RendezVousDto> {
    const rdv = await this.rendezVousRepository.findOne({ where: { id } });
    
    if (!rdv) {
      throw new NotFoundException(`Rendez-vous avec ID ${id} non trouvé`);
    }
    
    if (updateDto.dateHeure) {
      rdv.dateHeure = updateDto.dateHeure;
    }
    
    if (updateDto.statut) {
      rdv.statut = updateDto.statut;
    }
    
    const updatedRdv = await this.rendezVousRepository.save(rdv);
    return this.mapToDto(updatedRdv);
  }

  async optimiserTournee(professionnelId: number): Promise<TourneeOptimiseeDto> {
    const maintenant = new Date();
    const rdvs = await this.rendezVousRepository.findByProsanteIdAndDateHeureAfter(professionnelId, maintenant);
    
    if (rdvs.length < 2) {
      // Retourner la tournée brute si clustering impossible
      return {
        dateOptimisation: maintenant,
        rendezVous: rdvs.map(rdv => this.mapToDto(rdv))
      };
    }
    
    // Préparer les données pour KMeans
    const coords = rdvs.map(r => [
      r.patient.latitude || 0,
      r.patient.longitude || 0
    ]);
    
    // Appliquer KMeans
    const k = Math.min(3, rdvs.length);
    const result = kmeans(coords, k,{
        maxIterations: 100,
    });
    
    // Associer les clusters aux rendez-vous
    const rendezVousAvecCluster = rdvs.map((rdv, index) => ({
      rdv,
      cluster: result.clusters[index]
    }));
    
    // Trier par cluster puis par date
    rendezVousAvecCluster.sort((a, b) => {
      if (a.cluster !== b.cluster) {
        return a.cluster - b.cluster;
      }
      return a.rdv.dateHeure.getTime() - b.rdv.dateHeure.getTime();
    });
    
    const rendezVousOrdonnes = rendezVousAvecCluster.map(item => this.mapToDto(item.rdv));
    
    return {
      dateOptimisation: maintenant,
      rendezVous: rendezVousOrdonnes,
      clusters: result.centroids.map((centroid, index) => ({
        id: index,
        centroid,
        count: result.clusters.filter(c => c === index).length
      }))
    };
  }

  async getCartePatients(proId: number): Promise<any[]> {
    const maintenant = new Date();
    const rdvs = await this.rendezVousRepository.findByProsanteIdAndDateHeureAfter(proId, maintenant);
    
    return rdvs.map(r => ({
      nom: `${r.patient.nom} ${r.patient.prenom}`,
      lat: r.patient.latitude,
      lon: r.patient.longitude,
      rdv: r.dateHeure,
      statut: r.statut,
      adresse: r.patient.coordonnees.adresse,
      telephone: r.patient.coordonnees.numeroTelephone
    }));
  }

  private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private mapToDto(rdv: RendezVous): RendezVousDto {
    return {
      id: rdv.id,
      dateHeure: rdv.dateHeure,
      statut: rdv.statut,
      patient: {
        id: rdv.patient.id,
        nom: rdv.patient.nom,
        prenom: rdv.patient.prenom,
        email: rdv.patient.coordonnees.email,
        telephone: rdv.patient.coordonnees.numeroTelephone
      } as PatientDto,
      proSante: {
        id: rdv.prosante.id,
        nom: rdv.prosante.nom,
        prenom: rdv.prosante.prenom,
        specialite: rdv.prosante.specialite,
        tarif: rdv.prosante.tarif
      } as ProSanteDto
    };
  }

  private mapToProSanteDto(pro: any, criteres?: RechercheProDto): ProSanteDto {
    const dto = {
        id: pro.id,
        nom: pro.nom,
        prenom: pro.prenom,
        specialite: pro.specialite,
        tarif: pro.tarif,
        latitude: pro.latitude,
        longitude: pro.longitude,
        description: pro.description,
        email: pro.coordonnees.email,
        telephone: pro.coordonnees.numeroTelephone
    } as unknown as ProSanteDto;
    
    // Calculer la distance si les coordonnées sont fournies
    if (criteres?.latitude && criteres?.longitude) {
      dto.distanceKm = this.calculerDistance(
        criteres.latitude,
        criteres.longitude,
        pro.latitude,
        pro.longitude
      );
    }
    
    return dto;
  }
}