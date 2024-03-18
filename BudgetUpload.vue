<template>
  <div class="card flex justify-content-center">
    <Dialog
      :visible="visible"
      :closable="false"
      :draggable="false"
      modal
      header="Upload Budget"
      :style="{ width: '40rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <form class="mx-auto" @keypress.enter="budgetUpload">
        <div class="card">
          <FileUpload
            ref="fileUpload"
            name="budgetFiles"
            customUpload
            :auto="false"
            accept=".csv, text/csv"
            :fileLimit="1"
            :maxFileSize="maxFileUploadSize"
            :showCancelButton="false"
            :multiple="false"
            @uploader="budgetUpload($event)"
            mode="advanced"
          >
            <template #empty>
              <p>Drag and drop a file to here to upload.</p>
            </template>
          </FileUpload>
        </div>
      </form>

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
import { useBudgetStore } from '@/stores/useBudgetStore';
import { maxFileUploadSize } from '@/utils/constants';
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: Number,
    default: null,
    validator: (value) => typeof value === 'number' || value === null,
  },
});

const emits = defineEmits(['closeModal']);
const budgetStore = useBudgetStore();

const budgetUpload = async (event: any) => {
  const formData = new FormData();
  formData.append('budgetUpload', event.files[0]);
  formData.append('productId', props.productId.toString());

  budgetStore.uploadNewFile(formData);
  closeModal();
};
const closeModal = () => {
  emits('closeModal');
};
</script>
