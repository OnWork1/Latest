import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type ExpenseCategory } from '~/interfaces/models/expense-category';
import { type APIResponse } from '~/interfaces/response/api-response';
import { useOfflineStore } from '~/stores/useOfflineStore';
import ExpenseCategoryCacheService from '~/services/expense-category-cache.service';

export const useExpenseCategoryStore = defineStore(
  'expenseCategoryStore',
  () => {
    const endpoint = 'expense-categories';
    const isOperationSuccessful = ref<boolean>(false);
    const expenseCategories = ref<ExpenseCategory[] | null>(null);

    const { fetchData } = useFetchData<APIResponse<ExpenseCategory>>();
    const { updateData } = useUpdateData();
    const { createData } = useCreateData<APIResponse<ExpenseCategory>>();
    const { deleteData } = useDeleteData();
    const offlineStore = useOfflineStore();
    const expenseCategoryCacheService = new ExpenseCategoryCacheService();

    const { pagination, setPaginationDetails, clearFiltersAndParameters } =
      usePagination();

    const fetchExpenseCategories = async (fetchAll: boolean = false) => {
      if (offlineStore.isOnline) {
        const response = await fetchData(
          endpoint,
          pagination.value.page,
          pagination.value.perPage,
          pagination.value.searchString,
          fetchAll
        );

        expenseCategories.value = response.data || [];
        setPaginationDetails(
          pagination.value.searchString,
          response.pagination?.page,
          response.pagination?.perPage,
          response.pagination?.totalCount
        );
        if (offlineStore.isMobile) {
          await expenseCategoryCacheService.addExpenseCategoryData(
            expenseCategories.value
          );
        }
      } else {
        expenseCategories.value =
          (await expenseCategoryCacheService.getAllRecords()) as ExpenseCategory[];
      }
    };

    const createNewExpenseCategory = async (
      expenseCategory: ExpenseCategory
    ) => {
      const response = await createData(endpoint, expenseCategory);
      isOperationSuccessful.value = Boolean(response.id!);
      await fetchExpenseCategories();
    };

    const updateExpenseCategory = async (expenseCategory: ExpenseCategory) => {
      const response = await updateData(endpoint, expenseCategory);
      isOperationSuccessful.value = Boolean(response.id!);
      await fetchExpenseCategories();
    };

    const deleteExpenseCategory = async (expenseCategoryId: number) => {
      await deleteData(endpoint, expenseCategoryId);
      await fetchExpenseCategories();
    };

    return {
      isOperationSuccessful,
      expenseCategories,
      deleteExpenseCategory,
      updateExpenseCategory,
      createNewExpenseCategory,
      fetchExpenseCategories,
      pagination,
      setPaginationDetails,
      clearFiltersAndParameters,
    };
  }
);
