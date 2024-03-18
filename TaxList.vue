<template>
  <Message
    v-if="!taxStore.taxList?.length && !appStore.isLoading"
    id="message"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="taxStore.taxList?.length"
    v-model:editingRows="editingRows"
    :value="taxStore.taxList"
    class="mt-10 p-datatable-sm"
    id="taxTable"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="500px"
    :rows="taxStore.pagination.perPage"
    :totalRecords="taxStore.pagination.totalCount"
    @page="fetchPaginatedTaxes"
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
    <Column field="taxCode" header="Tax Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="taxRate" header="Tax Rate (%)">
      <template #editor="{ data, field }">
        <InputNumber
          v-model="data[field]"
          mode="decimal"
          :minFractionDigits="2"
        />
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
          @click="removeTax(slotProps.data)"
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
import { type Tax } from '~/interfaces/models/tax';
import { useAppStore } from '~/stores/useAppStore';
import { useTaxStore } from '~/stores/useTaxStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const taxStore = useTaxStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  taxStore.clearFiltersAndParameters();
  await taxStore.fetchTaxes();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await taxStore.updateTax({ ...newData });
};

const removeTax = async (event: Tax) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await taxStore.deleteTax(event.id!);
    },
  });
};

const fetchPaginatedTaxes = async (event: any) => {
  taxStore.setPaginationDetails(undefined, event.page + 1);
  await taxStore.fetchTaxes();
};
</script>
