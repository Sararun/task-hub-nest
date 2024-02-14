import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetProfileDataDtoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'The name of the user.',
    example: 'John Doe',
    maxLength: 255,
    required: true,
    type: String,
  })
  name: string;
}
