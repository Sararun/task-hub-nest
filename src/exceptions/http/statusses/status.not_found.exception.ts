import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class StatusNotFoundException extends HttpException {
  constructor(message?: string) {
    const response = message || 'Status not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
