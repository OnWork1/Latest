import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Receipt } from '~/interfaces/models/receipt';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useReceiptsStore = defineStore('receiptStore', () => {
  const endpoint = 'receipts';
  const expenseReceiptList = ref<Array<Receipt> | null>(null);

  const { fetchData } = useFetchData<APIResponse<any>>();
  const { deleteData } = useDeleteData();
  const runtimeConfig = useRuntimeConfig();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchReceipts = async (
    queryParams: string = '',
    fetchAll: boolean = true
  ) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll,
      queryParams
    );

    expenseReceiptList.value = response.data || [];
  };

  const downloadReceipts = async (id: number): Promise<void> => {
    const response = await fetch(
      `${runtimeConfig.public.apiUrl}/${endpoint}/${id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
        contentDisposition
      );
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const deleteReceipt = async (receiptId: number) => {
    await deleteData(endpoint, receiptId);
  };

  const clearReceiptList = () => {
    expenseReceiptList.value = [];
  };

  return {
    expenseReceiptList,
    deleteReceipt,
    downloadReceipts,
    fetchReceipts,
    pagination,
    setPaginationDetails,
    clearReceiptList,
    clearFiltersAndParameters,
  };
});
