import { Readable } from 'stream';
import BudgetUploadDto from '~/server/dtos/budget-upload/budget-upload-input.dto';
import BudgetUploadOutputDto from '~/server/dtos/budget-upload/budget-upload-output.dto';
import BudgetUploadService from '~/server/services/budget-upload.service';
import { parseStream } from 'fast-csv';
import defineCustomEventHandler from '~/server/utils/custom-handler';

export default defineCustomEventHandler(async (event) => {
  //const body = await readBody(event);
  const formData = await readMultipartFormData(event);

  const file = formData?.find((item) => {
    return item.name == 'budgetUpload';
  });

  const productId = formData?.find((item) => {
    return item.name == 'productId';
  });

  const csvContents: BudgetUploadDto[] = [];
  let result: { uploadStatus: boolean; results: BudgetUploadOutputDto[] } = {
    uploadStatus: false,
    results: [],
  };

  let rowNumber: number = 1;

  if (file) {
    //@ts-ignore
    result = new Promise<{
      uploadStatus: boolean;
      results: BudgetUploadOutputDto[];
    }>(function (resolve) {
      const stream = Readable.from(Buffer.from(file.data));
      parseStream(stream, { headers: true })
        .on('data', (row) => {
          if (productId && productId.data)
            row.ProductId = +productId.data.toString();

          row.RowNumber = rowNumber++;
          csvContents.push(row);
        })
        .on('end', async () => {
          if (csvContents && csvContents.length > 0) {
            const budgetUploadService = new BudgetUploadService(
              event.context.auth.user
            );
            const ret = await budgetUploadService.process(csvContents);
            resolve(ret);
          } else {
            //return an empty result with status false since there are no records to process.
            resolve({ uploadStatus: false, results: [] });
          }
        });
    });
  }

  return result;
});
