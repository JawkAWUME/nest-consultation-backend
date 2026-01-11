import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Ajoutez ici une logique personnalisée si nécessaire
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Gestion personnalisée des erreurs d'authentification
    
    if (err || !user) {
      // Log détaillé pour le débogage
      console.error('JWT Authentication Error:', {
        error: err?.message,
        info: info?.message,
        path: context.switchToHttp().getRequest().url,
      });

      // Différents messages d'erreur selon le type d'erreur
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token expiré',
          error: 'TokenExpiredError',
          timestamp: new Date().toISOString(),
        });
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token invalide',
          error: 'JsonWebTokenError',
          timestamp: new Date().toISOString(),
        });
      }

      if (info?.message === 'No auth token') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Token manquant',
          error: 'NoAuthToken',
          timestamp: new Date().toISOString(),
        });
      }

      // Erreur générique
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Accès non autorisé',
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
    }

    // Vérifier que le compte est activé
    if (!user.enabled) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Votre compte est désactivé. Contactez l\'administrateur.',
        error: 'AccountDisabled',
        timestamp: new Date().toISOString(),
      });
    }

    return user;
  }
}
