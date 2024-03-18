<template>
  <Message
    v-if="!currencyStore.currencyList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="currencyStore.currencyList?.length"
    v-model:editingRows="editingRows"
    :value="currencyStore.currencyList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="500px"
    :rows="currencyStore.pagination.perPage"
    :totalRecords="currencyStore.pagination.totalCount"
    @page="fetchPaginatedCurrencies"
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
    <Column field="currencyName" header="Currency">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a Currency"
          :options="currencies"
          optionLabel="currencyName"
          optionValue="currencyName"
          :filterFields="['currencyName', 'currencyCode']"
          filter
        >
          <template #option="slotProps">
            <div class="flex align-items-center gap-2">
              <div>{{ slotProps.option.flag }}</div>
              <div>{{ slotProps.option.currencyCode }}</div>
              <div>{{ slotProps.option.currencyName }}</div>
            </div>
          </template>
        </Dropdown>
      </template>
      <template #body="slotProps">
        <div class="flex align-items-center gap-4">
          <div>
            {{ getFlagByCurrencyCode(slotProps.data.currencyCode) }}
          </div>
          <div>{{ slotProps.data.currencyCode }}</div>
          <div>{{ slotProps.data.currencyName }}</div>
        </div>
      </template>
    </Column>
    <Column field="currencyRate" header="Currency Rate (AUD)">
      <template #editor="{ data, field }">
        <InputNumber
          v-model="data[field]"
          mode="decimal"
          :minFractionDigits="4"
        />
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
          @click="removeCurrency(slotProps.data)"
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
import { type Currency } from '~/interfaces/models/currency';
import { useAppStore } from '~/stores/useAppStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import { useConfirm } from 'primevue/useconfirm';
import { currencies } from '~/utils/currency-list';
import { getFlagByCurrencyCode } from '~/utils/helpers';

const appStore = useAppStore();
const currencyStore = useCurrencyStore();
const editingRows = ref([]);
const confirm = useConfirm();

onMounted(async () => {
  currencyStore.clearFiltersAndParameters();
  await currencyStore.fetchCurrencies();
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;

  const currencyCode = currencies.find(
    (currency) => currency.currencyName === newData.currencyName
  )?.currencyCode;

  const currency: Currency = {
    id: newData.id,
    currencyCode: currencyCode!,
    currencyName: newData.currencyName,
    currencyRate: newData.currencyRate,
  };

  await currencyStore.updateCurrency(currency);
};

const removeCurrency = async (event: Currency) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await currencyStore.deleteCurrency(event.id!);
    },
  });
};

const fetchPaginatedCurrencies = async (event: any) => {
  currencyStore.setPaginationDetails(undefined, event.page + 1);
  await currencyStore.fetchCurrencies();
};
</script>
