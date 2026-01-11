import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PatientGuard } from '../guards/patient.guard';
import { ProSanteGuard } from '../guards/pro-sante.guard';
import { AdminGuard } from '../guards/admin.guard';
import { RoleUser } from '../../users/enums/role-user.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

// Décorateur pour les patients uniquement
export function PatientOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PatientGuard),
    Roles(RoleUser.PATIENT)
  );
}

// Décorateur pour les professionnels de santé uniquement
export function ProSanteOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, ProSanteGuard),
    Roles(RoleUser.PRO_SANTE)
  );
}

// Décorateur pour les administrateurs uniquement
export function AdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, AdminGuard),
    Roles(RoleUser.ADMIN)
  );
}

// Décorateur pour patients et pros
export function PatientOrPro() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleUser.PATIENT, RoleUser.PRO_SANTE)
  );
}

// Décorateur pour pros et admin
export function ProOrAdmin() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleUser.PRO_SANTE, RoleUser.ADMIN)
  );
}