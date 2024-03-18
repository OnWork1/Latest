export interface UploadResult {
  id: number;
  expenseTitle: string;
  expenseCode: string;
  dayNumber: number;
  currencyCode: string;
  paymentType: string;
  taxCode: string;
  departmentCode: string;
  productCode: string;
  isSuccess: boolean;
  errorMessage: string;
  rowNumber: number;
}
