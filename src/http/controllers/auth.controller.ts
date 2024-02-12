import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { SigInDtoRequest } from '../requests/sigIn.dto.request';
import { SigUpDtoRequest } from '../requests/signUp.dto.request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      skipMissingProperties: true,
    }),
  )
  async signIn(
    @Body() signInDto: SigInDtoRequest,
  ): Promise<{ access_token: string }> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() signUpDto: SigUpDtoRequest) {
    const signUpResult = await this.authService.signUp(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
    );
    if (signUpResult) {
      return await this.authService.signIn(signUpDto.email, signUpDto.password);
    }
    throw UnauthorizedException;
  }
}
