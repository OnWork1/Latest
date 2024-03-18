import { defineStore } from 'pinia';
import { useOnline } from '@vueuse/core';
import type { Account } from '~/interfaces/models/account';
import type { APIResponse } from '~/interfaces/response/api-response';
import ExpenseCacheService from '~/services/expense-cache.service';
import type { Expense } from '~/interfaces/models/expense';
import { ClientStatus } from '~/enums/client-status';
import { useExpenseStore } from '~/stores/useExpenseStore';

export const useOfflineStore = defineStore('offline', () => {
  const isOnline = useOnline();
  const isMobile = false;
  const endpoint = 'expenses';
  const { fetchData } = useFetchData<APIResponse<unknown>>();
  const { pagination } = usePagination();
  const expenseCacheService = new ExpenseCacheService();
  const expenseStore = useExpenseStore();

  const fetchOfflineExpenses = async (accounts: Account[]) => {
    expenseCacheService.clear();
    accounts.forEach(async (account) => {
      if (account.id) {
        const response = await fetchData(
          endpoint,
          pagination.value.page,
          pagination.value.perPage,
          pagination.value.searchString,
          true,
          'accountId=' + account.id
        );

        //@ts-ignore
        response!.data!.cacheId = account.id;
        expenseCacheService.addExpenseList(response.data as Expense[]);
      }
    });
  };

  const syncExpenses = async () => {
    const expensesByIndexDb =
      (await expenseCacheService.getAllRecords()) as Expense[][];

    const allExpenses = expensesByIndexDb.flat();
    const expensesWithOffline = allExpenses.filter(
      (expense) => 'clientStatus' in expense
    );

    for (const expense of expensesWithOffline) {
      let filesArray: File[] | FileList | undefined = [];
      if (expense.files && expense.files.length > 0) {
        filesArray = expense.files.map((fileRecord: any) => {
          return new File([fileRecord.fileBlob], fileRecord.name, {
            type: fileRecord.type,
            lastModified: fileRecord.lastModified,
          });
        });
      }

      if (expense.clientStatus === ClientStatus.NewEntry) {
        await expenseStore.createNewExpense(expense, filesArray);
      } else if (expense.clientStatus === ClientStatus.UpdateEntry) {
        if (expense.id)
          await expenseStore.updateExpense(expense.id, expense, filesArray);
      }
    }
  };

  const syncExpensesDelete = async () => {
    const deletedExpenses =
      (await expenseCacheService.getAllDeletedRecords()) as any;

    for (const expense of deletedExpenses) {
      await expenseStore.deleteExpense(
        expense.deletedExpenseId,
        expense.cacheId
      );
    }
    expenseCacheService.clearAllDeleted();
  };

  const hasClientStatus = (obj: any) => {
    for (let key in obj) {
      if (key === 'clientStatus') return true;
      if (typeof obj[key] === 'object' && hasClientStatus(obj[key]))
        return true;
    }
    return false;
  };

  return {
    isOnline,
    isMobile,
    fetchOfflineExpenses,
    syncExpenses,
    syncExpensesDelete,
  };
});
