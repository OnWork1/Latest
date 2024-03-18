<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="taxCode">Sales Tax Code</label>
          <InputText
            id="taxCode"
            v-model="taxCode"
            aria-describedby="currency-code"
            :class="{ 'p-invalid': taxCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            taxCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="taxRate">Tax Rate</label>
          <InputNumber
            id="taxRate"
            mode="decimal"
            v-model="taxRate"
            aria-describedby="tax-rate"
            :minFractionDigits="2"
            :min="0"
            :class="{ 'p-invalid': taxRateError }"
            required
          />
          <small class="p-error" id="text-error">{{
            taxRateError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-tax"
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
import { useTaxStore } from '@/stores/useTaxStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Tax } from '~/interfaces/models/tax';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const taxStore = useTaxStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: taxCode, errorMessage: taxCodeError } = useField<string>(
  'taxCode',
  (value) => validateInput(value, 'Tax Code')
);

const { value: taxRate, errorMessage: taxRateError } = useField<number>(
  'taxRate',
  (value) => (value >= 0 ? true : 'Tax Rate is required')
);

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    await taxStore.createNewTax({
      ...values,
    } as Tax);

    if (taxStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
