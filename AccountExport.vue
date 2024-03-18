<template>
  <div class="card flex justify-content-center">
    <Dialog
      :visible="visible"
      :closable="false"
      :draggable="false"
      modal
      header="Account Export"
      :style="{ width: '30rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <form class="mx-auto" @keypress.enter="onSubmit">
        <div class="flex flex-column gap-3">
          <div class="flex flex-column gap-2">
            <label for="transactionDate">Transaction Date</label>
            <Calendar
              id="transactionDate"
              v-model="transactionDate"
              :class="{ 'p-invalid': transactionDateError }"
              iconDisplay="input"
              showIcon
              required
            />
            <small class="p-error" id="text-error">{{
              transactionDateError || '&nbsp;'
            }}</small>
          </div>

          <div class="flex flex-column gap-2">
            <label for="documentDate">Document Date</label>
            <Calendar
              id="documentDate"
              v-model="documentDate"
              :class="{ 'p-invalid': documentDateError }"
              iconDisplay="input"
              showIcon
              required
            />
            <small class="p-error" id="text-error">{{
              documentDateError || '&nbsp;'
            }}</small>
          </div>
        </div>
      </form>

      <div class="mt-5 flex gap-2 justify-content-end">
        <Button
          id="download"
          class="w-10rem"
          label="Download"
          @click="onSubmit"
          :loading="accountExportStore.isLoading"
        ></Button>
        <Button
          :disabled="accountExportStore.isLoading"
          class="w-7rem"
          label="Close"
          @click="closeModal"
          outlined
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';
import { useAccountExportStore } from '~/stores/useAccountExportStore';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  accountId: {
    type: Number,
  },
});

const emits = defineEmits(['closeModal']);
const accountExportStore = useAccountExportStore();
const { handleSubmit, resetForm } = useForm();

const { value: transactionDate, errorMessage: transactionDateError } =
  useField<string>('transactionDate', (value) =>
    validateInput(value, 'Transaction Date')
  );

const { value: documentDate, errorMessage: documentDateError } =
  useField<string>('documentDate', (value) =>
    validateInput(value, 'Document Date')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    await accountExportStore.downloadD365File(
      props.accountId!,
      transactionDate.value,
      documentDate.value
    );

    accountExportStore.setLoading(false);
    closeModal();
  }
});

const closeModal = () => {
  resetForm();
  emits('closeModal');
};
</script>
