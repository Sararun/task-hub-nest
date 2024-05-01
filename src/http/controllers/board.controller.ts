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
import { Board, User } from '@prisma/client';
import { ValidateBoardExistsValidator } from '../../validators/validateBoardExists.validator';
import { RoleEnum } from '../../enums/role.enum';
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
      boardId: board.id,
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
    await this.prisma.board.delete({ where: { id: boardId } });

    return {
      payload: null,
    };
  }
}
