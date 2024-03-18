import HttpStatus from '~/server/common/http-status.enums';

export function throwGenericError() {
  throw createError({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong!',
  });
}
