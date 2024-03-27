import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsAnswerTypeRequiredConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return !(value !== undefined && relatedValue === undefined);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} or ${args.constraints[0]} is required`;
  }
}

export function IsAnswerTypeRequired(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [relatedPropertyName],
      validator: IsAnswerTypeRequiredConstraint,
    });
  };
}
