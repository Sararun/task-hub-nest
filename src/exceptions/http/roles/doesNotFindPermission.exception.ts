import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export class DoesNotFindPermissionException extends HttpException {
  constructor(message?: string) {
    const response =
      message || 'The user does not have permissions for these actions';
    super(response, HttpStatus.FORBIDDEN);
  }
}
