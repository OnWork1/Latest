import {
  type Budget,
  CostType,
  type Currency,
  type Department,
  PaymentType,
  Prisma,
  PrismaClient,
  type Tax,
  type ExpenseCategory,
  type SalesTaxGroup,
} from '@prisma/client';
import BudgetUploadDto from '../dtos/budget-upload/budget-upload-input.dto';
import CurrencyService from './currency.service';
import BudgetUploadOutputDto from '../dtos/budget-upload/budget-upload-output.dto';
import TaxService from './tax.service';
import DepartmentService from './department.service';
import prisma from '~/prisma/client';
import getISODateTime from '~/utils/get-iso-date-time';
import { type DefaultArgs } from '@prisma/client/runtime/library';
import { ExpenseCategoryService } from './expense-category.service';
import type BudgetInputDto from '../dtos/budget/budget-input.dto';
import SalesTaxGroupService from './sales-tax-group.service';

export default class BudgetUploadService {
  constructor(private user: string) {}

  async process(
    budgetUploads: BudgetUploadDto[]
  ): Promise<{ uploadStatus: boolean; results: BudgetUploadOutputDto[] }> {
    //Below arrays are used to cache data during the validation process to avoid hitting the DB for already validated codes
    const validatedCurrencyCodes: Currency[] = [];
    const validatedTaxCodes: Tax[] = [];
    const validatedTaxGroupCodes: SalesTaxGroup[] = [];
    const validatedDepartmentCodes: Department[] = [];
    const validatedExpenseCodes: ExpenseCategory[] = [];
    const result: BudgetUploadOutputDto[] = [];
    const validatedBudgetDetails: {
      budgetInput: BudgetInputDto;
      budgetUpload: BudgetUploadDto;
    }[] = [];
    let isValidationSuccessful: boolean = true;

    for (const budgetUpload of budgetUploads) {
      const budgetInput: BudgetInputDto = {
        dayNumber: budgetUpload.DayNumber ? +budgetUpload.DayNumber : undefined,
        expenseTitle: budgetUpload.ExpenseTitle,
        expenseCategoryId: 0,
        //currencyId: 0,
        paymentType: PaymentType.CASH,
        //taxId: 0,
        //departmentId: 0,
        productId: budgetUpload.ProductId,
        // salesTaxGroupId: 0,
      };

      const {
        isCurrencyValid,
        isPaymentTypeValid,
        isTaxCodeValid,
        isDepartmentCodeValid,
        isExpenseCodeValid,
        isTaxGroupValid,
        isExpenseTitleValid,
      } = await this.validate(
        validatedCurrencyCodes,
        budgetUpload,
        budgetInput,
        result,
        validatedTaxCodes,
        validatedDepartmentCodes,
        validatedExpenseCodes,
        validatedTaxGroupCodes
      );

      isValidationSuccessful =
        isCurrencyValid &&
        isPaymentTypeValid &&
        isTaxCodeValid &&
        isDepartmentCodeValid &&
        isExpenseCodeValid &&
        isTaxGroupValid &&
        isExpenseTitleValid &&
        isValidationSuccessful;

      if (isValidationSuccessful) {
        validatedBudgetDetails.push({ budgetInput, budgetUpload });
        console.debug(`Validation Completed `);
      }
    }

    //All or none. Commit only if all items are validated successfully
    if (isValidationSuccessful) {
      await prisma.$transaction(
        async (transaction) => {
          for (let index = 0; index < validatedBudgetDetails.length; index++) {
            const item = validatedBudgetDetails[index];

            const commitResult = await this.commit(
              item.budgetInput,
              item.budgetUpload,
              transaction
            );
            result.push(commitResult);
          }
        },
        {
          timeout: +process!.env!.TRANSACTION_TIMEOUT!
            ? +process!.env!.TRANSACTION_TIMEOUT!
            : 5000,
        }
      );
    }
    return { uploadStatus: isValidationSuccessful, results: result };
  }

  private async validate(
    validatedCurrencyCodes: Currency[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto,
    result: BudgetUploadOutputDto[],
    validatedTaxyCodes: Tax[],
    validatedDepartmentCodes: Department[],
    validatedExpenseCodes: ExpenseCategory[],
    validatedTaxGroupCodes: SalesTaxGroup[]
  ) {
    let isCurrencyValid = false;
    let isPaymentTypeValid = false;
    let isTaxCodeValid = false;
    let isDepartmentCodeValid = false;
    let isExpenseCodeValid = false;
    let isTaxGroupValid = false;
    let isExpenseTitleValid = false;

    if (budgetUpload.CurrencyCode) {
      isCurrencyValid = await this.validateAndPopulateCurrency(
        validatedCurrencyCodes,
        budgetUpload,
        budgetInput
      );

      if (!isCurrencyValid) {
        const currencyStatus = this.prepareOutput(
          isCurrencyValid,
          budgetUpload,
          'CURRENCY_CODE'
        );
        result.push(currencyStatus);
      }
    } else {
      // const currencyStatus = this.prepareOutput(
      //   isCurrencyValid,
      //   budgetUpload,
      //   'CURRENCY_CODE_EMPTY'
      // );
      // currencyStatus.isSuccess = true;
      // result.push(currencyStatus);
      isCurrencyValid = true;
    }

    //if (budgetUpload.PaymentType) {
    if (budgetUpload.PaymentType)
      budgetUpload.PaymentType = budgetUpload.PaymentType.toUpperCase();

    isPaymentTypeValid = await this.validatePaymentType(
      budgetUpload,
      budgetInput
    );
    if (!isPaymentTypeValid) {
      const paymentTypeStatus = this.prepareOutput(
        isPaymentTypeValid,
        budgetUpload,
        'PAYMENT_TYPE'
      );
      result.push(paymentTypeStatus);
    }
    // } else {
    //   // const paymentTypeStatus = this.prepareOutput(
    //   //   isPaymentTypeValid,
    //   //   budgetUpload,
    //   //   'PAYMENT_TYPE_EMPTY'
    //   // );
    //   // paymentTypeStatus.isSuccess = false;
    //   // result.push(paymentTypeStatus);
    //   isPaymentTypeValid = true;
    // }

    if (budgetUpload.SalesTaxCode) {
      isTaxCodeValid = await this.validateAndPopulateTax(
        validatedTaxyCodes,
        budgetUpload,
        budgetInput
      );

      if (!isTaxCodeValid) {
        const taxCodeStatus = this.prepareOutput(
          isTaxCodeValid,
          budgetUpload,
          'TAX_CODE'
        );
        result.push(taxCodeStatus);
      }
    } else {
      // const taxCodeStatus = this.prepareOutput(
      //   isTaxCodeValid,
      //   budgetUpload,
      //   'TAX_CODE_EMPTY'
      // );
      // taxCodeStatus.isSuccess = false;
      // result.push(taxCodeStatus);
      isTaxCodeValid = true;
    }

    if (budgetUpload.SalesTaxGroup) {
      isTaxGroupValid = await this.validateAndPopulateTaxGroup(
        validatedTaxGroupCodes,
        budgetUpload,
        budgetInput
      );

      if (!isTaxGroupValid) {
        const taxGroupStatus = this.prepareOutput(
          isTaxCodeValid,
          budgetUpload,
          'SALES_TAX_GROUP'
        );
        result.push(taxGroupStatus);
      }
    } else {
      // const taxGroupStatus = this.prepareOutput(
      //   isTaxCodeValid,
      //   budgetUpload,
      //   'SALES_TAX_GROUP_EMPTY'
      // );
      // taxGroupStatus.isSuccess = false;
      // result.push(taxGroupStatus);
      isTaxGroupValid = true;
    }

    if (budgetUpload.DepartmentCode) {
      isDepartmentCodeValid = await this.validateAndPopulateDepartment(
        validatedDepartmentCodes,
        budgetUpload,
        budgetInput
      );

      if (!isDepartmentCodeValid) {
        const departmentCodeStatus = this.prepareOutput(
          isDepartmentCodeValid,
          budgetUpload,
          'DEPARTMENT_CODE'
        );
        result.push(departmentCodeStatus);
      }
    } else {
      // const departmentCodeStatus = this.prepareOutput(
      //   isDepartmentCodeValid,
      //   budgetUpload,
      //   'DEPARTMENT_CODE_EMPTY'
      // );
      // departmentCodeStatus.isSuccess = false;
      // result.push(departmentCodeStatus);
      isDepartmentCodeValid = true;
    }
    if (budgetUpload.ExpenseCode) {
      isExpenseCodeValid = await this.validateAndPopulateExpenseCode(
        validatedExpenseCodes,
        budgetUpload,
        budgetInput
      );

      if (!isExpenseCodeValid) {
        const expenseCodeStatus = this.prepareOutput(
          isExpenseCodeValid,
          budgetUpload,
          'EXPENSE_CODE'
        );
        result.push(expenseCodeStatus);
      }
    } else {
      const expenseCodeStatus = this.prepareOutput(
        isExpenseCodeValid,
        budgetUpload,
        'EXPENSE_CODE_EMPTY'
      );
      expenseCodeStatus.isSuccess = false;
      result.push(expenseCodeStatus);
    }

    if (
      budgetUpload.ExpenseTitle &&
      budgetUpload.ExpenseTitle.trim().length > 0
    ) {
      isExpenseTitleValid = true;
    } else {
      const expenseTitleStatus = this.prepareOutput(
        isExpenseCodeValid,
        budgetUpload,
        'EXPENSE_TITLE_EMPTY'
      );
      expenseTitleStatus.isSuccess = false;
      result.push(expenseTitleStatus);
    }

    return {
      isCurrencyValid,
      isPaymentTypeValid,
      isTaxCodeValid,
      isDepartmentCodeValid,
      isExpenseCodeValid,
      isTaxGroupValid,
      isExpenseTitleValid,
    };
  }

  private async commit(
    budgetInput: BudgetInputDto,
    budgetUpload: BudgetUploadDto,
    tran: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ): Promise<BudgetUploadOutputDto> {
    const budgetResult = await tran.budget.create({
      data: {
        ...budgetInput,
        isActive: true,
        createdBy: this.user,
        createdDate: getISODateTime(),
        expenseCode: budgetUpload.ExpenseCode,
      },
      include: { Product: true },
    });

    //clear all cost entries under this budget item
    await tran.cost.deleteMany({
      where: { budgetId: budgetResult.id },
    });

    const productInfo = await tran.budget.findFirst({
      where: { id: budgetResult.id },
      select: {
        productId: true,
        currencyId: true,
      },
    });

    const product = await tran.product.findFirst({
      where: { id: productInfo?.productId },
    });

    const includeBaseCurrency = Prisma.validator<Prisma.CompanyInclude>()({
      BaseCurrency: true,
    });

    const company = await tran.company.findFirst({
      where: { id: product?.companyId },
      include: includeBaseCurrency,
    });

    const budgetCurrency = await tran.currency.findFirst({
      where: { id: productInfo?.currencyId ?? 0 },
    });

    let baseCurrencyAmount = new Prisma.Decimal(0);

    //Create Cost entries (Pax Costs) corresponding to 16 columns of the CSV upload
    for (let index = 1; index < 17; index++) {
      const element =
        +budgetUpload[`PassengerCost_${index}` as keyof typeof budgetUpload];
      if (element && element > 0) {
        if (productInfo?.currencyId != company?.baseCurrencyId) {
          baseCurrencyAmount = new Prisma.Decimal(
            element * (budgetCurrency?.currencyRate ?? 1)
          );

          baseCurrencyAmount = new Prisma.Decimal(
            baseCurrencyAmount.toNumber() /
              (company?.BaseCurrency?.currencyRate ?? 1)
          );
        } else {
          baseCurrencyAmount = new Prisma.Decimal(element * 1);
        }

        await tran.cost.create({
          data: {
            costType: CostType.PERSON,
            sequence: index,
            costAmount: new Prisma.Decimal(element),
            baseCurrencyAmount: baseCurrencyAmount,
            baseCurrencyCode: company?.BaseCurrency.currencyCode,
            isActive: true,
            createdBy: this.user,
            createdDate: getISODateTime(),
            budgetId: budgetResult.id,
          },
        });
      }
    }

    baseCurrencyAmount = new Prisma.Decimal(0);
    //Create Cost entries (Leader Costs) corresponding to 5 columns of the CSV upload
    for (let index = 1; index < 6; index++) {
      const element =
        +budgetUpload[`LeaderCost_${index}` as keyof typeof budgetUpload];
      if (element && element > 0) {
        if (productInfo?.currencyId != company?.baseCurrencyId) {
          baseCurrencyAmount = new Prisma.Decimal(
            element * (budgetCurrency?.currencyRate ?? 1)
          );

          baseCurrencyAmount = new Prisma.Decimal(
            baseCurrencyAmount.toNumber() /
              (company?.BaseCurrency?.currencyRate ?? 1)
          );
        } else {
          baseCurrencyAmount = new Prisma.Decimal(element * 1);
        }

        await tran.cost.create({
          data: {
            costType: CostType.LEADER,
            sequence: index,
            costAmount: new Prisma.Decimal(element),
            baseCurrencyAmount: baseCurrencyAmount,
            baseCurrencyCode: company?.BaseCurrency.currencyCode,
            isActive: true,
            createdBy: this.user,
            createdDate: getISODateTime(),
            budgetId: budgetResult.id,
          },
        });
      }
    }

    return BudgetUploadOutputDto.fromEntity(
      budgetResult,
      budgetUpload.CurrencyCode,
      budgetUpload.SalesTaxCode,

      budgetUpload.DepartmentCode,
      budgetResult.Product.productCode,
      true,
      '',
      budgetUpload.RowNumber,
      budgetUpload.SalesTaxGroup
    );
  }

  private prepareOutput(
    isSuccess: boolean,
    budgetUpload: BudgetUploadDto,
    type: string
  ): BudgetUploadOutputDto {
    let errorMessage: string = '';

    switch (type) {
      case 'PAYMENT_TYPE':
        errorMessage = `Payment Type: ${budgetUpload.PaymentType} is invalid`;
        break;
      case 'PAYMENT_TYPE_EMPTY':
        errorMessage = `Payment type  is required`;
        break;
      case 'CURRENCY_CODE':
        errorMessage = `Currency Code: ${budgetUpload.CurrencyCode} is invalid`;
        break;
      // case 'CURRENCY_CODE_EMPTY':
      //   errorMessage = `Currency code is required`;
      //   break;
      case 'TAX_CODE':
        errorMessage = `Sales Tax Code: ${budgetUpload.SalesTaxCode} is invalid`;
        break;
      // case 'TAX_CODE_EMPTY':
      //   errorMessage = `Sales tax code is required`;
      //break;
      case 'SALES_TAX_GROUP':
        errorMessage = `Sales Tax Group: ${budgetUpload.SalesTaxGroup} is invalid`;
        break;
      // case 'SALES_TAX_GROUP_EMPTY':
      //   errorMessage = `Sales tax group is required`;
      //break;
      case 'DEPARTMENT_CODE':
        errorMessage = `Department Code: ${budgetUpload.DepartmentCode} is invalid`;
        break;
      // case 'DEPARTMENT_CODE_EMPTY':
      //   errorMessage = `Department code is required`;
      //   break;
      case 'EXPENSE_CODE':
        errorMessage = `Expense Code: ${budgetUpload.ExpenseCode} is invalid`;
        break;
      case 'EXPENSE_CODE_EMPTY':
        errorMessage = `Expense Code is required`;
        break;
      case 'EXPENSE_TITLE_EMPTY':
        errorMessage = `Expense title is required`;
        break;
      default:
        break;
    }

    return new BudgetUploadOutputDto(
      0,
      budgetUpload.ExpenseTitle,
      budgetUpload.ExpenseCode,
      +budgetUpload.DayNumber,
      budgetUpload.CurrencyCode,
      budgetUpload.PaymentType as PaymentType,
      budgetUpload.SalesTaxCode,
      budgetUpload.SalesTaxGroup,
      budgetUpload.DepartmentCode,
      '',
      isSuccess,
      errorMessage,
      budgetUpload.RowNumber
    );
  }

  private async validatePaymentType(
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    switch (budgetUpload.PaymentType) {
      case PaymentType.CARD:
      case PaymentType.CASH:
        result = true;
        budgetInput.paymentType = budgetUpload.PaymentType;
        break;
      default:
        result = true;
        budgetInput.paymentType = undefined;
        break;
    }
    return result;
  }

  private async validateAndPopulateCurrency(
    validatedCurrencyCodes: Currency[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    let currency = validatedCurrencyCodes.find(
      (item) =>
        item.currencyCode.toUpperCase().trim() ==
        budgetUpload.CurrencyCode?.toUpperCase().trim()
    );

    if (!currency) {
      //try fetching from DB if the cached collection has no data
      const currencyService = new CurrencyService(this.user);

      currency =
        (await currencyService.getByCode(
          budgetUpload.CurrencyCode.toUpperCase()
        )) ?? undefined;

      if (currency) {
        result = true;
        validatedCurrencyCodes.push(currency);
        budgetInput.currencyId = currency.id;
      }
    } else {
      budgetInput.currencyId = currency.id;
      result = true;
    }

    return result;
  }

  private async validateAndPopulateTax(
    validatedTaxCodes: Tax[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    let tax = validatedTaxCodes.find(
      (item) =>
        item.taxCode.toUpperCase().trim() ==
        budgetUpload.SalesTaxCode?.toUpperCase().trim()
    );

    //try fetching from DB if the cached collection has no data
    if (!tax) {
      const taxService = new TaxService(this.user);

      tax = (await taxService.getByCode(
        budgetUpload.SalesTaxCode
      )) as unknown as Tax;

      if (tax) {
        result = true;
        validatedTaxCodes.push(tax);
        budgetInput.taxId = tax.id;
      }
    } else {
      result = true;
      budgetInput.taxId = tax.id;
    }

    return result;
  }

  private async validateAndPopulateTaxGroup(
    validatedTaxGroupCodes: SalesTaxGroup[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    let taxGroup = validatedTaxGroupCodes.find(
      (item) =>
        item.salesTaxGroupCode.toUpperCase().trim() ==
        budgetUpload.SalesTaxGroup?.toUpperCase().trim()
    );

    //try fetching from DB if the cached collection has no data
    if (!taxGroup) {
      const taxGroupService = new SalesTaxGroupService(this.user);

      taxGroup = (await taxGroupService.getByCode(
        budgetUpload.SalesTaxGroup
      )) as unknown as SalesTaxGroup;

      if (taxGroup) {
        result = true;
        validatedTaxGroupCodes.push(taxGroup);
        budgetInput.salesTaxGroupId = taxGroup.id;
      }
    } else {
      result = true;
      budgetInput.salesTaxGroupId = taxGroup.id;
    }

    return result;
  }

  private async validateAndPopulateExpenseCode(
    validatedExpenseCodes: ExpenseCategory[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    let expense = validatedExpenseCodes.find(
      (item) =>
        item.expenseCode.toUpperCase().trim() ==
        budgetUpload.ExpenseCode?.toUpperCase().trim()
    );

    //try fetching from DB if the cached collection has no data
    if (!expense) {
      const expenseService = new ExpenseCategoryService(this.user);

      expense =
        (await expenseService.getByCode(budgetUpload.ExpenseCode)) ?? undefined;

      if (expense) {
        result = true;
        validatedExpenseCodes.push(expense);
        budgetInput.expenseCategoryId = expense.id;
      }
    } else {
      result = true;
      budgetInput.expenseCategoryId = expense.id;
    }

    return result;
  }

  private async validateAndPopulateDepartment(
    validatedDepartmentCodes: Department[],
    budgetUpload: BudgetUploadDto,
    budgetInput: BudgetInputDto
  ): Promise<boolean> {
    let result = false;
    let department = validatedDepartmentCodes.find(
      (item) =>
        item.departmentCode.toUpperCase().trim() ==
        budgetUpload.DepartmentCode?.toUpperCase().trim()
    );

    //try fetching from DB if the cached collection has no data
    if (!department) {
      const departmentService = new DepartmentService(this.user);

      department = (await departmentService.getByCode(
        budgetUpload.DepartmentCode
      )) as unknown as Department;

      if (department) {
        result = true;
        validatedDepartmentCodes.push(department);
        budgetInput.departmentId = department.id;
      }
    } else {
      result = true;
      budgetInput.departmentId = department.id;
    }

    return result;
  }
}
