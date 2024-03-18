import AccountService from '~/server/services/account.service';
import { accountIdSchema } from '~/server/validation/account.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const service = new AccountService(event.context.auth.user);
  const { id } = await getValidatedRouterParams(event, accountIdSchema.parse);
  return await service.getById(id);
});
