import HttpStatus from '~/server/common/http-status.enums';
import AccountService from '~/server/services/account.service';
import { accountIdSchema } from '~/server/validation/account.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, accountIdSchema.parse);
  const service = new AccountService(event.context.auth.user);
  await service.delete(id);
  setResponseStatus(event, HttpStatus.NO_CONTENT);
});
