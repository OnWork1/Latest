<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="brandName">Brand Name</label>
          <InputText
            id="brandName"
            v-model="brandName"
            aria-describedby="brand-name"
            :class="{ 'p-invalid': brandNameError }"
            required
          />
          <small class="p-error" id="text-error">{{
            brandNameError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-brand"
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
import { useBrandStore } from '@/stores/useBrandStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type Brand } from '~/interfaces/models/brand';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const brandStore = useBrandStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: brandName, errorMessage: brandNameError } = useField<string>(
  'brandName',
  (value) => validateInput(value, 'Brand Name')
);

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const brand: Brand = {
      brandName: values.brandName,
    };
    await brandStore.createNewBrand(brand);

    if (brandStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
