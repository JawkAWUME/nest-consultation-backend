import { RoleUser } from '../../users/enums/role-user.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: RoleUser;
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}