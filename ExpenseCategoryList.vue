<template>
  <Message
    v-if="
      !expenseCategoriesStore.expenseCategories?.length && !appStore.isLoading
    "
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="expenseCategoriesStore.expenseCategories?.length"
    v-model:editingRows="editingRows"
    :value="expenseCategoriesStore.expenseCategories"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="expenseCategoriesStore.pagination.perPage"
    :totalRecords="expenseCategoriesStore.pagination.totalCount"
    @page="fetchPaginatedExpenseCategories"
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
    <Column field="expenseName" header="Expense Name">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="expenseCode" header="Expense Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="defaultPaymentType" header="Default Payment Type">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          :options="paymentTypes"
          placeholder="Select a payment type"
          optionLabel="value"
          optionValue="value"
          class="w-full md:w-14rem"
          filter
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
          @click="removeExpenseCategory(slotProps.data)"
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
import { type ExpenseCategory } from '~/interfaces/models/expense-category';
import { useAppStore } from '~/stores/useAppStore';
import { useExpenseCategoryStore } from '@/stores/useExpenseCategoryStore';
import { useConfirm } from 'primevue/useconfirm';
import { paymentTypes } from '~/utils/constants';

const appStore = useAppStore();
const expenseCategoriesStore = useExpenseCategoryStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  expenseCategoriesStore.clearFiltersAndParameters();
  await expenseCategoriesStore.fetchExpenseCategories();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await expenseCategoriesStore.updateExpenseCategory({ ...newData });
};

const removeExpenseCategory = async (event: ExpenseCategory) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await expenseCategoriesStore.deleteExpenseCategory(event.id!);
    },
  });
};

const fetchPaginatedExpenseCategories = async (event: any) => {
  expenseCategoriesStore.setPaginationDetails(undefined, event.page + 1);
  await expenseCategoriesStore.fetchExpenseCategories();
};
</script>
