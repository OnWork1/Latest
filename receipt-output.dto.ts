import type { ReceiptInfo } from '@prisma/client';
import { Readable } from 'stream';

export default class ReceiptOutputDto {
  constructor(
    public id: number,
    public expenseId: number | null,
    public fileExtension: string,
    public fileName: string,
    public filePath: string,
    public fileStream?: Readable
  ) {}

  static fromEntity(data: ReceiptInfo) {
    return new ReceiptOutputDto(
      data.id,
      data.expenseId,
      data.fileExtension,
      data.fileName,
      data.filePath
    );
  }

  static fromEntityArray(data: ReceiptInfo[]) {
    const receiptList: ReceiptOutputDto[] = [];
    data.forEach((receipt) => {
      receiptList.push(this.fromEntity(receipt));
    });
    return receiptList;
  }
}
