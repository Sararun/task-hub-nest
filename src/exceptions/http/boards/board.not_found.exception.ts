import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class BoardNotFoundException extends HttpException {
  constructor(message?: string) {
    const response = message || 'Board not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
