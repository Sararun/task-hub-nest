import { Status, PrismaClient, $Enums } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const existStatuses: Status[] = await prisma.status.findMany();
  if (existStatuses.length === 0) {
    const statuses: { name: $Enums.StatusEnum; color: string }[] = [
      {
        name: $Enums.StatusEnum.NotStatus,
        color: '6c757d',
      },
      {
        name: $Enums.StatusEnum.TODO,
        color: 'FFA500',
      },
      {
        name: $Enums.StatusEnum.InProgress,
        color: '007BFF',
      },
      {
        name: $Enums.StatusEnum.Review,
        color: 'FFC107',
      },
      {
        name: $Enums.StatusEnum.Done,
        color: '28A745',
      },
      {
        name: $Enums.StatusEnum.Blocked,
        color: 'DC3545',
      },
    ];
    for (const status of statuses) {
      await prisma.status.create({
        data: {
          name: status.name as $Enums.StatusEnum,
          color_code: status.color,
        },
      });
    }
  }
}
