<template>
  <Message
    v-if="!productStore.productList?.length && !appStore.isLoading"
    :closable="false"
    >No results available. Please try again later.</Message
  >

  <DataTable
    v-else="productStore.productList?.length"
    v-model:editingRows="editingRows"
    :value="productStore.productList"
    class="mt-10 p-datatable-sm"
    editMode="row"
    dataKey="id"
    @row-edit-save="onRowEditSave"
    lazy
    paginator
    scrollable
    scrollHeight="650px"
    :rows="productStore.pagination.perPage"
    :totalRecords="productStore.pagination.totalCount"
    @page="fetchPaginatedProducts"
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
    <Column field="productCode" header="Product Code">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" /> </template
    ></Column>
    <Column field="productName" header="Product Name">
      <template #editor="{ data, field }">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    <Column field="duration" header="Duration (Days)">
      <template #editor="{ data, field }">
        <InputNumber v-model="data[field]" />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.duration ?? 0 }}
      </template>
    </Column>
    <Column field="brandId" header="Brand">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a brand"
          :options="brandsList"
          optionLabel="brandName"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.brandName }}
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
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.companyName }}
      </template>
    </Column>
    <Column field="businessId" header="Business Code">
      <template #editor="{ data, field }">
        <Dropdown
          v-model="data[field]"
          placeholder="Select a business code"
          :options="businesses"
          optionLabel="businessCode"
          optionValue="id"
          class="w-full md:w-14rem"
          filter
        />
      </template>
      <template #body="slotProps">
        {{ slotProps.data.businessCode }}
      </template>
    </Column>
    <Column :rowEditor="true" bodyStyle="text-align:center"> </Column>
    <Column
      v-if="hasPermission('products', userStore.loggedInUser?.roles!, 'delete')"
      bodyStyle="text-align:center"
    >
      <template #body="slotProps">
        <div class="flex gap-3">
          <div
            class="text-gray-500 cursor-pointer"
            @click="viewBudgetDetails(slotProps.data)"
          >
            <i class="pi pi-external-link" />
          </div>
          <div
            class="text-red-500 cursor-pointer"
            @click="removeProduct(slotProps.data)"
          >
            <i class="pi pi-trash" />
          </div>
        </div>
      </template>
    </Column>
  </DataTable>

  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '~/stores/useProductStore';
import { useBrandStore } from '~/stores/useBrandStore';
import { useCompanyStore } from '~/stores/useCompanyStore';
import { useBusinessStore } from '~/stores/useBusinessStore';
import { useUserStore } from '~/stores/useUserStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Product } from '~/interfaces/models/product';
import { useConfirm } from 'primevue/useconfirm';

const appStore = useAppStore();
const productStore = useProductStore();
const brandStore = useBrandStore();
const companyStore = useCompanyStore();
const businessStore = useBusinessStore();
const userStore = useUserStore();
const editingRows = ref([]);
const router = useRouter();
const confirm = useConfirm();

const brandsList = computed(() => {
  return brandStore.brandsList || [];
});

const companyList = computed(() => {
  return companyStore.companyList || [];
});

const businesses = computed(() => {
  return businessStore.businessesList || [];
});

onMounted(async () => {
  productStore.clearFiltersAndParameters();
  await productStore.fetchProducts();
  await companyStore.fetchCompanies(true);
  await businessStore.fetchBusinesses(true);
});

const onRowEditSave = async (event: any) => {
  const { newData } = event;
  await productStore.updateProduct({ ...newData });
};

const removeProduct = async (event: Product) => {
  confirm.require({
    ...deleteConfirmationDialogOptions,
    accept: async () => {
      await productStore.deleteProduct(event.id!);
    },
  });
};

async function fetchPaginatedProducts(event: any) {
  productStore.setPaginationDetails(undefined, event.page + 1);
  await productStore.fetchProducts();
}

const viewBudgetDetails = (event: Product) => {
  router.push({
    path: '/admin/budget-lines',
    query: { productId: `${event.id}` },
  });
};
</script>
