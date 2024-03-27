import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDtoRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A some content',
    example: 'somebody want`s talking',
    required: true,
    type: String,
  })
  content: string;
}
