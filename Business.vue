<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="businessCode">Business Code</label>
          <InputText
            id="businessCode"
            v-model="businessCode"
            aria-describedby="business-code"
            :class="{ 'p-invalid': businessCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            businessCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="businessName">Business Name</label>
          <InputText
            id="businessName"
            v-model="businessName"
            aria-describedby="business-name"
          />
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-business"
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
import { useBusinessStore } from '@/stores/useBusinessStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';
import { type Business } from '~/interfaces/models/business';

const { handleSubmit, resetForm } = useForm();
const businessStore = useBusinessStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: businessCode, errorMessage: businessCodeError } =
  useField<string>('businessCode', (value) =>
    validateInput(value, 'Business Code')
  );

const { value: businessName } = useField<string>('businessName');

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const business: Business = {
      businessCode: values.businessCode,
      businessName: values.businessName,
    };

    await businessStore.createNewBusiness(business);

    if (businessStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
