import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthenticationResponseDto } from '../dto/authentication-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../users/entities/admin.entity';
import { Patient } from '../../users/entities/patient.entity';
import { ProSante } from '../../users/entities/pro-sante.entity';
import { RoleUser } from '../../users/enums/role-user.enum';
import { UserDto } from '../dto/user.dto';
import { UsersService } from '../../users/services/users.service';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      // Récupérer l'utilisateur avec le mot de passe (select: false dans l'entité)
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.motDePasse')
        .where('user.coordonnees.email = :email', { email })
        .getOne();

      if (!user) {
        return null;
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.motDePasse);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Erreur validation utilisateur: ${error.message}`);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthenticationResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.motDePasse);
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Votre compte est désactivé. Contactez l\'administrateur.');
    }

    const token = await this.generateToken(user);
    
    return AuthenticationResponseDto.from(token, user);
  }

  async register(registerDto: RegisterDto): Promise<AuthenticationResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { coordonnees: { email: registerDto.email } },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Créer l'utilisateur selon son rôle
    let user: User;
    
    switch (registerDto.role) {
      case RoleUser.ADMIN:
        user = await this.createAdmin(registerDto);
        break;
      case RoleUser.PATIENT:
        user = await this.createPatient(registerDto);
        break;
      case RoleUser.PRO_SANTE:
        user = await this.createProSante(registerDto);
        break;
      default:
        throw new BadRequestException('Rôle invalide');
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt();
    user.motDePasse = await bcrypt.hash(registerDto.password, salt);

    // Sauvegarder l'utilisateur
    const savedUser = await this.userRepository.save(user);
    
    // Générer le token
    const token = await this.generateToken(savedUser);
    
    return AuthenticationResponseDto.from(token, savedUser);
  }

  async refreshToken(userId: number): Promise<AuthenticationResponseDto> {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const token = await this.generateToken(user);
    
    return AuthenticationResponseDto.from(token, user);
  }

  async logout(userId: number): Promise<{ message: string }> {
    // Implémentez la logique de logout (invalidation token, etc.)
    this.logger.log(`Utilisateur ${userId} déconnecté`);
    return { message: 'Déconnexion réussie' };
  }

  async getProfile(userId: number): Promise<UserDto | null> {
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return UserDto.fromEntity(user);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.motDePasse);
    
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const salt = await bcrypt.genSalt();
    user.motDePasse = await bcrypt.hash(newPassword, salt);
    
    await this.userRepository.save(user);

    return { message: 'Mot de passe changé avec succès' };
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.coordonnees.email!,
      role: user.role
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.jwt.secret'),
      expiresIn: this.configService.get('app.jwt.expiration'),
    });
  }

  private async createAdmin(dto: RegisterDto): Promise<Admin> {
    const admin = new Admin();
    
    admin.nom = dto.nom;
    admin.prenom = dto.prenom;
    admin.sexe = dto.sexe;
    admin.role = RoleUser.ADMIN;
    admin.enabled = true;
    
    admin.coordonnees = {
      email: dto.email,
      numeroTelephone: dto.numeroTelephone,
      adresse: dto.adresse,
    };
    
    admin.niveauAcces = dto.niveauAcces || 'LIMITE';
    admin.estSuperAdmin = dto.estSuperAdmin || false;
    admin.departement = dto.departement || 'Non spécifié';
 

    return admin;
  }

  private async createPatient(dto: RegisterDto): Promise<Patient> {
    const patient = new Patient();
    
    patient.nom = dto.nom;
    patient.prenom = dto.prenom;
    patient.sexe = dto.sexe;
    patient.role = RoleUser.PATIENT;
    patient.enabled = true;
    
    patient.coordonnees = {
      email: dto.email,
      numeroTelephone: dto.numeroTelephone,
      adresse: dto.adresse,
    };
    
    patient.matricule = dto.matricule || `PAT-${Date.now()}`;
    patient.lieuNaissance = dto.lieuNaissance || 'Non spécifié';
    
    if (dto.dateNaissance) {
      patient.dateNaissance = new Date(dto.dateNaissance);
    }
    
    patient.situationFamiliale = dto.situationFamiliale || 'Non spécifié';
    patient.latitude = dto.latitude || 0;
    patient.longitude = dto.longitude || 0;

    return patient;
  }

  private async createProSante(dto: RegisterDto): Promise<ProSante> {
    const proSante = new ProSante();
    
    proSante.nom = dto.nom;
    proSante.prenom = dto.prenom;
    proSante.sexe = dto.sexe;
    proSante.role = RoleUser.PRO_SANTE;
    proSante.enabled = true;
    
    proSante.coordonnees = {
      email: dto.email,
      numeroTelephone: dto.numeroTelephone,
      adresse: dto.adresse,
    };
    
    proSante.specialite = dto.specialite || 'Généraliste';
    proSante.description = dto.description || '';
    proSante.tarif = dto.tarif || 0;
    proSante.latitude = dto.latitude || 0;
    proSante.longitude = dto.longitude || 0;

    return proSante;
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      return await this.usersService.findOne(payload.sub);
    } catch (error) {
      this.logger.error(`Token invalide: ${error.message}`);
      return null;
    }
  }
}