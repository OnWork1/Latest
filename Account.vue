<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="tripCode">Trip Code</label>
          <InputText
            id="tripCode"
            v-model="tripCode"
            aria-describedby="brand-code"
            :class="{ 'p-invalid': tripCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            tripCodeError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="noOfLeaders">No. of Leaders</label>
            <InputNumber
              id="noOfLeaders"
              v-model="noOfLeaders"
              :class="{ 'p-invalid': noOfLeadersError }"
              required
            />
            <small class="p-error" id="text-error">{{
              noOfLeadersError || '&nbsp;'
            }}</small>
          </div>

          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="noOfPassengers">No. of Passengers</label>
            <InputNumber
              id="noOfPassengers"
              v-model="noOfPassengers"
              :class="{ 'p-invalid': noOfPassengersError }"
              required
            />
            <small class="p-error" id="text-error">{{
              noOfPassengersError || '&nbsp;'
            }}</small>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="productId">Product</label>
            <Dropdown
              id="productId"
              v-model="productId"
              :options="productsList"
              :class="{ 'p-invalid': productError }"
              optionLabel="productName"
              optionValue="id"
              class="w-full"
            />
            <small class="p-error" id="text-error">{{
              productError || '&nbsp;'
            }}</small>
          </div>
        </div>

        <div class="flex flex-column gap-2">
          <label for="departureDate">Departure Date</label>
          <Calendar
            id="departureDate"
            v-model="departureDate"
            :class="{ 'p-invalid': departureDateError }"
            iconDisplay="input"
            showIcon
            required
          />
          <small class="p-error" id="text-error">{{
            departureDateError || '&nbsp;'
          }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="leaderUserId">Leader</label>
          <Dropdown
            id="leaderUserId"
            v-model="leaderUserId"
            :options="userList"
            placeholder="Select a leader"
            optionLabel="userAccount"
            optionValue="id"
            class="w-full"
            filter
          />
          <small class="p-error" id="text-error">{{
            leaderError || '&nbsp;'
          }}</small>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-account"
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
import { useAccountStore } from '~/stores/useAccountStore';
import { useProductStore } from '~/stores/useProductStore';
import { useAppStore } from '~/stores/useAppStore';
import { useField, useForm } from 'vee-validate';
import { type Account } from '~/interfaces/models/account';
import { validateInput } from '~/utils/validate-input';
import { AccountStatus } from '~/enums/account-status';

const { handleSubmit, resetForm } = useForm();
const accountStore = useAccountStore();
const productStore = useProductStore();
const userStore = useUserStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

const userList = computed(() => {
  return userStore.userList || [];
});

const productsList = computed(() => {
  return productStore.productList || [];
});

const { value: tripCode, errorMessage: tripCodeError } = useField<string>(
  'tripCode',
  (value) => validateInput(value, 'Trip Code')
);

const { value: noOfLeaders, errorMessage: noOfLeadersError } = useField<number>(
  'noOfLeaders',
  (value) => validateInput(value, 'No. of Leaders')
);

const { value: noOfPassengers, errorMessage: noOfPassengersError } =
  useField<number>('noOfPassengers', (value) =>
    validateInput(value, 'No. of Passengers')
  );

const { value: productId, errorMessage: productError } = useField<number>(
  'productId',
  (value) => validateInput(value, 'Product')
);

const { value: departureDate, errorMessage: departureDateError } =
  useField<string>('departureDate', (value) =>
    validateInput(value, 'Departure Date')
  );

const { value: leaderUserId, errorMessage: leaderError } = useField<number>(
  'leaderUserId',
  (value) => validateInput(value, 'Leader')
);

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const account: Account = {
      tripCode: values.tripCode,
      noOfLeaders: values.noOfLeaders,
      noOfPassengers: values.noOfPassengers,
      productId: values.productId,
      departureDate: new Date(values.departureDate).toISOString(),
      leaderUserId: values.leaderUserId,
      accountStatus: AccountStatus.DRAFT,
    };

    await accountStore.createNewAccount(account);

    if (accountStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
