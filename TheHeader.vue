<template>
  <Menubar class="h-5rem border-noround border-transparent shadow-1">
    <template #start>
      <figure>
        <img alt="logo" src="/logos/intrepid-logo.png" class="mr-2 w-9rem" />
      </figure>
    </template>

    <template #end>
      <div class="flex align-items-center">
        <SplitButton
          id="user-dropdown"
          class="px-2 mt-2"
          icon="pi pi-user"
          :label="data?.user?.name ?? 'n/a'"
          :model="items"
          text
          severity="secondary"
        ></SplitButton>
      </div>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const { data, signOut } = useAuth();

const items = [
  {
    icon: 'pi pi-sign-out',
    label: 'Logout',
    command: () => {
      logOut();
    },
  },
];

async function logOut() {
  await signOut({ redirect: false });
  window.location.replace(
    `https://login.microsoftonline.com/${config.public.azureAdTenantId}/oauth2/v2.0/logout`
  );
}
</script>
