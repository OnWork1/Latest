import { Prisma, PrismaClient } from '@prisma/client';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import { EntitySavedResponseDto } from '~/server/dtos/common/entity-saved-response.dto';
import { type PaginatedResponseDto } from '~/server/dtos/common/paginated-response.dto';

export interface ServiceBase<T, R, P> {
  create(obj: T): Promise<EntitySavedResponseDto>;
  update(id: number, obj: T): Promise<void>;
  getAll(obj: P): Promise<PaginatedResponseDto<R>>;
  getById(id: number): Promise<R | null>;
  delete(id: number): Promise<void>;
  checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: T,
    id?: number
  ): Promise<void>;
}
