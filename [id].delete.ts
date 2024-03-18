import HttpStatus from '~/server/common/http-status.enums';
import ReceiptService from '~/server/services/receipt.service';
import { receiptIdSchema } from '~/server/validation/receipt.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, receiptIdSchema.parse);
  const service = new ReceiptService(event.context.auth.user);
  await service.delete(id);
  setResponseStatus(event, HttpStatus.NO_CONTENT);
});
