export interface ProductInputDto {
  productCode: string;
  brandId: number;
  companyId: number;
  duration?: number;
  productName: string;
  //costingSheetName?: string;
  isActive?: boolean;
  businessId?: number;
}
