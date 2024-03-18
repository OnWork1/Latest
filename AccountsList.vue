<template>
  <Message
    v-if="!accountStore.accountsList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="accountStore.accountList?.length"
    v-model:editingRows="editingRows"
    :value="accountStore.accountsList"
    class="mt-10 p-datatable-sm"
    :rowClass="rowClass"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="accountStore.pagination.perPage"
    :totalRecords="accountStore.pagination.totalCount"
    @page="fetchPaginatedAccounts"
  >
    <Column field="tripCode" header="Trip Code" class="text-center">
      <template #editor="{ data, field }">
        <InputText
          v-model="data[field]"
          :readonly="!isRowEditable"
          :disabled="data['accountStatus'] !== AccountStatus.DRAFT"
        />
      </template>
    </Column>
    <Column field="noOfPassengers" header="No of Pax"> </Column>
    <Column field="accountStatus" header="Account Status" class="text-center">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          :options="getAccountStatuses(userStore.loggedInUser?.roles!)"
          optionLabel="value"
          optionValue="value"
          placeholder="Select a Status"
          :disabled="isDisabled(data['accountStatus'])"
        >
        </Dropdown>
      </template>
      <template #body="slotProps">
        {{ slotProps.data.accountStatus }}
      </template>
    </Column>
    <Column field="finishDate" header="Finish Date">
      <template #body="slotProps">
        {{ convertDateFormat(slotProps.data.finishDate) }}
      </template>
    </Column>
    <Column field="leaderUserId" class="text-left" header="Leader">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          :options="userList"
          placeholder="Select a leader"
          optionLabel="userAccount"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
          :disabled="
            !isRowEditable || data['accountStatus'] !== AccountStatus.DRAFT
          "
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.leader }}
      </template>
    </Column>
    <Column field="baseCurrencyCode" class="text-center" header="Currency">
      <template #body="slotProps">
        {{ slotProps.data.baseCurrencyCode }}
      </template>
    </Column>
    <Column
      field="totalBudget"
      class="text-left"
      header="Converted Budgeted Amount"
    >
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.totalBudget) }}
      </template>
    </Column>
    <Column
      field="totalExpenses"
      class="text-left"
      header="Converted Actual Amount"
    >
      <template #body="slotProps">
        {{ currencyFormatter(slotProps.data.totalExpenses) }}
      </template>
    </Column>
    <Column bodyStyle="text-align:center">
      <template #body="slotProps">
        <div class="flex gap-3">
          <div
            class="text-bluegray-500 cursor-pointer"
            @click="openExportAccModal(slotProps.data)"
          >
            <i class="pi pi-download" />
          </div>
        </div>
      </template>
    </Column>
    <Column :rowEditor="true"> </Column>
    <Column bodyStyle="text-align:center">
      <template #body="slotProps">
        <div class="flex gap-3">
          <div
            class="text-bluegray-500 cursor-pointer"
            @click="viewDetails(slotProps.data)"
          >
            <i class="pi pi-external-link" />
          </div>
          <div
            v-if="isVisible(slotProps.data.accountStatus)"
            class="text-red-500 cursor-pointer"
            @click="removeAccount(slotProps.data)"
          >
            <i class="pi pi-trash" />
          </div>
        </div>
      </template>
    </Column>
    <ColumnGroup type="footer">
      <Row>
        <Column footer="Totals:" :colspan="6" footerStyle="text-align:right" />
        <Column :footer="totalBudget" />
        <Column :footer="totalExpense" :colspan="4" />
      </Row>
    </ColumnGroup>
  </DataTable>

  <ModalAccountExport
    :visible="isAccExpModal"
    @close-modal="isAccExpModal = !isAccExpModal"
    :accountId="selectedAccount?.id"
  />
  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type Account } from '~/interfaces/models/account';
import { useAccountBudgetStore } from '~/stores/useAccountBudgetStore';
import { useAccountStore } from '~/stores/useAccountStore';
import { useProductStore } from '~/stores/useProductStore';
import { useAppStore } from '~/stores/useAppStore';
import { useUserStore } from '~/stores/useUserStore';
import {
  convertDateFormat,
  getAccountStatuses,
  currencyFormatter,
} from '~/utils/helpers';
import { useDialog } from 'primevue/usedialog';
import { useConfirm } from 'primevue/useconfirm';
import { AccountStatus } from '~/enums/account-status';
import { AppRole } from '~/enums/app-role';

const appStore = useAppStore();
const accountStore = useAccountStore();
const productStore = useProductStore();
const accountBudgetStore = useAccountBudgetStore();
const userStore = useUserStore();
const editingRows = ref([]);
const isAccExpModal = ref(false);
const selectedAccount = ref<Account>();
const confirm = useConfirm();
const dialog = useDialog();

const AccountBudgetModal = defineAsyncComponent(
  () => import('~/components/admin/modal/AccountBudget.vue')
);

const isAdmin = userStore.loggedInUser?.roles.includes(AppRole.Admin) || false;
const isRowEditable = ref(true);

const userList = computed(() => {
  return userStore.userList || [];
});

const totalBudget = computed(() => {
  return currencyFormatter(
    accountStore.accountsList?.reduce(
      (acc, account) => +acc + +account.totalBudget!,
      0
    ) || 0
  ).toString();
});

const totalExpense = computed(() => {
  return currencyFormatter(
    accountStore.accountsList?.reduce(
      (acc, account) => +acc + +account.totalExpenses!,
      0
    ) || 0
  ).toString();
});

onMounted(async () => {
  accountStore.clearFiltersAndParameters();
  await productStore.fetchProducts(true);
  await userStore.fetchUsers(true);
  await accountStore.fetchAccounts();
});

const rowClass = (data: Account) => {
  return [{ 'bg-red-100': +data.totalBudget! < +data.totalExpenses! }];
};

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  const account: Account = {
    ...newData,
    departureDate: new Date(newData.departureDate).toISOString(),
  };

  if (!account.reviewerNotes) delete account.reviewerNotes;
  await accountStore.updateAccount(account);
};

const viewDetails = async (account: Account) => {
  selectedAccount.value = account;
  accountBudgetStore.clearFiltersAndParameters();
  await accountBudgetStore.fetchAccountBudgets(
    `accountId=${account.id}&productId=${account.productId}`
  );

  dialog.open(AccountBudgetModal, {
    props: {
      header: 'Account Details',
      style: {
        width: '95vw',
      },
    },
  });
};

const openExportAccModal = async (account: Account) => {
  selectedAccount.value = account;
  isAccExpModal.value = true;
};

const isDisabled = (status: string): boolean => {
  return status === AccountStatus.APPROVED && !isAdmin;
};

const isVisible = (status: string): boolean => {
  if (status === AccountStatus.APPROVED && isAdmin) {
    isRowEditable.value = true;
    return true;
  }

  if (
    (status === AccountStatus.APPROVED || status === AccountStatus.REJECTED) &&
    !isAdmin
  ) {
    isRowEditable.value = false;
    return false;
  }

  isRowEditable.value = true;
  return true;
};

const removeAccount = async (event: Account) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await accountStore.deleteAccount(event.id!);
    },
  });
};

const fetchPaginatedAccounts = async (event: any) => {
  accountStore.setPaginationDetails(undefined, event.page + 1);
  await accountStore.fetchAccounts();
};
</script>
