import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateColumnDtoRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of column.',
    example: 'Column name',
    maxLength: 255,
    required: false,
    type: String,
  })
  readonly name: string | undefined;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'The number of column.',
    example: 0,
    required: false,
    type: Number,
  })
  readonly columnNumber: number | undefined;
}
