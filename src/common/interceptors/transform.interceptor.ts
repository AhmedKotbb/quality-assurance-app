import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseDto<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      'Success';

    const request = context.switchToHttp().getRequest<{ method: string }>();
    const responseStatus = context.switchToHttp().getResponse<{
      statusCode: number;
    }>().statusCode;

    // Nest defaults POST success to 201, but Express still reports 200 here
    const statusCode =
      request.method === 'POST' && responseStatus === HttpStatus.OK
        ? HttpStatus.CREATED
        : responseStatus;

    return next.handle().pipe(
      map((data) => ({
        message,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
