<template>
  <div>
    <form class="mx-auto" @keypress.enter="onSubmit">
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2">
          <label for="productName">Product Name</label>
          <InputText
            id="productName"
            v-model="productName"
            aria-describedby="Product-name"
            :class="{ 'p-invalid': productNameError }"
            required
          />
          <small class="p-error" id="text-error">{{
            productNameError || '&nbsp;'
          }}</small>
        </div>
        <div class="flex flex-column gap-2">
          <label for="productCode">Product Code</label>
          <InputText
            id="productCode"
            v-model="productCode"
            aria-describedby="product-code"
            :class="{ 'p-invalid': productCodeError }"
            required
          />
          <small class="p-error" id="text-error">{{
            productCodeError || '&nbsp;'
          }}</small>
        </div>
        <div class="mt-4 flex gap-3">
          <div class="flex flex-column gap-2">
            <label for="duration">Duration (Days)</label>
            <InputNumber
              id="duration"
              v-model="duration"
              aria-describedby="duration"
            />
          </div>
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="businessId">Business Code</label>
            <Dropdown
              id="businessId"
              v-model="businessId"
              :options="businessList"
              placeholder="Select a business"
              filter
              optionLabel="businessCode"
              optionValue="id"
              class="w-full"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="brandId">Brand</label>
            <Dropdown
              id="brandId"
              v-model="brandId"
              :options="brands"
              placeholder="Select a brand"
              filter
              optionLabel="brandName"
              optionValue="id"
              class="w-full"
            />
          </div>
          <div class="flex flex-column gap-2 flex-grow-1">
            <label for="companyId">Company</label>
            <Dropdown
              id="companyId"
              v-model="companyId"
              placeholder="Select a company"
              :options="companies"
              :class="{ 'p-invalid': companyError }"
              filter
              optionLabel="companyName"
              optionValue="id"
              class="w-full"
            />
            <small class="p-error" id="text-error">{{
              companyError || '&nbsp;'
            }}</small>
          </div>
        </div>
      </div>
    </form>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="save-product"
        class="w-7rem"
        label="Save"
        @click="onSubmit"
        iconPos="right"
        :loading="appStore.isLoading"
      ></Button>
      <Button
        id="close-modal"
        class="w-7rem"
        label="Close"
        @click="closeModal"
        outlined
      ></Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/useProductStore';
import { useCompanyStore } from '~/stores/useCompanyStore';
import { useBrandStore } from '~/stores/useBrandStore';
import { useBusinessStore } from '~/stores/useBusinessStore';
import { useAppStore } from '~/stores/useAppStore';
import { type Product } from '~/interfaces/models/product';
import { useField, useForm } from 'vee-validate';
import { validateInput } from '~/utils/validate-input';

const { handleSubmit, resetForm } = useForm();

const productStore = useProductStore();
const companyStore = useCompanyStore();
const businessStore = useBusinessStore();
const brandStore = useBrandStore();
const appStore = useAppStore();
const dialogRef = inject('dialogRef');

// assigned any as the dropdown property option accepts only any[] | undefined.
const brands = ref<any>([]);
const companies = ref<any>([]);

const businessList = computed(() => {
  return businessStore.businessesList || [];
});

onMounted(async () => {
  await companyStore.fetchCompanies(true);
  companies.value = companyStore.companyList;

  await brandStore.fetchBrands(true);
  brands.value = brandStore.brandsList;
});

const { value: productName, errorMessage: productNameError } = useField<string>(
  'productName',
  (value) => validateInput(value, 'Product Name')
);

const { value: productCode, errorMessage: productCodeError } = useField<string>(
  'productCode',
  (value) => validateInput(value, 'Product Code')
);

const { value: duration } = useField<number>('duration');

const { value: businessId } = useField<number>('businessId');

const { value: brandId } = useField<number>('brandId');

const { value: companyId, errorMessage: companyError } = useField<number>(
  'companyId',
  (value) => validateInput(value, 'Company')
);

const onSubmit = handleSubmit(async (values) => {
  if (values?.value?.length) {
    resetForm();
  } else {
    const product: Product = {
      productCode: values.productCode,
      productName: values.productName,
      brandId: values.brandId,
      companyId: values.companyId,
      businessId: values.businessId,
      duration: values.duration,
    };

    await productStore.createNewProduct(product);

    if (productStore.isOperationSuccessful) {
      closeModal();
    }
  }
});

const closeModal = () => {
  resetForm();
  (dialogRef as any).value.close();
};
</script>
