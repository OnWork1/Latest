<template>
  <Message
    v-if="!userStore.userList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="userStore.userList?.length"
    v-model:editingRows="editingRows"
    :value="userStore.userList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="userStore.pagination.perPage"
    :totalRecords="userStore.pagination.totalCount"
    @page="fetchPaginatedUsers"
    :pt="{
      table: { style: 'min-width: 50rem' },
      column: {
        bodycell: ({ state }: any) => ({
          style:
            state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem',
        }),
      },
    }"
  >
    <Column field="cardCode" header="Card Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.cardCode }}
      </template>
    </Column>
    <Column field="cashCode" header="Cash Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.cashCode }}
      </template>
    </Column>
    <Column field="userAccount" header="Email">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="companyId" header="Company">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a company"
          :options="companyList"
          optionLabel="companyName"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
          showClear
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.companyCode }}
      </template>
    </Column>
    <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
    <Column
      v-if="hasPermission('users', userStore.loggedInUser?.roles!, 'delete')"
      bodyStyle="text-align:center"
    >
      <template #body="slotProps">
        <div
          class="text-red-500 cursor-pointer"
          @click="removeBrand(slotProps.data)"
        >
          <i class="pi pi-trash" />
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '~/stores/useAppStore';
import { useUserStore } from '~/stores/useUserStore';
import { useConfirm } from 'primevue/useconfirm';
import { type User } from '~/interfaces/models/user';

const appStore = useAppStore();
const userStore = useUserStore();
const companyStore = useCompanyStore();
const editingRows = ref([]);
const confirm = useConfirm();

const companyList = computed(() => {
  return companyStore.companyList || [];
});

onMounted(async () => {
  userStore.clearFiltersAndParameters();
  await userStore.fetchUsers();
  await companyStore.fetchCompanies(true);
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await userStore.updateUser({ ...newData });
};

const removeBrand = async (event: User) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await userStore.deleteUser(event.id!);
    },
  });
};

const fetchPaginatedUsers = async (event: any) => {
  userStore.setPaginationDetails(undefined, event.page + 1);
  await userStore.fetchUsers();
};
</script>
