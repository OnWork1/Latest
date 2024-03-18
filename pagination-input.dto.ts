import { Prisma } from '@prisma/client';

export default interface PaginationInputDto {
  searchQuery?: string;
  page?: number;
  perPage?: number;
  orderDirection?: Prisma.SortOrder;
}
