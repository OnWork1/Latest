<template>
  <div class="p-4 shadow-2 border-round-md">
    <div class="flex justify-content-between align-items-center">
      <div class="flex w-full align-items-center gap-1 justify-content-between">
        <h1 class="m-0 text-xl font-bold">
          {{ account?.tripCode }}
        </h1>
        <div class="flex gap-3">
          <NuxtLink :to="editAccount(account.id)">
            <span class="text-secondary cursor-pointer" v-if="hideEditButton"
              ><i class="pi pi-pencil text-base" />
            </span>
          </NuxtLink>
          <span
            v-if="displayDeleteButton"
            id="delete-account-button"
            class="text-red-500 cursor-pointer"
            @click="removeAccount(account.id)"
          >
            <i class="pi pi-trash text-base" />
          </span>
        </div>
      </div>
    </div>
    <div class="flex align-items-center gap-1 justify-content-between mt-3">
      <div class="flex flex-column">
        <div class="flex align-items-center gap-1">
          <span class="text-500"
            >Expenses(<span class="text-xs">
              {{ account.baseCurrencyCode }}</span
            >)</span
          >
          <NuxtLink :to="viewExpenses(account.id)">
            <div class="text-primary cursor-pointer">
              <i class="pi pi-external-link text-base" />
            </div>
            <!-- <Button icon="pi pi-plus" text raised rounded /> -->
          </NuxtLink>
        </div>

        <span class="mt-1 font-medium">
          {{ currencyFormatter(account?.totalExpenses) }}</span
        >
      </div>
      <div class="flex flex-column">
        <span class="text-500"
          >Budget(<span class="text-xs"> {{ account.baseCurrencyCode }}</span
          >)</span
        >
        <span class="mt-1 font-medium">
          {{ currencyFormatter(account?.totalBudget) }}</span
        >
      </div>
    </div>

    <div
      class="flex align-items-center gap-1 justify-content-between lg:justify-content-evenly mt-3"
    >
      <div class="flex flex-column">
        <span class="text-500">Departure Date</span>
        <span class="mt-1 font-medium">{{
          convertDateFormat(account?.departureDate)
        }}</span>
      </div>
      <div class="flex flex-column">
        <span class="text-500">Leaders</span>
        <span class="mt-1 font-medium">{{ account?.noOfLeaders }}</span>
      </div>
      <div class="flex flex-column">
        <span class="text-500">Passengers</span>
        <span class="mt-1 font-medium">{{ account?.noOfPassengers }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { currencyFormatter } from '~/utils/helpers';
import { AccountStatus } from '~/enums/account-status';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { useRouter } from 'vue-router';

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['deleteAccount']);
const router = useRouter();
const offlineStore = useOfflineStore();

const hideEditButton = computed(() => {
  return (
    props.account?.accountStatus !== AccountStatus.APPROVED &&
    offlineStore.isOnline
  );
});

const displayDeleteButton = computed(() => {
  return (
    props.account?.accountStatus == AccountStatus.DRAFT && offlineStore.isOnline
  );
});

const removeAccount = async (id: number) => {
  emit('deleteAccount', id);
};

const editAccount = (accountId: number) => {
  // router.push({
  //   path: '/leader/accounts/details',
  //   query: { accountId: accountId },
  // });

  return '/leader/accounts/details?accountId=' + accountId;
};

const viewExpenses = (accountId: number) => {
  // router.push({
  //   path: '/leader/expenses',
  //   query: { accountId: accountId },
  // });
  return '/leader/expenses?accountId=' + accountId;
};
</script>
