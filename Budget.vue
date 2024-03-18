<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="expenseTitle">Expense Title</label>
          <InputText
            id="expenseTitle"
            v-model="expenseTitle"
            aria-describedby="expense-title"
            :class="{ 'p-invalid': expenseTitleError }"
            required
          />
          <small class="p-error" id="text-error">{{
            expenseTitleError || '&nbsp;'
          }}</small>
        </div>
        <div class="flex flex-column gap-2">
          <label for="expenseCategoryId">Expense Code</label>
          <Dropdown
            id="expenseCategoryId"
            v-model="expenseCategoryId"
            :options="expenseCategoryList"
            placeholder="Select an expense code"
            optionLabel="expenseCode"
            optionValue="id"
            class="w-full"
            :class="{ 'p-invalid': expenseCodeError }"
            filter
          />
          <small class="p-error" id="text-error">{{
            expenseCodeError || '&nbsp;'
          }}</small>
        </div>
        <div class="flex flex-column gap-2">
          <label for="dayNumber">Day Number</label>
          <InputNumber
            id="dayNumber"
            v-model="dayNumber"
            aria-describedby="dayNumber"
          />
        </div>
        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="taxId">Tax</label>
            <Dropdown
              id="taxId"
              v-model="taxId"
              :options="taxList"
              placeholder="Select a tax"
              optionLabel="taxCode"
              optionValue="id"
              class="w-full"
              filter
            />
          </div>
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="taxGroupId">Sales Tax Group</label>
            <Dropdown
              id="taxGroupId"
              v-model="taxGroupId"
              :options="salesTaxGroupCodes"
              placeholder="Select a sales tax group"
              optionLabel="salesTaxGroupCode"
              optionValue="id"
              class="w-full"
              filter
            />
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="paymentType">Payment Type</label>
            <Dropdown
              id="paymentType"
              v-model="paymentType"
              placeholder="Select a payment type"
              :options="paymentTypes"
              optionLabel="paymentType"
              class="w-full"
            />
          </div>
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="departmentId">Department</label>
            <Dropdown
              id="departmentId"
              v-model="departmentId"
              placeholder="Select a department"
              :options="departmentList"
              filter
              optionLabel="departmentName"
              optionValue="id"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="currencyId">Currency</label>
            <Dropdown
              id="currencyId"
              v-model="currencyId"
              placeholder="Select a currency"
              :options="currencyList"
              filter
              optionLabel="currencyName"
              optionValue="id"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-budget"
        class="w-7rem"
        label="Save"
        @click="onSubmit"
        :loading="appStore.isLoading"
      ></Button>
      <Button
        id="close-modal"
        class="w-7rem"
        label="Close"
        @click="closeModal"
        outlined
      ></Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/useProductStore';
import { useBudgetStore } from '~/stores/useBudgetStore';
import { useTaxStore } from '~/stores/useTaxStore';
import { useDepartmentStore } from '~/stores/useDepartmentStore';
import { useCurrencyStore } from '~/stores/useCurrencyStore';
import { useExpenseCategoryStore } from '~/stores/useExpenseCategoryStore';
import { useProductBudgetStore } from '~/stores/useProductBudgetStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Budget } from '~/interfaces/models/budget';
import { paymentTypes } from '~/utils/constants';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const productStore = useProductStore();
const taxStore = useTaxStore();
const departmentStore = useDepartmentStore();
const budgetStore = useBudgetStore();
const currencyStore = useCurrencyStore();
const expenseCategoryStore = useExpenseCategoryStore();
const productBudgetStore = useProductBudgetStore();
const salesTaxGroupCodeStore = useSalesTaxGroupStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const taxList = computed(() => {
  return taxStore.taxList || [];
});

const departmentList = computed(() => {
  return departmentStore.departmentList || [];
});

const currencyList = computed(() => {
  return currencyStore.currencyList || [];
});

const expenseCategoryList = computed(() => {
  return expenseCategoryStore.expenseCategories || [];
});

const product = computed(() => {
  return productStore.product;
});

const salesTaxGroupCodes = computed(() => {
  return salesTaxGroupCodeStore.salesTaxGroupList || [];
});

const { value: expenseTitle, errorMessage: expenseTitleError } =
  useField<string>('expenseTitle', (value) =>
    validateInput(value, 'Expense Title')
  );

const { value: expenseCategoryId, errorMessage: expenseCodeError } =
  useField<number>('expenseCategoryId', (value) =>
    validateInput(value, 'Expense Code')
  );

const { value: dayNumber } = useField<number>('dayNumber');

const { value: taxId } = useField<number>('taxId');

const { value: taxGroupId } = useField<number>('taxGroupId');

const { value: paymentType } = useField<string>('paymentType');

const { value: currencyId } = useField<number>('currencyId');

const { value: departmentId } = useField<number>('departmentId');

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const budget: Budget = {
      dayNumber: values.dayNumber,
      expenseTitle: values.expenseTitle,
      expenseCategoryId: values.expenseCategoryId,
      currencyId: values.currencyId,
      paymentType: values.paymentType?.value ?? null,
      taxId: values.taxId,
      departmentId: values.departmentId,
      productId: product.value?.id!,
      salesTaxGroupId: values.taxGroupId,
    };

    await budgetStore.createNewBudget(budget);
    await productBudgetStore.fetchProductBudgets(productStore.product?.id!);

    if (budgetStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
