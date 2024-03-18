import HttpStatus from '~/server/common/http-status.enums';
import AccountService from '~/server/services/account.service';
import { accountInputSchema } from '~/server/validation/account.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const body = await readValidatedBody(event, accountInputSchema.parse);
  const service = new AccountService(event.context.auth.user);
  const response = await service.create(body);
  setResponseStatus(event, HttpStatus.CREATED);
  return response;
});
