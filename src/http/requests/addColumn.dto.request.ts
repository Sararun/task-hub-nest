import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddColumnDtoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'The column name.',
    example: 'Column name',
    maxLength: 255,
    required: true,
    type: String,
  })
  name: string;
}
