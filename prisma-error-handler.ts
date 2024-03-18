import { Prisma } from '@prisma/client';
import HttpStatus from '~/server/common/http-status.enums';

export function handleClientKnownRequestError(
  err: Prisma.PrismaClientKnownRequestError
) {
  switch (err.code) {
    case 'P2025': {
      throw createError({
        statusCode: HttpStatus.NOT_FOUND,
        message: err.message,
        statusMessage: 'Record not found',
      });
    }
    case 'P2001': {
      throw createError({
        statusCode: HttpStatus.NOT_FOUND,
        message: err.message,
        statusMessage: 'Record not found',
      });
    }
    case 'P2002': {
      throw createError({
        statusCode: HttpStatus.BAD_REQUEST,
        message: err.message,
        statusMessage: 'Record already exists',
      });
    }
    case 'X404': {
      throw createError({
        statusCode: HttpStatus.NOT_FOUND,
        message: err.message,
        statusMessage: err.message,
      });
    }
    default: {
      throw createError({
        statusCode: HttpStatus.BAD_REQUEST,
        message: err.message,
      });
    }
  }
}

export function handleClientInitializationError(
  err: Prisma.PrismaClientInitializationError
) {
  throw createError({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    statusMessage: 'Could not connect to Database',
    message: err.message,
  });
}

export function handleClientValidationError(
  err: Prisma.PrismaClientValidationError
) {
  throw createError({
    statusCode: HttpStatus.BAD_REQUEST,
    message: err.message,
  });
}
