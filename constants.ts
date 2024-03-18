import { type PaginationFilter } from '~/interfaces/common/pagination-filter';
import { type PaymentType } from '~/interfaces/common/payment-types';
import { type CostType } from '~/interfaces/common/cost-types';
import { type OfflineValues } from '~/interfaces/common/offline-values';
import { AccountStatus } from '~/enums/account-status';
import { ExpenseType } from '~/enums/expense-type';

export const maxFileUploadSize = parseInt(
  process.env.MAX_FILE_UPLOAD_SIZE ?? '26214400'
);

export const defaultPaginationValues: PaginationFilter = {
  page: 1,
  perPage: 5,
  totalCount: 0,
  searchString: '',
};

export const accountStatuses = [
  { value: AccountStatus.DRAFT },
  { value: AccountStatus.SUBMITTED },
  { value: AccountStatus.APPROVED },
  { value: AccountStatus.REJECTED },
];

export const expenseTypes = [
  { value: ExpenseType.EXPENSE, label: 'Expense' },
  { value: ExpenseType.WITHDRAWAL, label: 'Withdrawal' },
];

export const expenseStatuses = ref([
  { status: 'Draft', value: 'DRAFT' },
  { status: 'Confirmed', value: 'CONFIRMED' },
]);

export const paymentTypes: PaymentType[] = [
  { paymentType: 'Cash', value: 'CASH' },
  { paymentType: 'Card', value: 'CARD' },
];

export const costType: CostType[] = [
  { costTypeText: 'Passenger', value: 'PERSON' },
  { costTypeText: 'Leader', value: 'LEADER' },
];

export const offlineValues: OfflineValues = {
  offlineExpense: 'offlineExpense',
  offlineFiles: 'offlineFiles',
};

export const deleteConfirmationDialogOptions = {
  message: 'Are you sure you want to delete this record?',
  header: 'Delete Confirmation',
  icon: 'pi pi-info-circle',
  rejectClass: 'p-button-text p-button-text',
  acceptClass: 'p-button-danger p-button-text',
};

export const offlineObjectStores: string[] = [
  'offline-accounts',
  'offline-products',
  'offline-departments',
  'offline-expenses',
  'offline-deleted-expenses',
  'offline-currencies',
  'offline-taxes',
  'offline-sales-tax-group',
  'offline-expense-categories',
];
