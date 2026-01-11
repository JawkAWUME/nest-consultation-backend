import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Admin } from '../users/entities/admin.entity';
import { Patient } from '../users/entities/patient.entity';
import { ProSante } from '../users/entities/pro-sante.entity';
import { RendezVous } from '../rendez-vous/entities/rendez-vous.entity';
import { RoleUser } from '../users/enums/role-user.enum';
import { PatientRepository } from 'src/users/repositories/patient.repository';
import { ProSanteRepository } from 'src/users/repositories/pro-sante.repository';
import { RendezVousRepository } from 'src/users/repositories/rendez-vous.repository';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Patient)
    private readonly patientRepository: PatientRepository,
    @InjectRepository(ProSante)
    private readonly proSanteRepository: ProSanteRepository,
    @InjectRepository(RendezVous)
    private readonly rendezVousRepository: RendezVousRepository,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    const isProduction = this.configService.get('app.nodeEnv') === 'production';
    
    if (isProduction) {
      this.logger.warn('Seed skipped in production environment');
      return;
    }

    this.logger.log('Starting seed process...');
    
    try {
      // Vérifier et créer les admins
      const adminCount = await this.adminRepository.count();
      if (adminCount === 0) {
        await this.seedAdmins();
      }

      // Vérifier et créer les patients
      const patientCount = await this.patientRepository.count();
      if (patientCount === 0) {
        await this.seedPatients();
      }

      // Vérifier et créer les professionnels de santé
      const proCount = await this.proSanteRepository.count();
      if (proCount === 0) {
        await this.seedProSante();
      }

      // Vérifier et créer les rendez-vous
      const rdvCount = await this.rendezVousRepository.count();
      if (rdvCount === 0) {
        await this.seedRendezVous();
      }

      this.logger.log('✅ Seed completed successfully');
    } catch (error) {
      this.logger.error('❌ Seed failed:', error);
      throw error;
    }
  }

  private async seedAdmins(): Promise<void> {
    this.logger.log('Seeding admins...');

    const admins = [
      {
        nom: 'Admin',
        prenom: 'System',
        sexe: 'Masculin',
        motDePasse: 'admin123', // mot de passe en clair -> hashé par l'entité
        coordonnees: {
          email: 'admin@santeado.com',
          numeroTelephone: '771234567',
          adresse: 'Siège Social, Dakar Plateau',
        },
        role: RoleUser.ADMIN,
        enabled: true,
        niveauAcces: 'COMPLET',
        estSuperAdmin: true,
        departement: 'Direction Générale',
      },
      {
        nom: 'Technique',
        prenom: 'IT',
        sexe: 'Masculin',
        motDePasse: 'tech123',
        coordonnees: {
          email: 'tech@santeado.com',
          numeroTelephone: '772345678',
          adresse: 'Service IT, Dakar',
        },
        role: RoleUser.ADMIN,
        enabled: true,
        niveauAcces: 'COMPLET',
        estSuperAdmin: false,
        departement: 'Informatique',
      },
      {
        nom: 'Medical',
        prenom: 'Coord',
        sexe: 'Féminin',
        motDePasse: 'med123',
        coordonnees: {
          email: 'medical@santeado.com',
          numeroTelephone: '773456789',
          adresse: 'Service Médical, Dakar',
        },
        role: RoleUser.ADMIN,
        enabled: true,
        niveauAcces: 'LIMITE',
        estSuperAdmin: false,
        departement: 'Médical',
      },
    ];

    await this.adminRepository.save(admins);
    this.logger.log(`Created ${admins.length} admins`);
  }

  private async seedPatients(): Promise<void> {
    this.logger.log('Seeding patients...');
    
    const defaultPassword = 'password123'; // en clair

    const nomsPrenoms = [
      ["Cissé", "Moussa"], ["Ba", "Aissatou"], ["Diallo", "Ibrahima"], ["Camara", "Fatou"],
      ["Diop", "Abdou"], ["Kane", "Mame"], ["Touré", "Moussa"], ["Sow", "Mariam"],
      ["Barry", "Amadou"], ["Fall", "Ndeye"], ["Keita", "Lamine"], ["Sy", "Astou"],
      ["Konaté", "Cheikh"], ["Coulibaly", "Oumou"], ["Ndiaye", "Alioune"], ["Cissé", "Aminata"],
      ["Kouyaté", "Ismaila"], ["Diakité", "Bintou"], ["Doumbia", "Seydou"], ["Traoré", "Salimata"]
    ];

    const situationsFamiliales = ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"];
    const lieuxNaissance = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor"];

    const prenomsMasculins = new Set([
      "Moussa", "Ibrahima", "Abdou", "Amadou", "Lamine",
      "Cheikh", "Alioune", "Ismaila", "Seydou"
    ]);

    const prenomsFeminins = new Set([
      "Aissatou", "Fatou", "Mame", "Mariam", "Ndeye",
      "Astou", "Oumou", "Aminata", "Bintou", "Salimata"
    ]);

    const patients = nomsPrenoms.map(([nom, prenom], i) => {
      const patient = new Patient();
      patient.nom = nom;
      patient.prenom = prenom;
      
      // Détermination du sexe
      if (prenomsMasculins.has(prenom)) {
        patient.sexe = "Masculin";
      } else if (prenomsFeminins.has(prenom)) {
        patient.sexe = "Féminin";
      } else {
        patient.sexe = "Inconnu";
      }

      // Coordonnées
      patient.coordonnees = {
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@santeado.com`,
        adresse: `Rue ${i + 1}, Quartier Médina`,
        numeroTelephone: `77${String(1000 + i).padStart(7, '0')}`,
      };

      // Sécurité
      patient.motDePasse = defaultPassword; // en clair
      patient.role = RoleUser.PATIENT;
      patient.enabled = true;

      // Champs spécifiques
      patient.matricule = `PAT-${String(i + 1).padStart(4, '0')}`;
      patient.lieuNaissance = lieuxNaissance[i % lieuxNaissance.length];
      
      // Date de naissance (20-35 ans)
      const age = 20 + (i % 15);
      const dateNaissance = new Date();
      dateNaissance.setFullYear(dateNaissance.getFullYear() - age);
      dateNaissance.setDate(dateNaissance.getDate() - (i * 5));
      patient.dateNaissance = dateNaissance;
      
      patient.situationFamiliale = situationsFamiliales[i % situationsFamiliales.length];
      patient.latitude = 14.70 + (i * 0.01);
      patient.longitude = -17.45 + (i * 0.01);

      return patient;
    });

    await this.patientRepository.save(patients);
    this.logger.log(`Created ${patients.length} patients`);
  }

  private async seedProSante(): Promise<void> {
    this.logger.log('Seeding professionals...');
    
    const defaultPassword = 'securepass456'; // en clair

    const nomsPrenoms = [
      ["Sarr", "Mamadou"], ["Faye", "Khady"], ["Mbaye", "Elhadj"], ["Gueye", "Yacine"],
      ["Seck", "Papa"], ["Lo", "Aminata"], ["Ndoye", "Alioune"], ["Niane", "Awa"],
      ["Balde", "Tidiane"], ["Kebe", "Moussa"], ["Sylla", "Nene"], ["Dia", "Adama"],
      ["Dieng", "Malick"], ["Niang", "Fatou"], ["Ka", "Serigne"], ["Sakho", "Mame"],
      ["Ba", "Oumar"], ["Barry", "Soukeyna"], ["Diouf", "Abdoulaye"], ["Fall", "Bineta"]
    ];

    const specialites = [
      "Généraliste", "Pédiatre", "Cardiologue", "Gynécologue", "Dentiste",
      "Dermatologue", "Ophtalmologue", "Orthopédiste", "ORL", "Neurologue"
    ];

    const quartiers = [
      [14.73, -17.44], [14.72, -17.47], [14.68, -17.46],
      [14.69, -17.45], [14.71, -17.44], [14.70, -17.46]
    ];

    const professionals = nomsPrenoms.map(([nom, prenom], i) => {
      const pro = new ProSante();
      pro.nom = nom;
      pro.prenom = prenom;
      pro.sexe = i % 2 === 0 ? "Masculin" : "Féminin";
      pro.motDePasse = defaultPassword; // en clair
      pro.role = RoleUser.PRO_SANTE;
      pro.enabled = true;

      pro.coordonnees = {
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@santeado.com`,
        numeroTelephone: `78${String(2000 + i).padStart(7, '0')}`,
      };

      const specialite = specialites[i % specialites.length];
      pro.specialite = specialite;
      pro.description = `Médecin spécialisé en ${specialite.toLowerCase()} avec plus de ${3 + (i % 5)} ans d'expérience.`;
      pro.tarif = 10000.0 + (i * 1000);

      const quartierIndex = i % quartiers.length;
      const [baseLat, baseLng] = quartiers[quartierIndex];
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;

      pro.latitude = baseLat + offsetLat;
      pro.longitude = baseLng + offsetLng;

      return pro;
    });

    await this.proSanteRepository.save(professionals);
    this.logger.log(`Created ${professionals.length} professionals`);
  }

  private async seedRendezVous(): Promise<void> {
    this.logger.log('Seeding appointments...');
    
    const patients = await this.patientRepository.find({ take: 10 });
    const professionals = await this.proSanteRepository.find({ take: 10 });

    if (patients.length === 0 || professionals.length === 0) {
      this.logger.warn('Skipping appointments seed - no patients or professionals found');
      return;
    }

    const statuts = ["EN_ATTENTE", "VALIDÉ", "ANNULÉ"];
    const appointments: RendezVous[] = [];

    for (let i = 0; i < 30; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const prosante = professionals[Math.floor(Math.random() * professionals.length)];

      const rdv = new RendezVous();
      rdv.patient = patient;
      rdv.prosante = prosante;

      // Date aléatoire entre -10 et +10 jours
      const daysOffset = Math.floor(Math.random() * 21) - 10;
      const dateHeure = new Date();
      dateHeure.setDate(dateHeure.getDate() + daysOffset);
      dateHeure.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
      rdv.dateHeure = dateHeure;

      rdv.statut = statuts[Math.floor(Math.random() * statuts.length)];
      appointments.push(rdv);
    }

    await this.rendezVousRepository.save(appointments);
    this.logger.log(`Created ${appointments.length} appointments`);
  }
}
