import { Role } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { RoleEnum } from '../enums/role.enum';

const prisma = new PrismaService();

export async function main() {
  const existRoles: Role[] | [] = await prisma.role.findMany();
  
  if (existRoles.length === 0) {
    for (const rolesKey in RoleEnum) {
      await prisma.role.create({
        data: {
          // @ts-ignore
          name: RoleEnum[rolesKey],
        },
      });
    }
  }
}
