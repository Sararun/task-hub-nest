import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(message?: string) {
    const response = message || 'Task not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
