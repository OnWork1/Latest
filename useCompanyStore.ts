import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Company } from '~/interfaces/models/company';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useCompanyStore = defineStore('companyStore', () => {
  const endpoint = 'companies';
  const isOperationSuccessful = ref<boolean>(false);
  const companyList = ref<Company[] | null>(null);

  const { fetchData } = useFetchData<APIResponse<Company>>();
  const { updateData } = useUpdateData();
  const { createData } = useCreateData<APIResponse<Company>>();
  const { deleteData } = useDeleteData();

  const { pagination, setPaginationDetails, clearFiltersAndParameters } =
    usePagination();

  const fetchCompanies = async (fetchAll: boolean = false) => {
    const response = await fetchData(
      endpoint,
      pagination.value.page,
      pagination.value.perPage,
      pagination.value.searchString,
      fetchAll
    );

    companyList.value = response.data || [];
    setPaginationDetails(
      pagination.value.searchString,
      response.pagination?.page,
      response.pagination?.perPage,
      response.pagination?.totalCount
    );
  };

  const createNewCompany = async (company: Company) => {
    const response = await createData(endpoint, company);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCompanies();
  };

  const updateCompany = async (company: Company) => {
    const response = await updateData(endpoint, company);
    isOperationSuccessful.value = Boolean(response.id!);
    await fetchCompanies();
  };

  const deleteCompany = async (companyId: number) => {
    await deleteData(endpoint, companyId);
    await fetchCompanies();
  };

  return {
    isOperationSuccessful,
    companyList,
    deleteCompany,
    updateCompany,
    createNewCompany,
    fetchCompanies,
    pagination,
    setPaginationDetails,
    clearFiltersAndParameters,
  };
});
