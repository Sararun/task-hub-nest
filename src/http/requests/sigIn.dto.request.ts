import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigInDtoRequest {
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user.',
    example: 'email@mail.com',
    maxLength: 255,
    required: true,
    uniqueItems: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The password of the user.',
    example: 'password',
    maxLength: 255,
    required: true,
  })
  password: string;
}
