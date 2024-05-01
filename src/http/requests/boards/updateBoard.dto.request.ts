import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateBoardDtoRequest {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiProperty({
    description: 'The board name.',
    example: 'Board name',
    maxLength: 255,
    required: false,
    type: String,
  })
  readonly name: string | undefined;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'deleted users from board ids array',
    example: [0, 4],
    required: false,
    type: [Number],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  @IsInt({ each: true })
  readonly deletedUsersList: number[] | undefined;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'added users to board ids array',
    example: [0, 4],
    required: false,
    type: [Number],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : []))
  @IsInt({ each: true })
  readonly addedUserList: number[] | undefined;
}
