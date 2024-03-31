import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class StatusNotFoundException extends HttpException {
  constructor(message?: string) {
    // Вы можете задать сообщение по умолчанию, если оно не передано
    const response = message || 'Status not found';
    // HttpStatus.NOT_FOUND автоматически задает статус код 404
    super(response, HttpStatus.NOT_FOUND);
  }
}
