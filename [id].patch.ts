import HttpStatus from '~/server/common/http-status.enums';
import AccountService from '~/server/services/account.service';
import {
  accountIdSchema,
  accountInputSchema,
} from '~/server/validation/account.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, accountIdSchema.parse);
  const payload = await readValidatedBody(event, accountInputSchema.parse);
  const service = new AccountService(event.context.auth.user);
  await service.update(id, payload);
  setResponseStatus(event, HttpStatus.NO_CONTENT);
});
