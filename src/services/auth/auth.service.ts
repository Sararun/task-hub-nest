import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user?.password != pass) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, password: user.password };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          password: password,
          timestamps: new Date(),
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async setJwtToken(res: Response, access_token: string) {
    console.log(access_token);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 30 * 60 * 1000,
    });
  }
}
