import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigUpDtoRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
