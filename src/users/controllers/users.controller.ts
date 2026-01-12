import { Controller, Get, Param, Query, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { PatientOnly, ProSanteOnly, AdminOnly, PatientOrPro, ProOrAdmin } from '../../auth/decorators/role-guards.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
@UseInterceptors(CacheInterceptor) // Cache global pour les GET
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/me')
  @PatientOrPro()
  @CacheTTL(300) // Cache 5 minutes pour réduire les appels DB
  @ApiOperation({ summary: 'Obtenir mon propre profil' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Get('patients/list')
  @ProOrAdmin()
  @CacheTTL(30) // Cache court car liste peut changer
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max 50 pour performance' })
  @ApiOperation({ summary: 'Lister les patients (paginé)' })
  async getAllPatients(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20
  ) {
    // Limiter le nombre d'éléments par page pour éviter les charges mémoire
    const safeLimit = Math.min(limit, 50);
    return this.usersService.findAllPatients();
  }

  @Get('professionals/list')
  @PatientOrPro()
  @CacheTTL(60) // Cache 1 minute
  @ApiOperation({ summary: 'Lister les professionnels de santé' })
  async getAllProfessionals() {
    return this.usersService.findAllProSante();
  }

  @Get('admins/list')
  @AdminOnly()
  @CacheTTL(60)
  @ApiOperation({ summary: 'Lister les administrateurs' })
  async getAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  @Get(':id')
  @ProOrAdmin()
  @CacheTTL(300)
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get('patient/:id')
  @ProSanteOnly()
  @CacheTTL(300)
  @ApiOperation({ summary: 'Obtenir un patient par ID' })
  async getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}