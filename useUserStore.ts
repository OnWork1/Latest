import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type User } from '~/interfaces/models/user';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useUserStore = defineStore('userStore', () => {
  const endpoint = 'users';
  const isOperationSuccessful = ref<boolean>(false);
  const userList = ref<User[] | null>(null);

  const { data } = useAuth();
  const loggedInUser = data.value?.user;

  const { fetchData } = useFetchData<APIResponse<User>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<User>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchUsers = async (fetchAll: boolean = false) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    userList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewUser = async (userDetails: User) => {
    const response = await createData(endpoint, userDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchUsers();
  };

  const updateUser = async (userDetails: User) => {
    const response = await updateData(endpoint, userDetails);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchUsers();
  };

  const deleteUser = async (userId: number) => {
    await deleteData(endpoint, userId);
    await fetchUsers();
  };

  return {
    isOperationSuccessful,
    loggedInUser,
    userList,
    deleteUser,
    updateUser,
    createNewUser,
    fetchUsers,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
