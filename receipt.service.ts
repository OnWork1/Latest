import prisma from '~/prisma/client';
import { EntitySavedResponseDto } from '../dtos/common/entity-saved-response.dto';
import type ReceiptInputDto from '../dtos/receipt/receipt-input.dto';
import ReceiptOutputDto from '../dtos/receipt/receipt-output.dto';
import type ReceiptPaginationDto from '../dtos/receipt/receipt-pagination.dto';
import { type ServiceBase } from './base/service-interface';
import getSkipTake from '~/utils/get-skip-take';
import { Prisma, PrismaClient, type ReceiptInfo } from '@prisma/client';
import { type PaginatedResponseDto } from '../dtos/common/paginated-response.dto';
import { type ReceiptOrderBy } from '../dtos/receipt/receipt-order-by.dto';
import { v4 as uuidv4 } from 'uuid';
import S3FileService from './s3file.service';
import HttpStatus from '../common/http-status.enums';
import { type DefaultArgs } from '@prisma/client/runtime/library';

export default class ReceiptService
  implements
    ServiceBase<ReceiptInputDto, ReceiptOutputDto, ReceiptPaginationDto>
{
  constructor(private user: string) {}
  getAll(
    obj: ReceiptPaginationDto
  ): Promise<PaginatedResponseDto<ReceiptOutputDto>> {
    throw new Error('Method not implemented.');
  }
  checkUniquenessAndThrow(
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    obj: ReceiptInputDto,
    id?: number
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, obj: ReceiptInputDto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async create(receipt: ReceiptInputDto): Promise<EntitySavedResponseDto> {
    const uuid = uuidv4();
    receipt.filePath = uuid;

    const s3Service = new S3FileService(this.user);

    const fileUploadResponse = await s3Service.upload(receipt);

    if (fileUploadResponse == HttpStatus.OK) {
      const response = await prisma.receiptInfo.create({
        data: {
          ...receipt,
          isActive: true,

          createdBy: this.user,
        },
      });
      return new EntitySavedResponseDto(response.id);
    } else {
      throw new Error(`File upload failed`);
    }
  }

  async getByExpenseId({
    page,
    perPage,

    orderBy,
    orderDirection,
    expenseId,
  }: ReceiptPaginationDto): Promise<PaginatedResponseDto<ReceiptOutputDto>> {
    const { skip, take } = getSkipTake(perPage, page);
    const orderByValue: ReceiptOrderBy = orderBy ?? 'id';
    const direction: Prisma.SortOrder = orderDirection ?? 'asc';

    const query: Prisma.ReceiptInfoFindManyArgs = {
      where: {
        isActive: true,
        expenseId: +expenseId!,
      },
    };

    const [data, count] = await prisma.$transaction([
      prisma.receiptInfo.findMany({
        where: query.where,
        skip: skip,
        take: take,
        orderBy: {
          [orderByValue]: direction,
        },
      }),
      prisma.receiptInfo.count({ where: query.where }),
    ]);

    return {
      data: ReceiptOutputDto.fromEntityArray(data),
      pagination: {
        totalCount: count,
        page: page ?? 1,
        perPage: take,
      },
    };
  }

  async getById(id: number): Promise<ReceiptOutputDto> {
    const receipt = (await prisma.receiptInfo.findFirstOrThrow({
      where: { id: id, isActive: true },
    })) as ReceiptInfo;
    const s3Service = new S3FileService(this.user);
    const response = await s3Service.download(receipt.filePath);

    const returnObj = ReceiptOutputDto.fromEntity(receipt);

    if (response) returnObj.fileStream = response;

    return returnObj;
  }

  async delete(id: number): Promise<void> {
    const receipt = await prisma.receiptInfo.findFirst({
      where: {
        id: id,
        isActive: true,
      },
    });

    if (receipt) {
      const s3Service = new S3FileService(this.user);
      const fileUploadResponse = await s3Service.delete(receipt.filePath);

      if (fileUploadResponse) {
        await prisma.receiptInfo.delete({
          where: {
            id: id,
            isActive: true,
          },
        });
      } else {
        throw Error('Failed to delete the file');
      }
    }
  }
}
