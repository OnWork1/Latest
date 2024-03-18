<template>
  <Message
    v-if="!departmentStore.departmentList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="departmentStore.departmentList?.length"
    v-model:editingRows="editingRows"
    :value="departmentStore.departmentList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="500px"
    :rows="departmentStore.pagination.perPage"
    :totalRecords="departmentStore.pagination.totalCount"
    @page="fetchPaginatedDepartments"
    tableStyle="min-width: 50rem"
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
    <Column field="departmentCode" header="Department Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="departmentName" header="Department Name">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column
      :rowEditor="true"
      style="max-width: 3rem"
      bodyStyle="text-align:center"
    >
    </Column>
    <Column style="max-width: 2rem" bodyStyle="text-align:center">
      <template #body="slotProps">
        <div
          class="text-red-500 cursor-pointer"
          @click="removeDepartment(slotProps.data)"
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
import { type Department } from '~/interfaces/models/department';
import { useAppStore } from '~/stores/useAppStore';
import { useDepartmentStore } from '@/stores/useDepartmentStore';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const departmentStore = useDepartmentStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  departmentStore.clearFiltersAndParameters();
  await departmentStore.fetchDepartments();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await departmentStore.updateDepartment({ ...newData });
};

const removeDepartment = async (event: Department) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await departmentStore.deleteDepartment(event.id!);
    },
  });
};

const fetchPaginatedDepartments = async (event: any) => {
  departmentStore.setPaginationDetails(undefined, event.page + 1);
  await departmentStore.fetchDepartments();
};
</script>
