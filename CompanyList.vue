<template>
  <Message
    v-if="!companyStore.companyList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="companyStore.companyList?.length"
    v-model:editingRows="editingRows"
    :value="companyStore.companyList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="500px"
    :rows="companyStore.pagination.perPage"
    :totalRecords="companyStore.pagination.totalCount"
    @page="fetchPaginatedCompanies"
    tableStyle="min-width: 50rem"
    :pt="{
      table: { style: 'min-width: 50rem' },
      column: {
        bodycell: ({ state }: any) => ({
          style:
            state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem',
        }),
      },
    }"
  >
    <Column field="companyCode" header="Company Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="companyName" header="Company Name">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="baseCurrencyId" header="Base Currency">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a base currency"
          :options="currencyList"
          optionLabel="currencyCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.baseCurrencyCode }}
      </template>
    </Column>
    <Column
      :rowEditor="true"
      style="max-width: 3rem"
      bodyStyle="text-align:center"
    >
    </Column>
    <Column style="max-width: 2rem" bodyStyle="text-align:center">
      <template #body="slotProps">
        <div
          class="text-red-500 cursor-pointer"
          @click="removeCompany(slotProps.data)"
        >
          <i class="pi pi-trash" />
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type Company } from '~/interfaces/models/company';
import { useAppStore } from '~/stores/useAppStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useCurrencyStore } from '~/stores/useCurrencyStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const companyStore = useCompanyStore();
const currencyStore = useCurrencyStore();
const editingRows = ref([]);
const confirm = useConfirm();

const currencyList = computed(() => {
  return currencyStore.currencyList || [];
});

onMounted(async () => {
  companyStore.clearFiltersAndParameters();
  await companyStore.fetchCompanies();
  await currencyStore.fetchCurrencies(true);
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await companyStore.updateCompany({ ...newData });
};

const removeCompany = async (event: Company) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await companyStore.deleteCompany(event.id!);
    },
  });
};

const fetchPaginatedCompanies = async (event: any) => {
  companyStore.setPaginationDetails(undefined, event.page + 1);
  await companyStore.fetchCompanies();
};
</script>
