<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="expenseName">Expense Name</label>
          <InputText
            id="expenseName"
            v-model="expenseName"
            aria-describedby="expense-name"
            :class="{ 'p-invalid': expenseNameError }"
            required
          />
          <small class="p-error" id="text-error">{{
            expenseNameError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="expenseCode">Expense Code</label>
          <InputText
            id="expenseCode"
            v-model="expenseCode"
            aria-describedby="expense-code"
            :class="{ 'p-invalid': expenseCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            expenseCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="defaultPaymentType">Default Payment Type</label>
          <Dropdown
            id="defaultPaymentType"
            v-model="defaultPaymentType"
            :options="paymentTypes"
            :class="{ 'p-invalid': defaultPaymentTypeError }"
            optionLabel="paymentType"
          />
          <small class="p-error" id="text-error">{{
            defaultPaymentTypeError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-expense-category"
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
import { useExpenseCategoryStore } from '@/stores/useExpenseCategoryStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type ExpenseCategory } from '~/interfaces/models/expense-category';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const expenseCategoriesStore = useExpenseCategoryStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: expenseName, errorMessage: expenseNameError } = useField<string>(
  'expenseName',
  (value) => validateInput(value, 'Expense Name')
);

const { value: expenseCode, errorMessage: expenseCodeError } = useField<string>(
  'expenseCode',
  (value) => validateInput(value, 'Expense Code')
);

const { value: defaultPaymentType, errorMessage: defaultPaymentTypeError } =
  useField<string>('defaultPaymentType', (value) =>
    validateInput(value, 'Default Payment Type')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const expenseCategory: ExpenseCategory = {
      expenseName: values.expenseName,
      expenseCode: values.expenseCode,
      defaultPaymentType: values.defaultPaymentType.value,
      disablePaymentType: false,
    };

    await expenseCategoriesStore.createNewExpenseCategory(expenseCategory);

    if (expenseCategoriesStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
