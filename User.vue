<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="userAccount">User Email</label>
          <InputText
            id="userAccount"
            v-model="userAccount"
            aria-describedby="user-name"
            :class="{ 'p-invalid': userAccountError }"
            required
          />
          <small class="p-error" id="text-error">{{
            userAccountError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="cardCode">Card Code</label>
            <InputText
              id="cardCode"
              v-model="cardCode"
              aria-describedby="card-code"
            />
          </div>
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="cashCode">Cash Code</label>
            <InputText
              id="cashCode"
              v-model="cashCode"
              aria-describedby="cash-code"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-column gap-2">
          <label for="company">Company</label>
          <Dropdown
            id="company"
            v-model="companyId"
            placeholder="Select a company"
            :options="companyList"
            filter
            optionLabel="companyName"
            optionValue="id"
            class="w-full"
          />
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="create-user"
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
import { useUserStore } from '@/stores/useUserStore';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type User } from '~/interfaces/models/user';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();
const userStore = useUserStore();
const companyStore = useCompanyStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const companyList = computed(() => {
  return companyStore.companyList || [];
});

const { value: userAccount, errorMessage: userAccountError } = useField<string>(
  'userAccount',
  (value) => validateInput(value, 'User Email')
);
const { value: cardCode } = useField<string>('cardCode');
const { value: cashCode } = useField<string>('cashCode');
const { value: companyId } = useField<number>('companyId');

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    await userStore.createNewUser({
      ...values,
    } as User);

    if (userStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
