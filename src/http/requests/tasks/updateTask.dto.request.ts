import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateBeforeNowValidator } from '../../../validators/isDateBeforeNow.validator';

export class UpdateTaskDtoRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the task.',
    example: 'Some kind of description',
    required: false,
    type: String,
  })
  readonly description: string | undefined;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the task.',
    example: 'Name of task',
    required: true,
    type: String,
  })
  readonly name: string | undefined;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Validate(IsDateBeforeNowValidator)
  @ApiProperty({
    description: 'Deadline date',
    example: '2024-02-24T20:21:21.168Z',
    required: false,
    type: Date,
  })
  readonly deadline: Date | undefined;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Status id',
    example: '1',
    required: false,
  })
  statusId: number | undefined;
}
