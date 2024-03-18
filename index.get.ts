import ProductService from '~/server/services/product.service';
import { productPaginationSchema } from '~/server/validation/product.zod';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  const payload = await getValidatedQuery(event, productPaginationSchema.parse);
  const service = new ProductService(event.context.auth.user);
  return await service.getAll(payload);
});
