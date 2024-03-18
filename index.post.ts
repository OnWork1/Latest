import HttpStatus from '~/server/common/http-status.enums';
import ProductService from '~/server/services/product.service';
import { productInputSchema } from '~/server/validation/product.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const body = await readValidatedBody(event, productInputSchema.parse);
  const service = new ProductService(event.context.auth.user);
  const response = await service.create(body);
  setResponseStatus(event, HttpStatus.CREATED);
  return response;
});
