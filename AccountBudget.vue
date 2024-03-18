<template>
  <div>
    <TabView>
      <TabPanel header="Budgets & Expenses">
        <TableAccountBudgetList />
      </TabPanel>
    </TabView>

    <div class="mt-5 flex gap-2 justify-content-end">
      <Button
        id="close-modal"
        class="w-7rem"
        label="Close"
        @click="closeModal"
      ></Button>
    </div>
  </div>
</template>

<script setup lang="ts">
const dialogRef = inject('dialogRef');

const closeModal = () => {
  (dialogRef as any).value.close();
};
</script>
