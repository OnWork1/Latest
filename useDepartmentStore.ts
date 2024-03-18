import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Department } from '~/interfaces/models/department';
import { type APIResponse } from '~/interfaces/response/api-response';
import { useOfflineStore } from '~/stores/useOfflineStore';
import DepartmentCacheService from '~/services/department-cache.service';

export const useDepartmentStore = defineStore('departmentStore', () => {
  const endpoint = 'departments';
  const isOperationSuccessful = ref<boolean>(false);
  const departmentList = ref<Department[] | null>(null);
  const offlineStore = useOfflineStore();
  const departmentCacheService = new DepartmentCacheService();

  const { fetchData } = useFetchData<APIResponse<Department>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Department>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchDepartments = async (fetchAll: boolean = false) => {
    if (offlineStore.isOnline) {
      const response = await fetchData(
        endpoint,
        pagination.value.page,
        pagination.value.perPage,
        pagination.value.searchString,
        fetchAll
      );

      departmentList.value = response.data || [];
      setPaginationDetails(
        pagination.value.searchString,
        response.pagination?.page,
        response.pagination?.perPage,
        response.pagination?.totalCount
      );

      if (offlineStore.isMobile) {
        await departmentCacheService.addDepartmentData(
          'department',
          departmentList.value
        );
      }
    } else {
      departmentList.value =
        (await departmentCacheService.getAllRecords()) as Department[];
    }
  };

  const createNewDepartment = async (department: Department) => {
    const response = await createData(endpoint, department);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchDepartments();
  };

  const updateDepartment = async (department: Department) => {
    const response = await updateData(endpoint, department);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchDepartments();
  };

  const deleteDepartment = async (deparmentId: number) => {
    await deleteData(endpoint, deparmentId);
    await fetchDepartments();
  };

  return {
    isOperationSuccessful,
    departmentList,
    deleteDepartment,
    updateDepartment,
    createNewDepartment,
    fetchDepartments,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
