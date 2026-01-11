import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { PatientOnly, ProSanteOnly, AdminOnly, PatientOrPro, ProOrAdmin } from '../../auth/decorators/role-guards.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/me')
  @PatientOrPro() // Accessible par patients et pros
  @ApiOperation({ summary: 'Obtenir mon propre profil' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get('patients/list')
  @ProOrAdmin() // Accessible par pros et admin
  @ApiOperation({ summary: 'Lister tous les patients' })
  async getAllPatients() {
    return this.usersService.findAllPatients();
  }

  @Get('professionals/list')
  @PatientOrPro() // Accessible par patients et pros
  @ApiOperation({ summary: 'Lister tous les professionnels de santé' })
  async getAllProfessionals() {
    return this.usersService.findAllProSante();
  }

  @Get('admins/list')
  @AdminOnly() // Accessible uniquement par admin
  @ApiOperation({ summary: 'Lister tous les administrateurs' })
  async getAllAdmins() {
    return this.usersService.findAllAdmins();
  }


  @Get(':id')
  @ProOrAdmin() // Accessible par pros et admin
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id));
  }

  @Get('patient/:id')
  @ProSanteOnly() // Accessible uniquement par pros
  @ApiOperation({ summary: 'Obtenir un patient par ID (pros seulement)' })
  async getPatientById(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id));
  }
}