import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';
import { MinioService } from '../minio.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
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
    file: Express.Multer.File | undefined,
  ): Promise<boolean> {
    let fileUrl: string | undefined = undefined;

    if (file) {
      const newFileName = await this.minioService.uploadFile(file);
      fileUrl = await this.minioService.getFileUrl(newFileName);
    }

    try {
      await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          password: password,
          photo: fileUrl,
          timestamps: new Date(),
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async setJwtToken(res: Response, access_token: string) {
    res.cookie('jwt', access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 30 * 60 * 1000,
    });
  }
}
