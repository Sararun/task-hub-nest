import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigInDtoRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
