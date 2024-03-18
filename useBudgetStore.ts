import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Budget } from '~/interfaces/models/budget';
import { type UploadResult } from '~/interfaces/models/upload-result';
import { type APIResponse } from '~/interfaces/response/api-response';
import { ToastType } from '~/enums/toast-type';

export const useBudgetStore = defineStore('budgetStore', () => {
  const endpoint = 'budgets';
  const isOperationSuccessful = ref<boolean>(false);
  const budgetsList = ref<Budget[] | null>(null);
  const uploadStatus = ref(true);
  const uploadResults = ref<UploadResult[]>([]);

  const { fetchData } = useFetchData<APIResponse<Budget>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Budget>>();
  const { deleteData } = useDeleteData();
  const runtimeConfig = useRuntimeConfig();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();
  const { setLoading, displayMessage, displayErrorMessage } = useAppStore();

  const fetchBudgets = async () => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString
    );

    budgetsList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewBudget = async (budgetDetails: Budget) => {
    const response = await createData(endpoint, budgetDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    //await fetchBudgets();
  };

  const uploadNewFile = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${runtimeConfig.public.apiUrl}/budgets/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();
      uploadStatus.value = result.response.uploadStatus;
      uploadResults.value = result.response.results;

      if (uploadStatus.value) {
        displayMessage(ToastType.Success, 'File Uploaded Successfully');
      } else if (uploadResults.value.length === 0) {
        displayMessage(ToastType.Error, 'Please Upload a Valid file');
      } else {
        displayMessage(ToastType.Error, 'File Upload Failed');
      }
      setLoading(false);
      return result;
    } catch (error) {
      displayErrorMessage(error);
      throw error;
    }
  };

  const updateBudget = async (budgetDetails: Budget) => {
    const response = await updateData(endpoint, budgetDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    //await fetchBudgets();
  };

  const deleteBudget = async (budgetId: number) => {
    await deleteData(endpoint, budgetId);
    // await fetchBudgets();
  };

  return {
    isOperationSuccessful,
    budgetsList,
    deleteBudget,
    updateBudget,
    createNewBudget,
    fetchBudgets,
    uploadNewFile,
    pagination,
    uploadStatus,
    uploadResults,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
