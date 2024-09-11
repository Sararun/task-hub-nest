import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AddBoardDtoRequest } from '../requests/boards/addBoard.dto.request';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Board, RoleEnum, User } from '@prisma/client';
import { ValidateBoardExistsValidator } from '../../validators/validateBoardExists.validator';
import { DoesNotFindPermissionException } from '../../exceptions/http/roles/doesNotFindPermission.exception';
import { UpdateBoardDtoRequest } from '../requests/boards/updateBoard.dto.request';

@Controller('boards')
@ApiTags('boards')
@UseGuards(AuthGuard('jwt'))
export class BoardController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        payload: {
          id: 7,
          name: 'third',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: [
          'name must be shorter than or equal to 255 characters',
          'name must be a string',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @Post()
  async create(
    @Body() addBoardDto: AddBoardDtoRequest,
    @Req() request: any,
  ): Promise<{ payload: Board }> {
    const adminRole = await this.prisma.role.findUnique({
      where: { name: RoleEnum.Admin },
    });

    if (!adminRole) {
      throw new NotFoundException('admin role not found');
    }

    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });

    if (!user) {
      throw UnauthorizedException;
    }

    try {
      const board = await this.prisma.$transaction(async (prisma) => {
        const createdBoard = await prisma.board.create({
          data: {
            name: addBoardDto.name,
          },
        });

        await prisma.boardUserRole.create({
          data: {
            boardId: createdBoard.id,
            userId: user.id,
            roleId: adminRole.id,
          },
        });

        return createdBoard;
      });

      return {
        payload: board,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            boardId: 1,
            members: [
              {
                email: 'emailemail@mail.com',
                photo: 'http://localhost:9000/mybucketname',
                name: 'Vladislav sarosek',
                role: 'member',
              },
              {
                email: 'emcail@gmail.com',
                photo: null,
                name: 'vlad_sarosek',
                role: 'member',
              },
              {
                email: 'email@gmail.com',
                photo: 'http://localhost:9000/mybucketname',
                name: 'pppppppppppppppppppppppppppppp',
                role: 'admin',
              },
            ],
          },
          {
            boardId: 3,
            members: [
              {
                email: 'email@gmail.com',
                photo: 'http://localhost:9000/mybucketname/',
                name: 'pppppppppppppppppppppppppppppp',
                role: 'admin',
              },
            ],
          },
        ],
      },
    },
  })
  @Get()
  async get(@Req() request: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: request.user.email },
      include: {
        BoardUserRole: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const boards = await this.prisma.board.findMany({
      where: {
        BoardUserRole: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        BoardUserRole: {
          include: {
            user: {
              select: {
                email: true,
                photo: true,
                name: true,
              },
            },
            role: true,
          },
        },
      },
    });
    const result = boards.map((board) => ({
      id: board.id,
      name: board.name,
      members: board.BoardUserRole.map((bur) => ({
        email: bur.user.email,
        photo: bur.user.photo,
        name: bur.user.name,
        role: bur.role.name,
      })),
    }));
    return { payload: result };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: {
          id: 1,
          name: 'first',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: 'Board not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  @Patch(':boardId')
  async update(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
    @Body() changeBoardDto: UpdateBoardDtoRequest,
    @Req() request: any,
  ): Promise<{ payload: Board }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });

    if (!user) {
      throw UnauthorizedException;
    }

    const adminRole = await this.prisma.role.findUnique({
      where: { name: RoleEnum.Admin },
    });

    if (!adminRole) {
      throw new NotFoundException('admin role not found');
    }

    const boardAccess = await this.prisma.boardUserRole.findUnique({
      where: {
        boardId_userId_roleId: {
          userId: user.id,
          boardId: boardId,
          roleId: adminRole.id,
        },
      },
    });

    if (!boardAccess) {
      throw new DoesNotFindPermissionException();
    }

    if (changeBoardDto.deletedUsersList) {
      await this.prisma.boardUserRole.deleteMany({
        where: {
          boardId: boardId,
          userId: {
            in: changeBoardDto.deletedUsersList,
          },
        },
      });
    }

    if (changeBoardDto.addedUserList) {
      const memberRole = await this.prisma.role.findUnique({
        where: { name: RoleEnum.Member },
      });

      if (!memberRole) {
        throw new NotFoundException('member role not found');
      }

      const dataToCreate = changeBoardDto.addedUserList.map((userId) => ({
        boardId: boardId,
        roleId: memberRole.id,
        userId: userId,
      }));

      await this.prisma.boardUserRole.createMany({
        data: dataToCreate,
      });
    }

    const board = await this.prisma.board.update({
      data: {
        name: changeBoardDto.name,
      },
      where: {
        id: boardId,
      },
    });

    return { payload: board };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: 'Board not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  @Delete(':boardId')
  async delete(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
  ): Promise<{ payload: null }> {
    await this.prisma.boardUserRole.deleteMany({
      where: {
        boardId: boardId,
      },
    })
    await this.prisma.board.delete({ where: { id: boardId } });

    return {
      payload: null,
    };
  }

  @Get(':boardId/members')
  async getMembers(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
  ) {
    const burs = await this.prisma.boardUserRole.findMany({
      where: {
        boardId: Number(boardId),
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return {
      payload: burs.map((b) => ({ ...b.user, role: b.role })),
    };
  }

  @Post(':boardId/members')
  async addMembers(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
    @Body() body: { userId: number },
  ) {

    const role = await this.prisma.role.findUnique({
      where: {
        name: RoleEnum.Member
      }
    })

    if (!role) {
      throw new NotFoundException('role not found');
    }

    const burs = await this.prisma.boardUserRole.create({
      data: {
        boardId: boardId,
        userId: body.userId,
        roleId: role.id,
      }
    });
    return {
      payload: burs,
    };
  }

  @Delete(':boardId/members/:userId')
  async deleteMember(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    const memberRole = await this.prisma.role.findUnique({
      where: {
        name: RoleEnum.Member
      }
    })

    if (!memberRole) {
      throw new NotFoundException('role not found');
    }
    const burs = await this.prisma.boardUserRole.delete({
      where: {
        boardId_userId_roleId: {
          boardId: boardId,
          userId: userId,
          roleId: memberRole.id,
        },
      },
    });
    return {
      payload: burs,
    };
  }
}
