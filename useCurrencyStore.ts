import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Currency } from '~/interfaces/models/currency';
import { useOfflineStore } from '~/stores/useOfflineStore';
import CurrencyCacheService from '~/services/currency-cache.service';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useCurrencyStore = defineStore('currencyStore', () => {
  const endpoint = 'currencies';
  const isOperationSuccessful = ref<boolean>(false);
  const currencyList = ref<Currency[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<Currency>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Currency>>();
  const { deleteData } = useDeleteData();
  const offlineStore = useOfflineStore();
  const currencyCacheService = new CurrencyCacheService();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchCurrencies = async (fetchAll: boolean = false) => {
    if (offlineStore.isOnline) {
      const response = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll
      );
      currencyList.value = response.data || [];
      setPaginationDetails(
        pagination.value.searchString,
        response.pagination?.page,
        response.pagination?.perPage,
        response.pagination?.totalCount
      );

      if (offlineStore.isMobile) {
        await currencyCacheService.addCurrencyData(currencyList.value);
      }
    } else {
      currencyList.value =
        (await currencyCacheService.getAllRecords()) as Currency[];
    }
  };

  const createNewCurrency = async (currency: Currency) => {
    const response = await createData(endpoint, currency);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCurrencies();
  };

  const updateCurrency = async (currency: Currency) => {
    const response = await updateData(endpoint, currency);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCurrencies();
  };

  const deleteCurrency = async (currencyId: number) => {
    await deleteData(endpoint, currencyId);
    await fetchCurrencies();
  };

  return {
    isOperationSuccessful,
    currencyList,
    deleteCurrency,
    updateCurrency,
    createNewCurrency,
    fetchCurrencies,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
