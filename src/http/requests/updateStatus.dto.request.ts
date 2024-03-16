import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDtoRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'The status name.',
    example: 'Star',
    maxLength: 255,
    required: true,
    type: String,
  })
  name: string | undefined;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(9, 9)
  @Matches(/^[A-Z0-9]{9}$/, {
    message: 'colorCode must be in uppercase.',
  })
  @ApiProperty({
    description: 'The color code.',
    example: 'FFFFFF',
    maxLength: 9,
    required: true,
    type: String,
  })
  colorCode: string | undefined;
}
