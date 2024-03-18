<template>
  <div class="card flex justify-content-center">
    <Dialog
      id="budget-upload-errors-modal"
      :visible="visible"
      :closable="false"
      :draggable="false"
      modal
      header="Budget Upload Errors"
      :style="{ width: '60rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <DataTable
        v-if="aggregatedErrors?.length"
        :value="aggregatedErrors"
        class="mt-10 p-datatable-sm"
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
        <Column field="rowNumber" header="Row Number">
          <InputNumber />
        </Column>
        <Column field="errorMessage" header="Error Message">
          <InputNumber />
        </Column>
      </DataTable>

      <Toast position="bottom-right" />

      <div class="mt-8 flex gap-2 justify-content-end">
        <Button
          class="w-7rem"
          label="Close"
          @click="closeModal"
          outlined
        ></Button>
        <Button
          label="Reset & Close"
          severity="danger"
          :size="'small'"
          @click="resetAndCloseModal"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useBudgetStore } from '~/stores/useBudgetStore';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['closeModal']);
const budgetStore = useBudgetStore();

onMounted(async () => {
  budgetStore.clearFiltersAndParameters();
});

const aggregatedErrors = computed(() => {
  const errorsMap = new Map<number, string[]>();

  for (const result of budgetStore.uploadResults) {
    if (!result.isSuccess) {
      if (errorsMap.has(result.rowNumber)) {
        errorsMap.get(result.rowNumber)?.push(result.errorMessage);
      } else {
        errorsMap.set(result.rowNumber, [result.errorMessage]);
      }
    }
  }

  return Array.from(errorsMap, ([rowNumber, errorMessages]) => ({
    rowNumber,
    errorMessage: errorMessages.join(', '),
  }));
});

const resetAndCloseModal = () => {
  budgetStore.uploadStatus = false;
  budgetStore.uploadResults = [];
  emits('closeModal');
};

const closeModal = () => {
  emits('closeModal');
};
</script>
