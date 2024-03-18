<template>
  <Message
    v-if="!brandStore.brandsList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="brandStore.brandsList?.length"
    v-model:editingRows="editingRows"
    :value="brandStore.brandsList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="brandStore.pagination.perPage"
    :totalRecords="brandStore.pagination.totalCount"
    @page="fetchPaginatedBrands"
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
    <Column field="brandName" header="Brand Name">
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
          @click="removeBrand(slotProps.data)"
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
import { type Brand } from '~/interfaces/models/brand';
import { useBrandStore } from '~/stores/useBrandStore';
import { useAppStore } from '~/stores/useAppStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const brandStore = useBrandStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  brandStore.clearFiltersAndParameters();
  await brandStore.fetchBrands();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await brandStore.updateBrand({ ...newData });
};

const removeBrand = async (event: Brand) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await brandStore.deleteBrand(event.id!);
    },
  });
};

const fetchPaginatedBrands = async (event: any) => {
  brandStore.setPaginationDetails(undefined, event.page + 1);
  await brandStore.fetchBrands();
};
</script>
