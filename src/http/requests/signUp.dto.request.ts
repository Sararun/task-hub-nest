import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailExistsValidator } from '../../validators/emailExists.validator';

export class SigUpDtoRequest {
  @IsEmail()
  @Validate(EmailExistsValidator)
  @ApiProperty({
    description: 'The email of the user.',
    example: 'email@mail.com',
    maxLength: 255,
    required: true,
    type: String,
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
    type: String,
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user.',
    example: 'John Doe',
    maxLength: 255,
    required: true,
    type: String,
  })
  name: string;
}
