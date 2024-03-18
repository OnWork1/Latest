<template>
  <Message
    v-if="!productBudgetStore.productBudgetsList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.
  </Message>

  <DataTable
    v-else="productBudgetStore.productBudgetsList?.length"
    v-model:editingRows="editingRows"
    :value="productBudgetStore.productBudgetsList"
    class="mt-10 p-datatable-sm"
    @row-edit-save="onRowEditSave"
    editMode="row"
    dataKey="id"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="productBudgetStore.pagination.perPage"
    :totalRecords="productBudgetStore.pagination.totalCount"
    @page="fetchPaginatedBudget"
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
    <Column field="expenseTitle" header="Expense Title">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="expenseCategoryId" header="Expense Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a Expense Category"
          :options="expenseCategoryList"
          optionLabel="expenseCode"
          optionValue="expenseCategoryId"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ getExpenseCode(slotProps.data.expenseCategoryId) }}
      </template>
    </Column>
    <Column field="dayNumber" header="Day Number">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="currencyId" header="Currency Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a currency"
          :options="currencyList"
          optionLabel="currencyCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.currencyCode }}
      </template>
    </Column>
    <Column field="paymentType" header="Payment Type">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a payment type"
          :options="paymentTypes"
          optionLabel="paymentType"
          optionValue="value"
          class="w-full md:w-14rem"
        />
      </template>
    </Column>
    <Column field="taxId" header="Tax Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          :options="taxList"
          placeholder="Select a Tax"
          optionLabel="taxCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.taxCode }}
      </template>
    </Column>
    <Column field="salesTaxGroupId" header="Sales Tax Group Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          :options="salesTaxGroupCodes"
          placeholder="Select a Sales Tax Group"
          optionLabel="salesTaxGroupCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.salesTaxGroupCode }}
      </template>
    </Column>
    <Column field="departmentId" header="Department Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a department"
          :options="departmentList"
          optionLabel="departmentCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.departmentCode }}
      </template>
    </Column>
    <Column
      :rowEditor="true"
      style="max-width: 3rem"
      bodyStyle="text-align:center"
    >
    </Column>
    <Column bodyStyle="text-align:center">
      <template #body="slotProps">
        <div class="flex gap-3">
          <div
            class="text-gray-500 cursor-pointer"
            @click="openCostModal(slotProps.data.id)"
          >
            <i class="pi pi-external-link" />
          </div>
          <div
            class="text-red-500 cursor-pointer"
            @click="removeBudget(slotProps.data)"
          >
            <i class="pi pi-trash" />
          </div>
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast position="bottom-right" />
  <ConfirmDialog />

  <ModalCost
    :visible="visible"
    :budgetId="budgetId"
    @close-modal="visible = !visible"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type Budget } from '~/interfaces/models/budget';
import { useTaxStore } from '~/stores/useTaxStore';
import { useProductBudgetStore } from '~/stores/useProductBudgetStore';
import { useBudgetStore } from '~/stores/useBudgetStore';
import { useBudgetCostStore } from '~/stores/useBudgetCostStore';
import { useProductStore } from '~/stores/useProductStore';
import { useDepartmentStore } from '~/stores/useDepartmentStore';
import { useExpenseCategoryStore } from '~/stores/useExpenseCategoryStore';
import { useCurrencyStore } from '~/stores/useCurrencyStore';
import { useSalesTaxGroupStore } from '~/stores/useSalesTaxGroupStore';
import { useAppStore } from '~/stores/useAppStore';
import { paymentTypes } from '~/utils/constants';
import { useConfirm } from 'primevue/useconfirm';
import { type ExpenseCategory } from '~/interfaces/models/expense-category';

const appStore = useAppStore();
const productBudgetStore = useProductBudgetStore();
const budgetCostStore = useBudgetCostStore();
const budgetStore = useBudgetStore();
const taxStore = useTaxStore();
const productStore = useProductStore();
const departmentStore = useDepartmentStore();
const expenseCategoryStore = useExpenseCategoryStore();
const currencyStore = useCurrencyStore();
const salesTaxGroupCodeStore = useSalesTaxGroupStore();
const editingRows = ref([]);
const visible = ref(false);
const budgetId = ref<number>(0);
const confirm = useConfirm();

const taxList = computed(() => {
  return taxStore.taxList || [];
});

const departmentList = computed(() => {
  return departmentStore.departmentList || [];
});

const currencyList = computed(() => {
  return currencyStore.currencyList || [];
});

const salesTaxGroupCodes = computed(() => {
  return salesTaxGroupCodeStore.salesTaxGroupList || [];
});

const expenseCategoryList = computed(() => {
  return (
    expenseCategoryStore.expenseCategories?.map((expenseCategory) => {
      return { ...expenseCategory, expenseCategoryId: expenseCategory.id };
    }) || []
  );
});

onMounted(async () => {
  await currencyStore.fetchCurrencies(true);
  await departmentStore.fetchDepartments(true);
  await productStore.fetchProducts(true);
  await taxStore.fetchTaxes(true);
  await expenseCategoryStore.fetchExpenseCategories(true);
  await salesTaxGroupCodeStore.fetchSalesTaxGroups(true);
});

const getExpenseCode = (expenseCategoryId: number): string => {
  return (
    expenseCategoryList.value.find(
      (expenseCategory: ExpenseCategory) =>
        expenseCategory.id === expenseCategoryId
    )?.expenseCode || ''
  );
};

const onRowEditSave = async (event: any) => {
  const { newData } = event;

  const budget: Budget = {
    id: newData.id,
    dayNumber: newData.dayNumber,
    expenseTitle: newData.expenseTitle,
    expenseCategoryId: newData.expenseCategoryId,
    currencyId: newData.currencyId,
    paymentType: newData.paymentType,
    taxId: newData.taxId,
    departmentId: newData.departmentId,
    productId: newData.productId,
    salesTaxGroupId: newData.salesTaxGroupId,
  };

  await budgetStore.updateBudget(budget);
  await productBudgetStore.fetchProductBudgets(productStore.product?.id!);
};

const removeBudget = async (event: Budget) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await budgetStore.deleteBudget(event.id!);
      await productBudgetStore.fetchProductBudgets(productStore.product?.id!);
    },
  });
};

const fetchPaginatedBudget = async (event: any) => {
  productBudgetStore.setPaginationDetails(undefined, event.page + 1);
  await productBudgetStore.fetchProductBudgets(productStore.product?.id!);
};

const openCostModal = async (id: number) => {
  budgetId.value = id;
  visible.value = true;
  await budgetCostStore.fetchCostByBudgetId(budgetId.value);
};
</script>
