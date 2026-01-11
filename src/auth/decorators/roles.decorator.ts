import { SetMetadata } from '@nestjs/common';
import { RoleUser } from '../../users/enums/role-user.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleUser[]) =>
  SetMetadata(ROLES_KEY, roles);
