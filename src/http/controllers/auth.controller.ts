import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { SigInDtoRequest } from '../requests/sigIn.dto.request';
import { SigUpDtoRequest } from '../requests/signUp.dto.request';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

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
  status: HttpStatus.BAD_REQUEST,
  schema: {
    example: {
      message: [
        'email must be an email',
        'password must be a string',
        'password should not be empty',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
  description: 'Validation error',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  },
  description: 'User not authorized',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        statusCode: HttpStatus.OK,
      },
    },
    description: 'Access token was generated.',
  })
  async signIn(
    @Body() signInDto: SigInDtoRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ statusCode: HttpStatus.OK }> {
    const { access_token } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    await this.authService.setJwtToken(res, access_token);

    return { statusCode: HttpStatus.OK };
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register ok and access token was generated.',
    schema: {
      example: {
        statusCode: HttpStatus.OK,
      },
    },
  })
  @ApiParam({
    name: 'name',
    required: true,
    description: 'The name of user',
    example: 'John Doe',
  })
  async signUp(
    @Body() signUpDto: SigUpDtoRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ statusCode: HttpStatus.OK }> {
    const signUpResult: boolean = await this.authService.signUp(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
    );
    if (signUpResult) {
      const { access_token } = await this.authService.signIn(
        signUpDto.email,
        signUpDto.password,
      );
      await this.authService.setJwtToken(res, access_token);

      return { statusCode: HttpStatus.OK };
    }
    throw UnauthorizedException;
  }
}
