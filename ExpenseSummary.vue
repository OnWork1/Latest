<template>
  <div class="p-3 bg-white shadow-2 border-round-md">
    <div class="flex justify-content-between">
      <div class="flex align-items-center gap-1">
        <h2 id="expense-title" class="m-0 font-bold text-lg text-500">
          {{ expense?.expenseTitle }}
          <span
            class="text-primary cursor-pointer"
            @click="editExpense(expense.id!)"
            v-if="editEnabled"
            ><i class="pi pi-pencil"
          /></span>
        </h2>
        <div></div>
      </div>

      <div id="expense-date" class="text-xs">
        {{ convertDateFormat(expense?.expenseDate) }}
      </div>
    </div>

    <div class="flex justify-content-between align-items-center">
      <div class="mt-3 font-bold text-xl text-700">
        <span class="mr-1 text-xs">{{ expense?.currencyCode! }}</span>
        <span id="expense-amount">{{ currencyFormatter(expense.amount) }}</span>
        <Tag class="mt-1 block surface-200 text-900">
          <span class="text-xs font-light">
            Budgeted Amount: {{ currencyFormatter(expense?.budgetedAmount!) }}
          </span>
        </Tag>
      </div>

      <Tag class="surface-900 text-100">
        <span id="expense-status" class="px-1 text-xs font-bold">{{
          expense.status
        }}</span>
      </Tag>
    </div>

    <div class="mt-3 flex justify-content-between text-500">
      <div>
        <span
          id="attachment-count"
          class="cursor-pointer"
          :class="{ 'is-disabled': !offlineStore.isOnline }"
          @click="offlineStore.isOnline ? viewReceipts(expense?.id!) : null"
        >
          Attachments - {{ expense?.receiptCount! }}
          <i class="pi pi-external-link"></i>
        </span>
      </div>
      <div>
        <span
          class="text-red-500 cursor-pointer"
          v-if="showDeleteButton(expense?.expenseTransactionType)"
          @click="removeExpense(expense.id!)"
        >
          <i class="pi pi-trash" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { currencyFormatter } from '~/utils/helpers';
import { ExpenseTransactionType } from '~/enums/expense-transaction-type';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  editEnabled: {
    type: Boolean,
    required: true,
  },
  expense: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['deleteExpense']);
const route = useRoute();
const router = useRouter();
const offlineStore = useOfflineStore();

const accountId = ref(0);

onMounted(async () => {
  accountId.value = +(route?.query?.accountId ?? 0);
});

const removeExpense = async (id: number) => {
  emit('deleteExpense', id);
};

const editExpense = (expenseId: number) => {
  router.push({
    path: '/leader/expenses/details',
    query: { accountId: accountId.value, expenseId: expenseId },
  });
};

const showDeleteButton = (expenseTransactionType: string | undefined) => {
  return (
    expenseTransactionType !== ExpenseTransactionType.AUTO && props.editEnabled
  );
};

const viewReceipts = (expenseId: number) => {
  router.push({
    path: '/leader/expenses/receipts',
    query: { accountId: accountId.value, expenseId: expenseId },
  });
};
</script>

<style lang="scss" scoped>
.is-disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
