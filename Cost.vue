<template>
  <div class="card flex justify-content-center">
    <Dialog
      :visible="visible"
      :closable="false"
      :draggable="false"
      modal
      header="Budget Cost"
      :style="{ width: '60rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div
        class="flex align-items-center justify-content-between flex-wrap mb-4"
      >
        <!-- <Button
          size="small"
          iconPos="right"
          icon="pi pi-plus-circle"
          @click="addNewRow"
          :disabled="isAddingRow"
        /> -->
      </div>
      <Message v-if="!budgetCostStore.costList?.length" :closable="false"
        >No results available. Please try again later.</Message
      >

      <DataTable
        v-else
        v-model:editingRows="editingRows"
        :value="budgetCostStore.costList"
        class="mt-10 p-datatable-sm"
        editMode="row"
        dataKey="id"
        @row-edit-save="onRowAddOrEdit"
        @row-edit-cancel="onRowCancel"
        lazy
        scrollable
        scrollHeight="500px"
        tableStyle="min-width: 50rem"
        :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state }: any) => ({
              style:
                state['d_editing'] &&
                'padding-top: 0.6rem; padding-bottom: 0.6rem',
            }),
          },
        }"
      >
        <Column field="costTypeText" header="Cost Type">
          <!-- <template #editor="{ data, field }">
            <Dropdown
              v-model="data[field]"
              placeholder="Select a cost type"
              :options="costType"
              optionLabel="costTypeText"
              optionValue="value"
              class="w-full md:w-14rem"
            />
          </template> -->
        </Column>
        <Column field="sequence" header="No of Passengers" />
        <Column field="costAmount" header="Cost Amount">
          <template #editor="{ data, field }">
            <InputNumber v-model="data[field]" :minFractionDigits="2" />
          </template>
        </Column>

        <!-- <Column
          :rowEditor="true"
          style="max-width: 3rem"
          bodyStyle="text-align:center"
        /> -->
        <!-- <Column style="max-width: 2rem" bodyStyle="text-align:center">
          <template #body="slotProps">
            <div
              class="text-red-500 cursor-pointer"
              @click="removeCost(slotProps.data)"
            >
              <i class="pi pi-trash" />
            </div>
          </template>
        </Column> -->
      </DataTable>

      <Toast position="bottom-right" />

      <div class="mt-5 flex gap-2 justify-content-end">
        <Button
          class="w-7rem"
          label="Close"
          @click="closeModal"
          outlined
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type Cost } from '~/interfaces/models/cost';
import { costType } from '~/utils/constants';
import { useCostStore } from '~/stores/useCostStore';
import { useBudgetCostStore } from '~/stores/useBudgetCostStore';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  budgetId: {
    type: Number,
    required: true,
  },
});
const emits = defineEmits(['closeModal']);
const costStore = useCostStore();
const budgetCostStore = useBudgetCostStore();
const editingRows: Ref<Cost[]> = ref([]);
const isAddingRow = ref(false);
const confirm = useConfirm();

onMounted(async () => {
  costStore.clearFiltersAndParameters();
  isAddingRow.value = false;
});

const onRowAddOrEdit = async (event: any) => {
  const { newData } = event;

  if (newData.id < 0) {
    await costStore.createNewCost({
      ...newData,
      budgetId: props.budgetId,
    });
  } else {
    await costStore.updateCost({
      ...newData,
      budgetId: props.budgetId,
    });
  }
  costStore.clearFiltersAndParameters();
  await budgetCostStore.fetchCostByBudgetId(props.budgetId);
  isAddingRow.value = false;
};

const onRowCancel = async (event: any) => {
  const { newData } = event;
  if (newData.id < 0) {
    editingRows.value = [];
    costStore.clearFiltersAndParameters();
    await budgetCostStore.fetchCostByBudgetId(props.budgetId);
    isAddingRow.value = false;
  }
};

const removeCost = async (event: Cost) => {
  if (event.id! > 0) {
    confirm.require({
      ...deleteConfirmationDialogOptions,
      accept: async () => {
        await costStore.deleteCost(event.id!);
        await budgetCostStore.fetchCostByBudgetId(props.budgetId);
      },
    });
  } else {
    await costStore.clearFiltersAndParameters();
    await budgetCostStore.fetchCostByBudgetId(props.budgetId);
    isAddingRow.value = false;
    editingRows.value = [];
  }
};

const closeModal = () => {
  costStore.clearFiltersAndParameters();
  editingRows.value = [];
  budgetCostStore.costList = [];
  isAddingRow.value = false;
  emits('closeModal');
};

const addNewRow = (): void => {
  isAddingRow.value = true;
  if (budgetCostStore.costList) {
    const newCostRow: Cost = {
      id: -1,
      costType: '',
      costAmount: 0,
    };

    budgetCostStore.costList.push(newCostRow);
    editingRows.value.push(newCostRow);
  } else {
    isAddingRow.value = false;
  }
};
</script>
