import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';

type ModelType = Type<unknown> | [Type<unknown>];

function buildWrappedSchema(model: ModelType) {
  const isArray = Array.isArray(model);
  const type = isArray ? model[0] : model;

  return {
    allOf: [
      { $ref: getSchemaPath(ApiResponseDto) },
      {
        properties: {
          data: isArray
            ? { type: 'array', items: { $ref: getSchemaPath(type) } }
            : { $ref: getSchemaPath(type) },
        },
      },
    ],
  };
}

export function ApiWrappedOkResponse(model: ModelType) {
  const types = Array.isArray(model)
    ? [ApiResponseDto, model[0]]
    : [ApiResponseDto, model];

  return applyDecorators(
    ApiExtraModels(...types),
    ApiOkResponse({ schema: buildWrappedSchema(model) }),
  );
}

export function ApiWrappedCreatedResponse(model: ModelType) {
  const types = Array.isArray(model)
    ? [ApiResponseDto, model[0]]
    : [ApiResponseDto, model];

  return applyDecorators(
    ApiExtraModels(...types),
    ApiCreatedResponse({ schema: buildWrappedSchema(model) }),
  );
}
