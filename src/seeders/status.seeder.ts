import { PrismaService } from '../services/prisma.service';
import { StatusEnum } from '../enums/status.enum';
import { Status } from '@prisma/client';

const prisma = new PrismaService();

export async function main() {
  const existStatuses: Status[] | [] = await prisma.status.findMany();
  if (existStatuses.length === 0) {
    const statuses: { name: StatusEnum; color: string }[] = [
      {
        name: StatusEnum.NotStatus,
        color: '6c757d',
      },
      {
        name: StatusEnum.TODO,
        color: 'FFA500',
      },
      {
        name: StatusEnum.InProgress,
        color: '007BFF',
      },
      {
        name: StatusEnum.Review,
        color: 'FFC107',
      },
      {
        name: StatusEnum.Done,
        color: '28A745',
      },
      {
        name: StatusEnum.Blocked,
        color: 'DC3545',
      },
    ];
    for (const status of statuses) {
      await prisma.status.create({
        data: {
          name: status.name.toString(),
          color_code: status.color,
        },
      });
    }
  }
}
