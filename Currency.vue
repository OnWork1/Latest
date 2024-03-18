<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="currency">Currency</label>
          <Dropdown
            id="currency"
            v-model="currency"
            :options="currencies"
            placeholder="Select a Currency"
            :class="{ 'p-invalid': currencyError }"
            optionLabel="currencyCode"
            :filterFields="['currencyName', 'currencyCode']"
            filter
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center gap-2">
                <div>
                  {{ getFlagByCurrencyCode(slotProps.value.currencyCode) }}
                </div>
                <div>{{ slotProps.value.currencyCode }}</div>
                <div>{{ slotProps.value.currencyName }}</div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <div>
                  {{ getFlagByCurrencyCode(slotProps.option.currencyCode) }}
                </div>
                <div>{{ slotProps.option.currencyCode }}</div>
                <div>{{ slotProps.option.currencyName }}</div>
              </div>
            </template>
          </Dropdown>

          <small class="p-error" id="text-error">{{
            currencyError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="currencyRate">Currency Rate</label>
          <InputNumber
            id="currencyRate"
            mode="decimal"
            v-model="currencyRate"
            aria-describedby="currency-rate"
            :minFractionDigits="4"
            :class="{ 'p-invalid': currencyRateError }"
            required
          />
          <small class="p-error" id="text-error">{{
            currencyRateError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-currency"
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
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Currency } from '~/interfaces/models/currency';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';
import { currencies } from '~/utils/currency-list';
import { getFlagByCurrencyCode } from '~/utils/helpers';

const { handleSubmit, resetForm } = useForm();
const currencyStore = useCurrencyStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: currency, errorMessage: currencyError } = useField<Object>(
  'currency',
  (value) => validateInput(value, 'Currency')
);

const { value: currencyRate, errorMessage: currencyRateError } =
  useField<number>('currencyRate', (value) =>
    validateInput(value, 'Currency Rate')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const currency: Currency = {
      currencyCode: values.currency.currencyCode,
      currencyName: values.currency.currencyName,
      currencyRate: values.currencyRate,
    };

    await currencyStore.createNewCurrency(currency);

    if (currencyStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
