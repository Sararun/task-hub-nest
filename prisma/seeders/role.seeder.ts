import { Role, PrismaClient, RoleEnum } from '@prisma/client';

const prisma = new PrismaClient();

export async function main() {
  const existRoles: Role[] = await prisma.role.findMany();

  if (existRoles.length === 0) {
    for (const rolesKey in RoleEnum) {
      await prisma.role.create({
        data: {
          name: rolesKey as RoleEnum,
        },
      });
    }
  }
}
