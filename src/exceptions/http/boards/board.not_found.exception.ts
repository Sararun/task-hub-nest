import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class BoardNotFoundException extends HttpException {
  constructor(message?: string) {
    // Вы можете задать сообщение по умолчанию, если оно не передано
    const response = message || 'Board not found';
    // HttpStatus.NOT_FOUND автоматически задает статус код 404
    super(response, HttpStatus.NOT_FOUND);
  }
}
