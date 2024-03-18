import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type ProductBudget } from '~/interfaces/models/product-budget';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useProductBudgetStore = defineStore('productBudgetStore', () => {
  const endpoint = 'product-budgets';
  const isOperationSuccessful = ref<boolean>(false);
  const productBudgetsList = ref<ProductBudget[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<ProductBudget>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<ProductBudget>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchProductBudgets = async (id: number, fetchAll: boolean = false) => {
    const response = await fetchData(
      `${endpoint}/${id}`,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    productBudgetsList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewProductBudget = async (
    productBudgetDetails: ProductBudget
  ) => {
    const response = await createData(endpoint, productBudgetDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchProductBudgets(productBudgetDetails.productId);
  };

  const updateProductBudget = async (productBudgetDetails: ProductBudget) => {
    const response = await updateData(endpoint, productBudgetDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchProductBudgets(productBudgetDetails.productId);
  };

  const deleteProductBudget = async (
    producBudgettId: number,
    productId: number
  ) => {
    await deleteData(endpoint, producBudgettId);
    await fetchProductBudgets(productId);
  };

  return {
    isOperationSuccessful,
    productBudgetsList,
    deleteProductBudget,
    updateProductBudget,
    createNewProductBudget,
    fetchProductBudgets,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
