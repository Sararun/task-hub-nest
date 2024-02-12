import { IsEmail, IsOptional, IsString, Validate } from 'class-validator';
import { EmailExistsValidator } from '../../validators/emailExists.validator';

export class SetProfileDataDtoRequest {

  @IsEmail()
  @Validate(EmailExistsValidator)
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  name: string;
}
