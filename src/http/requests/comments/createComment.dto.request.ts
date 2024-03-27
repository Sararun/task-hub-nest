import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentExistsValidator } from '../../../validators/commentExists.validator';
import { IsAnswerTypeRequired } from '../../../validators/isAnswerTypeRequiredConstraint.validator';

export class CreateCommentDtoRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The content of comment',
    example: 'The text of comment',
    required: true,
    type: String,
  })
  content: string;

  @IsInt()
  @IsOptional()
  @Validate(CommentExistsValidator)
  @IsAnswerTypeRequired('type', {
    message: 'Both answerId and type are required when one is provided',
  })
  @ApiProperty({
    description: 'The id of parent comment',
    example: 1,
    required: false,
    type: Number,
  })
  answerId: number | undefined;

  @IsBoolean()
  @IsOptional()
  @IsAnswerTypeRequired('answerId', {
    message: 'Both type and answerId are required when one is provided',
  })
  @ApiProperty({
    description: 'Type of comment location in the hierarchy',
    example: true,
    required: false,
    type: Boolean,
  })
  type: boolean | undefined;
}
