import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(message?: string) {
    const response = message || 'User not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
