

import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    context: ExecutionContext,
  ) => {
    let request: any;
    
    // Support pour GraphQL
    if (context.getType<'graphql'>() === 'graphql') {
        const ctx = GqlExecutionContext.create(context);
        request = ctx.getContext().req;
    }
    // Support pour WebSocket
    else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      request = client.request || {};
      request.user = client.user; // L'utilisateur devrait être attaché lors de la connexion
    }
    // Support pour HTTP (REST)
    else {
      request = context.switchToHttp().getRequest();
    }

    // Extraire l'utilisateur de la requête
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Optionnel: vérifier des propriétés spécifiques
    const userData = {
      id: user.id,
      email: user.coordonnees?.email || user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      enabled: user.enabled,
      // Inclure l'utilisateur complet
      ...user,
    };

    return userData;
  },
);