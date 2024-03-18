import { ZodError } from 'zod';
import HttpStatus from '~/server/common/http-status.enums';
import type ValidationError from '~/server/dtos/common/validation-error.dto';

export function handleZodError(err: ZodError) {
  const errorList: ValidationError[] = [];
  const errorMessageList: string[] = [];
  err.issues.forEach((issue) => {
    errorList.push({
      message: issue.message,
      path: issue.path,
    });
    errorMessageList.push(issue.message);
  });
  throw createError({
    statusCode: HttpStatus.BAD_REQUEST,
    message: errorMessageList.join(';'),
    data: errorList,
  });
}
