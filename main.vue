<template>
  <VitePwaManifest />
  <div class="relative">
    <Loader v-if="appStore.isLoading" />
    <div class="flex flex-column h-screen">
      <NavigationMobileHeader />
      <div class="flex mobile-content">
        <div class="overflow-auto flex-grow-1">
          <slot />
        </div>
      </div>
    </div>

    <Toast position="bottom-right" />
    <NuxtLink to="/leader/expenses/details?accountId=-1"></NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/useAppStore';
import { useOnline } from '@vueuse/core';
import { useAccountStore } from '~/stores/useAccountStore';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { getNewrelicScriptBlock } from '~/utils/newrelic-config';
const { public: publicConfig } = useRuntimeConfig();

useHead({
  title: 'Intrepid - Leader App',
  script: getNewrelicScriptBlock(publicConfig.deploymentEnv),
});

const appStore = useAppStore();
let isOnline = useOnline();
const accountStore = useAccountStore();
const offlineStore = useOfflineStore();

watch(isOnline, async (online) => {
  if (online) {
    await offlineStore.syncExpenses();
    await offlineStore.syncExpensesDelete();
  }
});
</script>

<style lang="scss">
.mobile-content {
  height: calc(100vh - 4rem) !important;
}
</style>
~/utils/newrelic-config
