<template>
  <VitePwaManifest />
  <div
    class="flex flex-column align-items-center justify-content-center h-screen"
  >
    <figure>
      <img alt="Logo" src="/logos/intrepid-logo.png" class="w-22rem" />
    </figure>

    <div class="flex justify-content-center gap-2 flex-wrap">
      <NuxtLink id="mobile-app-button" to="/leader/accounts">
        <Button
          icon="pi pi-arrow-circle-right"
          label="Leader Expense Tracking"
          iconPos="right"
          severity="secondary"
          outlined
        ></Button>
      </NuxtLink>

      <NuxtLink id="admin-panel-button" to="/admin/dashboard">
        <Button
          icon="pi pi-arrow-circle-right"
          label="Expense Admin"
          iconPos="right"
          severity="secondary"
          outlined
        ></Button>
      </NuxtLink>
    </div>
  </div>
  <div v-if="publicConfig.buildVersion" class="m-3 text-400 z-5 text-xs">
    Build: {{ publicConfig.buildVersion }}
  </div>
</template>
<script setup lang="ts">
import { getNewrelicScriptBlock } from '~/utils/newrelic-config';
const { public: publicConfig } = useRuntimeConfig();

useHead({
  title: 'Leader Expenses',
  script: getNewrelicScriptBlock(publicConfig.deploymentEnv),
});
</script>
