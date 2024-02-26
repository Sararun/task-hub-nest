import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint()
export class IsDateBeforeNowValidator implements ValidatorConstraintInterface {
  async validate(date: Date): Promise<boolean> {
    return !(date < new Date());
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Date ' + args.value.toISOString() + ' has already expired';
  }
}
