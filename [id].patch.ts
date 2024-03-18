import HttpStatus from '~/server/common/http-status.enums';
import ProductService from '~/server/services/product.service';
import {
  productIdSchema,
  productInputSchema,
} from '~/server/validation/product.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const payload = await readValidatedBody(event, productInputSchema.parse);
  const { id } = await getValidatedRouterParams(event, productIdSchema.parse);
  const service = new ProductService(event.context.auth.user);
  await service.update(id, payload);
  setResponseStatus(event, HttpStatus.NO_CONTENT);
});
