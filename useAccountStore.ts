import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Account } from '~/interfaces/models/account';
import { type APIResponse } from '~/interfaces/response/api-response';
import { useOfflineStore } from '~/stores/useOfflineStore';
import AccountCacheService from '~/services/account-cache.service';
import { AccountStatus } from '~/enums/account-status';

export const useAccountStore = defineStore('accountStore', () => {
  const endpoint = 'accounts';
  const isOperationSuccessful = ref<boolean>(false);
  const accountsList = ref<Account[] | null>(null);
  const account = ref<Account | null>(null);

  const { fetchData } = useFetchData<APIResponse<Account>>();
  const { fetchById } = useFetchData<Account>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Account>>();
  const { deleteData } = useDeleteData();
  const offlineStore = useOfflineStore();
  const accountCache = new AccountCacheService();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchAccounts = async (fetchAll: boolean = false) => {
    let fetchResult;

    if (offlineStore.isOnline) {
      const result = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll
      );

      fetchResult = result;
      if (offlineStore.isMobile) {
        accountCache.add(fetchResult);

        await offlineStore.fetchOfflineExpenses(fetchResult.data as Account[]);
      }
    } else {
      fetchResult = (await accountCache.get()) as APIResponse<Account>;
    }

    accountsList.value = fetchResult?.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      fetchResult?.pagination!.page,
      fetchResult?.pagination!.perPage,
      fetchResult?.pagination!.totalCount
    );
  };

  const fetchAccountByAccountId = async (accountId: number) => {
    if (offlineStore.isOnline) {
      account.value = (await fetchById(endpoint, accountId)) as Account;
    } else {
      const response = await accountCache.get();

      account.value = response.data.find(
        (item: Account) => item && item.id === accountId
      );
    }
  };

  const createNewAccount = async (
    accountDetails: Account,
    refetchAccounts: boolean = true
  ) => {
    const response = await createData(endpoint, accountDetails);
    isOperationSuccessful.value = Boolean(response.id!);

    if (refetchAccounts) {
      await fetchAccounts();
    }
  };

  const updateAccount = async (accountDetails: Account) => {
    const response = await updateData(endpoint, accountDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchAccounts();
  };

  const deleteAccount = async (accountId: number) => {
    await deleteData(endpoint, accountId);
    await fetchAccounts();
  };

  return {
    isOperationSuccessful,
    accountsList,
    account,
    deleteAccount,
    updateAccount,
    createNewAccount,
    fetchAccounts,
    fetchAccountByAccountId,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
