<template>
  <div class="my-3 flex justify-content-end align-items-center">
    <span class="px-1">Display</span>
    <Dropdown
      v-model="itemsPerPage"
      :options="perPageValues"
      optionLabel="value"
      @change="selectPageSize"
    />
    <span class="px-1">{{ recordType }} per page</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  recordType: {
    required: false,
    type: String,
    default: 'Items',
  },
});

const emit = defineEmits(['perPageSize']);
const itemsPerPage = ref({ value: 5 });

const perPageValues = ref([
  { value: 5 },
  { value: 10 },
  { value: 15 },
  { value: 20 },
]);

const selectPageSize = () => {
  emit('perPageSize', { perPage: itemsPerPage.value.value, page: 1 });
};
</script>
