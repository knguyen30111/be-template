import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({ description: 'JWT access token (15min expiry)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (7d expiry)' })
  refreshToken: string;
}
