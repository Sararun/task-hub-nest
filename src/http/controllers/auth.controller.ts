import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { SigInDtoRequest } from '../requests/sigIn.dto.request';
import { SigUpDtoRequest } from '../requests/signUp.dto.request';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
@ApiParam({
  name: 'email',
  required: true,
  description: 'The email of user',
  example: 'email@mail.com',
})
@ApiParam({
  name: 'password',
  required: true,
  description: 'The password of user',
  example: 'password',
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Access token was generated.',
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Validation error',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'User not authorized',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token was generated.',
  })
  async signIn(
    @Body() signInDto: SigInDtoRequest,
  ): Promise<{ access_token: string }> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register ok and access token was generated.',
  })
  @ApiParam({
    name: 'name',
    required: true,
    description: 'The name of user',
    example: 'John Doe',
  })
  async signUp(
    @Body() signUpDto: SigUpDtoRequest,
  ): Promise<{ access_token: string }> {
    const signUpResult: boolean = await this.authService.signUp(
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
