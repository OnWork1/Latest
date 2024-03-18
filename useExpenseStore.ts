import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Expense } from '~/interfaces/models/expense';
import { ToastType } from '~/enums/toast-type';
import ExpenseCacheService from '~/services/expense-cache.service';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { ClientStatus } from '~/enums/client-status';
import { ExpenseType } from '~/enums/expense-type';
import type { APIResponse } from '~/interfaces/response/api-response';

export const useExpenseStore = defineStore('expenseStore', () => {
  const endpoint = 'expenses';
  const accountExpenseList = ref<Array<Expense> | null>(null);
  const expense = ref<Expense | null>(null);
  const newExpenseId = ref<number | null>(null);
  const { deleteData } = useDeleteData();
  const offlineStore = useOfflineStore();
  const runtimeConfig = useRuntimeConfig();
  const { setLoading, displayMessage, displayErrorMessage } = useAppStore();
  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();
  const expenseCache = new ExpenseCacheService();
  const { fetchData } = useFetchData<APIResponse<Expense>>();
  const { fetchById } = useFetchData<Expense>();

  const fetchAccountExpenses = async (
    accountId: number,
    fetchAll: boolean = false
  ) => {
    let fetchResult: Expense[] = [];
    let results: APIResponse<Expense> = {};
    if (offlineStore.isOnline) {
      results = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll,
        `accountId=${accountId}`
      );

      accountExpenseList.value = results.data || [];
      await expenseCache.addExpenseList(results.data as Expense[]);
    } else {
      fetchResult = await expenseCache.get(accountId);

      if (fetchResult) accountExpenseList.value = fetchResult;
    }
  };

  const fetchExpensesByExpenseId = async (
    accountId: number,
    expenseId: number
  ) => {
    if (offlineStore.isOnline) {
      expense.value = await fetchById(endpoint, expenseId);
    } else {
      const fetchResult = (await expenseCache.get(accountId)) as Expense[];
      if (fetchResult) {
        const cachedExpense = fetchResult.find(
          (expense) => expense.id === expenseId
        );
        if (cachedExpense) expense.value = cachedExpense;
      }
    }
  };

  const createNewExpense = async (
    expense: Expense,
    files?: File[] | FileList | undefined,
    capturedImage?: string | null
  ): Promise<void> => {
    setLoading(true);

    try {
      if (offlineStore.isOnline) {
        const formData = await prepareFormData(files, capturedImage, expense);

        const response = await fetch(
          `${runtimeConfig.public.apiUrl}/${endpoint}`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const jsonResponse = await response.json();

        newExpenseId.value = jsonResponse.response.id!;

        //Fetch details after create to refresh data.
        const expenses = await fetchData(
          endpoint,
          pagination.value.page,
          pagination.value.perPage,
          pagination.value.searchString,
          true,
          'accountId=' + expense.accountId
        );

        //@ts-ignore
        expenses.data.cacheId = expense.accountId;

        await expenseCache.addExpenseList(expenses.data as Expense[]);

        accountExpenseList.value = expenses.data || [];
      } else {
        const expenses = (await expenseCache.get(
          expense.accountId
        )) as Expense[];

        if (files && files.length) {
          expense.files = [];
          const fileRecords = await prepareFiles(files);
          expense.files = fileRecords;
        }
        expense.clientStatus = ClientStatus.NewEntry;

        expenses.push(expense);
        await expenseCache.addExpenseList(expenses);
      }

      displayMessage(ToastType.Success, 'Record created successfully');
    } catch (error) {
      displayErrorMessage(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (
    expenseId: number,
    expense: Expense,
    files?: File[] | FileList | undefined,
    capturedImage?: string | null
  ): Promise<void> => {
    setLoading(true);
    try {
      if (offlineStore.isOnline) {
        const formData = await prepareFormData(files, capturedImage, expense);

        const url = `${runtimeConfig.public.apiUrl}/${endpoint}/${expenseId}`;
        await fetch(url, {
          method: 'PATCH',
          body: formData,
        });
        //Fetch details after create to refresh data.
        const expenses = await fetchData(
          endpoint,
          pagination.value.page,
          pagination.value.perPage,
          pagination.value.searchString,
          true,
          'accountId=' + expense.accountId
        );

        //@ts-ignore
        expenses.data.cacheId = expense.accountId;

        await expenseCache.addExpenseList(expenses.data as Expense[]);

        accountExpenseList.value = expenses.data || [];

        displayMessage(ToastType.Success, 'Record updated successfully');
      } else {
        const expenses = (await expenseCache.get(
          expense.accountId
        )) as Expense[];

        for (let index = 0; index < expenses.length; index++) {
          const element = expenses[index];

          if (element.id === expenseId) {
            if (files && files.length) {
              expense.files = [];
              const fileRecords = await prepareFiles(files);
              expense.files = fileRecords;
            }

            expense.id = expenseId;
            expense.clientStatus = ClientStatus.UpdateEntry;
            expense.budgetedAmount = element.budgetedAmount;
            expense.budgetedCurrencyCode = element.budgetedCurrencyCode;
            expense.budgetedCurrencyId = element.budgetedCurrencyId;
            expense.budgetedLeaderCost = element.budgetedLeaderCost;
            expense.budgetedNoOfPax = element.budgetedNoOfPax;
            expense.budgetedPassengerCost = element.budgetedPassengerCost;

            expenses[index] = expense;

            break;
          }
        }

        expenseCache.addExpenseList(expenses);
      }
    } catch (error) {
      displayErrorMessage(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: number, accountId: number) => {
    if (offlineStore.isOnline) {
      await deleteData(endpoint, expenseId);
    } else {
      const expenses = (await expenseCache.get(accountId)) as Expense[];
      for (let index = 0; index < expenses.length; index++) {
        const element = expenses[index];

        if (element.id === expenseId) {
          expenses.splice(index, 1);
          break;
        }
      }
      await expenseCache.addExpenseList(expenses);
      await expenseCache.deleteRecord(expenseId);
    }
  };

  return {
    expense,
    accountExpenseList,
    newExpenseId,
    fetchAccountExpenses,
    fetchExpensesByExpenseId,
    deleteExpense,
    createNewExpense,
    updateExpense,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});

async function prepareFiles(files: FileList | File[]) {
  return await Promise.all(
    Array.from(files).map(async (file: File) => {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(new Blob([reader.result], { type: file.type }));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
      return {
        fileBlob: blob,
        name: file.name,
        type: file.type,
      };
    })
  );
}

async function prepareFormData(
  files: File[] | FileList | undefined,
  capturedImage: string | null | undefined,
  expense: Expense
) {
  const FILE_PREFIX = 'RU_';
  const formData = new FormData();

  if (files) {
    const filesArray = files instanceof FileList ? Array.from(files) : files;
    filesArray.forEach((file, index) => {
      formData.append(`${FILE_PREFIX}${index + 1}`, file);
    });
  }

  if (capturedImage) {
    const blob = await fetch(capturedImage).then((res) => res.blob());
    formData.append(
      `${FILE_PREFIX}${files ? files.length + 1 : 1}`,
      blob,
      'receipt.png'
    );
  }

  formData.append('payload', JSON.stringify(expense));
  return formData;
}
