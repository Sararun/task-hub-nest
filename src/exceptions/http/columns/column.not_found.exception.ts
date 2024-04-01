import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class ColumnNotFoundException extends HttpException {
  constructor(message?: string) {
    const response = message || 'Column not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
