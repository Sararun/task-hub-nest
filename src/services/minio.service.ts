import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const minioEndpoint = this.configService.get('MINIO_ENDPOINT');
    const accessKey = this.configService.get('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get('MINIO_SECRET_KEY');

    this.minioClient = new Minio.Client({
      endPoint: minioEndpoint,
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: accessKey,
      secretKey: secretKey,
    });

    const bucketName = this.configService.get('MINIO_BUCKET_NAME');
    this.bucketName = bucketName;
  }

  async createBucketIfNotExists(): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.createBucketIfNotExists();
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );
    return fileName;
  }

  async uploadFiles(files: Array<Express.Multer.File>): Promise<string[]> {
    try {
      await this.createBucketIfNotExists();
      const uploadPromises = files.map(async (file: Express.Multer.File) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        await this.minioClient.putObject(
          this.bucketName,
          fileName,
          file.buffer,
          file.size,
        );
        return fileName;
      });
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  async getFilesUrl(fileNames: string[]): Promise<string[]> {
    const fileUrls = fileNames.map(async (fileName: string) => {
      return await this.minioClient.presignedUrl(
        'GET',
        this.bucketName,
        fileName,
      );
    });
    return Promise.all(fileUrls);
  }

  async getFileUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async deleteFiles(fileNames: string[]): Promise<void> {
    const tasks = fileNames.map((fileName) =>
      this.minioClient.removeObject(this.bucketName, fileName),
    );
    await Promise.all(tasks);
  }

  parseNameFromUrl(fileUrl: string): string {
    const basePath =
      fileUrl.indexOf(`/${this.bucketName}/`) + `/${this.bucketName}/`.length;

    const endPath = fileUrl.indexOf('?', basePath);

    return fileUrl.slice(basePath, endPath !== -1 ? endPath : fileUrl.length);
  }

  async parseNameFromUrls(fileUrls: string[]): Promise<string[]> {
    let basePath;
    let endPath;
    const fileNames = fileUrls.map(async (fileUrl) => {
      basePath =
        fileUrl.indexOf(`/${this.bucketName}/`) + `/${this.bucketName}/`.length;
      endPath = fileUrl.indexOf('?', basePath);
      return fileUrl.slice(basePath, endPath !== -1 ? endPath : fileUrl.length);
    });
    return await Promise.all(fileNames);
  }
}
