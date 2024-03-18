import {
  type Business,
  type Brand,
  type Company,
  type Product,
} from '@prisma/client';

export default class ProductOutputDto {
  constructor(
    public id: number,
    public brandId: number,
    public companyId: number,
    public productCode: string,
    public productName: string,
    public duration: number | null,
    public brandName: string | null,
    public companyCode: string | null,
    public companyName: string | null,
    public businessId: number | null,
    public businessCode: string | null
  ) {}

  static fromEntity(
    product: Product,
    brand: Brand,
    company: Company,
    business: Business | null
  ) {
    return new ProductOutputDto(
      product.id,
      product.brandId,
      product.companyId,
      product.productCode,
      product.productName,
      product.duration,
      brand.brandName,
      company.companyCode,
      company.companyName,
      business ? business.id : null,
      business ? business.businessCode : null
    );
  }

  // static fromEntityArray(data: Product[]) {
  //   const productList: ProductOutputDto[] = [];
  //   data.forEach((product) => {
  //     productList.push(this.fromEntity(product, null, null));
  //   });
  //   return productList;
  // }
}
