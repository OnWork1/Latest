<template>
  <Message
    v-if="!accountBudgetStore.accountBudgetList?.length && !appStore.isLoading"
    :closable="false"
    >No results available.</Message
  >

  <DataTable
    v-else="accountBudgetStore.accountBudgetList?.length"
    v-model:expandedRows="expandedRows"
    :value="accountBudgetStore.accountBudgetList"
    class="mt-3 p-datatable-sm"
    dataKey="expenseId"
    :rowClass="rowClass"
    @row-click="onRowExpandAndCollapse"
    lazy
    scrollable
  >
    <Column field="attachmentCount">
      <template #body="slotProps">
        <div @click="onRowExpandAndCollapse(slotProps)">
          <span
            :class="slotProps.data.attachmentCount ? 'pi pi-paperclip' : ''"
          ></span>
        </div>
      </template>
    </Column>

    <Column field="expenseTitle" header="Expense Title"></Column>

    <Column
      class="text-center"
      field="expenseCode"
      header="Expense Code"
    ></Column>

    <Column class="text-center" field="taxCode" header="Tax Code"></Column>
    <Column
      class="text-center"
      field="departmentCode"
      header="Department Code"
    ></Column>
    <Column class="text-center" field="date" header="Date">
      <template #body="slotProps">
        {{ convertDateFormat(slotProps.data.date) }}
      </template>
    </Column>
    <Column
      class="text-center"
      field="paymentType"
      header="Payment Type"
    ></Column>

    <Column
      class="text-center"
      field="budgetCurrency"
      header="Budget Currency"
    ></Column>
    <Column class="text-center" field="budgetedAmount" header="Budgeted Amount">
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.budgetedAmount) }}
      </template>
    </Column>
    <Column
      class="text-center"
      field="accountCurrency"
      header="Actual Currency"
    ></Column>
    <Column class="text-center" field="actualAmount" header="Actual Amount">
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.actualAmount) }}
      </template>
    </Column>

    <Column class="text-center" field="expenseType" header="Type"></Column>
    <Column
      class="text-center"
      field="expenseStatus"
      header="Expense Status"
    ></Column>
    <Column
      field="budgetedBaseCurrencyAmount"
      header="Converted Budgeted Amount"
    >
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.budgetedBaseCurrencyAmount) }}
      </template>
    </Column>
    <Column field="actualBaseCurrencyAmount" header="Converted Actual Amount">
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.actualBaseCurrencyAmount) }}
      </template>
    </Column>
    <Column field="comment" header="Comments"></Column>
    <template #expansion>
      <section class="py-3 surface-100 border-round-lg">
        <div class="pl-5 text-base font-bold">Attachments</div>
        <div class="px-5 mt-3 flex gap-5">
          <p v-if="!files.length && appStore.isLoading">
            <i class="pi pi-info-circle"></i>
            Retrieving attachments. Please wait...
          </p>
          <template v-else>
            <div
              class="flex flex-column align-items-center justify-content-center gap-2"
              v-for="file in files"
              :index="file.id"
            >
              <i class="pi pi-file" style="font-size: 1.5rem !important"></i>
              <p class="my-0 cursor-pointer" @click="downloadFile(file.id!)">
                {{ truncateString(file.fileName, 15) }}
              </p>
            </div>
          </template>
        </div>
      </section>
    </template>
    <ColumnGroup type="footer">
      <Row>
        <Column footer="Totals:" :colspan="12" footerStyle="text-align:right" />
        <Column :footer="totalConvertedBudget" />
        <Column :footer="totalConvertedAmount" :colspan="4" />
      </Row>
    </ColumnGroup>
  </DataTable>
</template>

<script setup lang="ts">
import { type AccountBudget } from '~/interfaces/models/account-budget';
import { useAppStore } from '~/stores/useAppStore';
import { useAccountBudgetStore } from '~/stores/useAccountBudgetStore';
import { convertDateFormat, currencyFormatter } from '~/utils/helpers';
import { ExpenseType } from '~/enums/expense-type';
import { truncateString } from '~/utils/string-truncate';

const appStore = useAppStore();
const accountBudgetStore = useAccountBudgetStore();
const receiptsStore = useReceiptsStore();

const files = computed(() => {
  return receiptsStore.expenseReceiptList || [];
});

const expandedRows = ref<{ [key: number]: boolean }>({});

const rowClass = (data: AccountBudget) => {
  const isWithdrawal = data.expenseType === ExpenseType.WITHDRAWAL;
  const isActualGreaterThanBudget =
    +data.budgetedBaseCurrencyAmount < +data.actualBaseCurrencyAmount!;

  return [
    // LAA-150: withdrawals should not show in red.
    { 'bg-red-100': isActualGreaterThanBudget && !isWithdrawal },
    { 'cursor-pointer': data.attachmentCount },
    { 'select-none': data.expenseId },
  ];
};

const totalConvertedBudget = computed(() => {
  return currencyFormatter(
    accountBudgetStore.accountBudgetList?.reduce(
      (accBudget, accountBudget) =>
        +accBudget + +accountBudget.budgetedBaseCurrencyAmount,
      0
    ) || 0
  ).toString();
});

const totalConvertedAmount = computed(() => {
  return currencyFormatter(
    accountBudgetStore.accountBudgetList?.reduce(
      (accBudget, accountBudget) =>
        +accBudget + +accountBudget.actualBaseCurrencyAmount!,
      0
    ) || 0
  ).toString();
});

const onRowExpandAndCollapse = async (event: any) => {
  if (event.data.attachmentCount) {
    receiptsStore.clearReceiptList();

    if (expandedRows.value[event.data.expenseId]) {
      // if the expense row is already in expanded, collapse it.
      expandedRows.value = {};
    } else {
      expandedRows.value = { [event.data.expenseId]: true };
      await receiptsStore.fetchReceipts(
        `expenseId=${event.data.expenseId}`,
        true
      );
    }
  }
};

const downloadFile = (receiptId: number) => {
  receiptsStore.downloadReceipts(receiptId);
};
</script>
