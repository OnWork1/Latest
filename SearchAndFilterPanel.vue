<template>
  <div class="my-5 flex justify-content-between align-items-center">
    <h1 class="m-0 text-4xl font-bold text-gray-800 capitalize">
      {{ title }}
    </h1>

    <div v-if="isSearchVisible" class="flex align-items-center gap-2">
      <span class="p-input-icon-left p-input-icon-right">
        <i class="pi pi-search" />
        <InputText
          class="w-24rem"
          v-model="searchString"
          v-tooltip.top="placeholderText"
          :placeholder="placeholderText"
          @keypress.enter="search"
        />

        <i
          v-if="searchString"
          class="pi pi-times cursor-pointer"
          style="color: green"
          @click="clearSearchField"
        ></i>
      </span>

      <Button
        class="w-8rem"
        label="Search"
        size="small"
        @click="search"
      ></Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  isSearchVisible: {
    type: Boolean,
    default: true,
  },
  placeholderText: {
    type: String,
    default: 'What are you looking for?',
  },
});

const emit = defineEmits(['searchQuery']);
const searchString = ref('');

const search = () => {
  emit('searchQuery', searchString.value);
};

const clearSearchField = () => {
  searchString.value = '';
  search();
};
</script>
