import ReceiptService from '~/server/services/receipt.service';
import { receiptIdSchema } from '~/server/validation/receipt.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineEventHandler(async (event) => {
  const service = new ReceiptService(event.context.auth.user);
  const { id } = await getValidatedRouterParams(event, receiptIdSchema.parse);

  const response = await service.getById(id);
  const disposition = `attachment; filename="${response.fileName}"`;
  const headerProperties: any = {
    'Content-Disposition': disposition,
    'Content-Type': 'application/octet-stream',
  };
  setResponseHeaders(event, headerProperties);
  return sendStream(event, response.fileStream!);
});
