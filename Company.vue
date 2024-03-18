<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="companyCode">Company Code</label>
          <InputText
            id="companyCode"
            v-model="companyCode"
            aria-describedby="company-code"
            :class="{ 'p-invalid': companyCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            companyCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="companyName">Company Name</label>
          <InputText
            id="companyName"
            v-model="companyName"
            aria-describedby="company-name"
            :class="{ 'p-invalid': companyNameError }"
            required
          />
          <small class="p-error" id="text-error">{{
            companyNameError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="baseCurrencyId">Base Currency</label>
            <Dropdown
              id="baseCurrencyId"
              v-model="baseCurrencyId"
              placeholder="Select a base currency"
              :options="currencyList"
              filter
              optionLabel="currencyName"
              optionValue="id"
              class="w-full"
            />
            <small class="p-error" id="text-error">{{
              baseCurrencyError || '&nbsp;'
            }}</small>
          </div>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-company"
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
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Company } from '~/interfaces/models/company';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const companyStore = useCompanyStore();
const currencyStore = useCurrencyStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const currencyList = computed(() => {
  return currencyStore.currencyList || [];
});

const { value: companyCode, errorMessage: companyCodeError } = useField<string>(
  'companyCode',
  (value) => validateInput(value, 'Company Code')
);

const { value: companyName, errorMessage: companyNameError } = useField<string>(
  'companyName',
  (value) => validateInput(value, 'Company Name')
);

const { value: baseCurrencyId, errorMessage: baseCurrencyError } =
  useField<number>('baseCurrencyId', (value) =>
    validateInput(value, 'Base Currency')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    await companyStore.createNewCompany({ ...(values as Company) });

    if (companyStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
