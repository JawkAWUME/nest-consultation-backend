import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';


export class AuthenticationResponseDto {
  @ApiProperty({
    description: 'JWT Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Informations de l\'utilisateur',
    type: () => UserDto,
  })
  user: UserDto;

  constructor(token: string, user: UserDto) {
    this.token = token;
    this.user = user;
  }

  static from(token: string, user: any): AuthenticationResponseDto {
    const userDto = UserDto.fromEntity(user);
    return new AuthenticationResponseDto(token, userDto!);
  }
}