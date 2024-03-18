export interface Receipt {
  id?: number;
  expenseId?: number;
  fileExtension: string;
  fileName: string;
  filePath: string;
  file?: any;
}
