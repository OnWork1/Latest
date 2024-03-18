<template>
  <div class="relative">
    <Loader v-if="appStore.isLoading" />
    <div class="flex flex-column h-screen">
      <NavigationTheHeader />
      <NavigationHeaderMenu />

      <div class="flex dashboard-content">
        <div class="px-3 overflow-auto flex-grow-1">
          <slot />
          <DynamicDialog />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/stores/useAppStore';
import { getNewrelicScriptBlock } from '~/utils/newrelic-config';

const { public: publicConfig } = useRuntimeConfig();

useHead({
  title: 'Intrepid - Admin Panel',
  script: getNewrelicScriptBlock(publicConfig.deploymentEnv),
});

const appStore = useAppStore();
</script>

<style lang="scss">
.dashboard-content {
  height: calc(100vh - 10rem) !important;
}
</style>
~/utils/newrelic-config
