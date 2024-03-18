import { Prisma } from '@prisma/client';
import type { EventHandler, EventHandlerRequest } from 'h3';
import { H3Error } from 'h3';
import { ZodError } from 'zod';
import { throwGenericError } from './errors/common-error-handlers';
import {
  handleClientInitializationError,
  handleClientKnownRequestError,
  handleClientValidationError,
} from './errors/prisma-error-handler';
import { handleZodError } from './errors/zod-error-handlers';

export const defineCustomEventHandler = <T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      // do something before the route handler
      const response = await handler(event);
      // do something after the route handler
      return { response };
    } catch (err) {
      // Error handling
      console.error('error occured:', err);
      if (err instanceof Prisma.PrismaClientValidationError) {
        handleClientValidationError(err);
      } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        handleClientKnownRequestError(err);
      } else if (err instanceof Prisma.PrismaClientInitializationError) {
        handleClientInitializationError(err);
      } else if (err instanceof H3Error) {
        /*
        A generic H3Error is thrown during zod validation of API request body,query and router params
        but it contains the the original object as the cause
        */
        const zodError = err.data as ZodError;
        if (zodError) {
          handleZodError(zodError);
        } else {
          throwGenericError();
        }
      } else {
        throwGenericError();
      }
    }
  });

export default defineCustomEventHandler;
