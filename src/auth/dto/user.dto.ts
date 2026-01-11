import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { RoleUser } from '../../users/enums/role-user.enum';


export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dupont' })
  nom: string;

  @ApiProperty({ example: 'Jean' })
  prenom: string;

  @ApiProperty({ example: 'jean.dupont@email.com' })
  email: string | null;

  @ApiProperty({ enum: RoleUser, example: RoleUser.PATIENT })
  role: RoleUser;

  static fromEntity(user: User): UserDto | null {
    if (!user) return null;

    const dto = new UserDto();
    dto.id = user.id;
    dto.nom = user.nom;
    dto.prenom = user.prenom;
    dto.email = user.coordonnees?.email ?? null;
    dto.role = user.role;

    return dto;
  }
}
