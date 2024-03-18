import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Product } from '~/interfaces/models/product';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { type APIResponse } from '~/interfaces/response/api-response';
import ProductCacheService from '~/services/product-cache.service';

export const useProductStore = defineStore('productStore', () => {
  const endpoint = 'products';
  const isOperationSuccessful = ref<boolean>(false);
  const product = ref<Product | null>(null);
  const productList = ref<Product[] | null>(null);
  const offlineStore = useOfflineStore();
  const productCacheService = new ProductCacheService();

  const { fetchById } = useFetchData<Product>();
  const { fetchData } = useFetchData<APIResponse<Product>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Product>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchProductById = async (productId: number) => {
    const response = await fetchById(endpoint, productId);
    product.value = response || null;
  };

  const fetchProducts = async (
    fetchAll: boolean = false,
    queryParams: string = ''
  ) => {
    if (offlineStore.isOnline) {
      const response = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll,
        queryParams
      );

      productList.value = response.data || [];
      setPaginationDetails(
        pagination.value.searchString,
        response.pagination?.page,
        response.pagination?.perPage,
        response.pagination?.totalCount
      );
      if (offlineStore.isMobile) {
        await productCacheService.addProductData(productList.value);
      }
    } else {
      productList.value =
        (await productCacheService.getAllRecords()) as Product[];
    }
  };

  const createNewProduct = async (productDetails: Product) => {
    const response = await createData(endpoint, productDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchProducts();
  };

  const updateProduct = async (productDetails: Product) => {
    const response = await updateData(endpoint, productDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchProducts();
  };

  const deleteProduct = async (productId: number) => {
    await deleteData(endpoint, productId);
    await fetchProducts();
  };

  return {
    isOperationSuccessful,
    product,
    productList,
    deleteProduct,
    updateProduct,
    createNewProduct,
    fetchProductById,
    fetchProducts,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
