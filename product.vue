<template>
  <div v-if="product?.id" class="mb-5 p-2 shadow-2 border-round-lg">
    <h3 class="px-2 font-medium text-lg">Product Details</h3>

    <div class="flex">
      <div>
        <div class="m-3 flex w-22rem">
          <p class="m-0 w-6 font-bold">Product Name:</p>
          <p id="product-name" class="m-0 w-6">{{ product.productName }}</p>
        </div>

        <div class="m-3 flex w-22rem">
          <p class="m-0 w-6 font-bold">Brand Name:</p>
          <p id="product-brand" class="m-0 w-6">{{ product.brandName }}</p>
        </div>
      </div>
      <div>
        <div class="m-3 flex w-22rem">
          <p class="m-0 w-6 font-bold">Company Name:</p>
          <p id="company-name" class="m-0 w-6">{{ product.companyName }}</p>
        </div>

        <div class="m-3 flex w-22rem">
          <p class="m-0 w-6 font-bold">Product Code:</p>
          <p id="product-code" class="m-0 w-6">{{ product.productCode }}</p>
        </div>
      </div>
      <div>
        <div class="m-3 flex w-22rem">
          <p class="m-0 w-6 font-bold">Company Code:</p>
          <p id="company-code" class="m-0 w-6">{{ product.companyCode }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  product: {
    type: Object,
    required: false,
  },
});
</script>
