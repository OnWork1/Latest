import CostService from '~/server/services/cost.service';
import { budgetCostInputSchema } from '~/server/validation/budget-cost.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const service = new CostService(event.context.auth.user);
  const { budgetId } = await getValidatedRouterParams(
    event,
    budgetCostInputSchema.parse
  );
  return await service.getByBudgetId(+budgetId);
});
