import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBoardDtoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'The board name.',
    example: 'Board name',
    maxLength: 255,
    required: true,
    type: String,
  })
  name: string;
}
