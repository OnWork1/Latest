<template>
  <Message
    v-if="!salesTaxGroupStore.salesTaxGroupList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="salesTaxGroupStore.salesTaxGroupList?.length"
    v-model:editingRows="editingRows"
    :value="salesTaxGroupStore.salesTaxGroupList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="salesTaxGroupStore.pagination.perPage"
    :totalRecords="salesTaxGroupStore.pagination.totalCount"
    @page="fetchPaginatedTaxGroups"
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
    <Column field="salesTaxGroupCode" header="Sales Tax Group Code">
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
          @click="removeSalesTaxGroup(slotProps.data)"
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
import { type SalesTaxGroup } from '~/interfaces/models/sales-tax-group';
import { useAppStore } from '~/stores/useAppStore';
import { useSalesTaxGroupStore } from '~/stores/useSalesTaxGroupStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const salesTaxGroupStore = useSalesTaxGroupStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  salesTaxGroupStore.clearFiltersAndParameters();
  await salesTaxGroupStore.fetchSalesTaxGroups();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await salesTaxGroupStore.updateSalesTaxGroup({ ...newData });
};

const removeSalesTaxGroup = async (event: SalesTaxGroup) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await salesTaxGroupStore.deleteSalesTaxGroup(event.id!);
    },
  });
};

const fetchPaginatedTaxGroups = async (event: any) => {
  salesTaxGroupStore.setPaginationDetails(undefined, event.page + 1);
  await salesTaxGroupStore.fetchSalesTaxGroups();
};
</script>
