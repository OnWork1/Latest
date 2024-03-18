import BudgetService from '~/server/services/budget.service';
import { accountbudgetInputSchema } from '~/server/validation/account-budget.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const service = new BudgetService(event.context.auth.user);
  const payload = await getValidatedQuery(
    event,
    accountbudgetInputSchema.parse
  );

  const retVal = await service.getByAccountId(payload);

  return retVal;
});
