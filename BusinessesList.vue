<template>
  <Message
    v-if="!businessStore.businessesList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="businessStore.businessesList?.length"
    v-model:editingRows="editingRows"
    :value="businessStore.businessesList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="businessStore.pagination.perPage"
    :totalRecords="businessStore.pagination.totalCount"
    @page="fetchPaginatedBusinesses"
  >
    <Column field="businessCode" header="Business Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="businessName" header="Business Name">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
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
          @click="removeBusiness(slotProps.data)"
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
import { type Business } from '~/interfaces/models/business';
import { useBusinessStore } from '~/stores/useBusinessStore';
import { useAppStore } from '~/stores/useAppStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const businessStore = useBusinessStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  businessStore.clearFiltersAndParameters();
  await businessStore.fetchBusinesses();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await businessStore.updateBusiness({ ...newData });
};

const removeBusiness = async (event: Business) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await businessStore.deleteBusiness(event.id!);
    },
  });
};

const fetchPaginatedBusinesses = async (event: any) => {
  businessStore.setPaginationDetails(undefined, event.page + 1);
  await businessStore.fetchBusinesses();
};
</script>
