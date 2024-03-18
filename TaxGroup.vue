<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="taxGroupCode">Sales Tax Group Code</label>
          <InputText
            id="taxGroupCode"
            v-model="taxGroupCode"
            aria-describedby="tax-group-code"
            :class="{ 'p-invalid': taxGroupCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            taxGroupCodeError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-tax-group"
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
import { useSalesTaxGroupStore } from '~/stores/useSalesTaxGroupStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type SalesTaxGroup } from '~/interfaces/models/sales-tax-group';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const salesTaxGroupStore = useSalesTaxGroupStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: taxGroupCode, errorMessage: taxGroupCodeError } =
  useField<string>('taxGroupCode', (value) =>
    validateInput(value, 'Sales Tax Group Code')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const taxGroup: SalesTaxGroup = {
      salesTaxGroupCode: values.taxGroupCode,
    };
    await salesTaxGroupStore.createNewSalesTaxGroup(taxGroup);

    if (salesTaxGroupStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
