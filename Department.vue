<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="departmentCode">Department Code</label>
          <InputText
            id="departmentCode"
            v-model="departmentCode"
            aria-describedby="department-code"
            :class="{ 'p-invalid': departmentCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            departmentCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="departmentName">Department Name</label>
          <InputText
            id="departmentName"
            v-model="departmentName"
            aria-describedby="department-name"
            :class="{ 'p-invalid': departmentNameError }"
            required
          />
          <small class="p-error" id="text-error">{{
            departmentNameError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-department"
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
import { useDepartmentStore } from '@/stores/useDepartmentStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type Department } from '~/interfaces/models/department';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const departmentStore = useDepartmentStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const { value: departmentCode, errorMessage: departmentCodeError } =
  useField<string>('departmentCode', (value) =>
    validateInput(value, 'Department Code')
  );

const { value: departmentName, errorMessage: departmentNameError } =
  useField<string>('departmentName', (value) =>
    validateInput(value, 'Department Name')
  );

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    await departmentStore.createNewDepartment({
      ...values,
    } as Department);

    if (departmentStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
