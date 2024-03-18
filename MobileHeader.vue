<template>
  <div
    class="px-3 h-4rem flex justify-content-between align-items-center shadow-1 w-full"
  >
    <div class="w-4 cursor-pointer" @click="navigateUser">
      <i v-if="isVisible" class="pi pi-arrow-left" style="color: black"></i>
    </div>

    <div class="w-4 flex justify-content-center">
      <NuxtLink to="/leader/accounts">
        <figure class="m-0">
          <img alt="logo" src="/logos/intrepid-logo.png" class="w-7rem" />
        </figure>
      </NuxtLink>
    </div>
    <div class="w-4 text-right">
      <div class="cursor-pointer" @click="logOut">
        <i class="pi pi-sign-out" style="color: black"></i>
      </div>
    </div>
  </div>
  <div
    v-if="!offlineStore.isOnline"
    class="scalein animation-ease-out animation-duration-1000 animation-iteration-2 bg-red-500 text-white text-center py-2 top-0 left-0 w-full z-50"
  >
    You are currently working on offline mode...
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useOfflineStore } from '~/stores/useOfflineStore';
import { useDepartmentStore } from '~/stores/useDepartmentStore';
import { useProductStore } from '~/stores/useProductStore';
import { useTaxStore } from '~/stores/useTaxStore';
import { useSalesTaxGroupStore } from '~/stores/useSalesTaxGroupStore';
import { useExpenseCategoryStore } from '~/stores/useExpenseCategoryStore';

const config = useRuntimeConfig();
const { signOut } = useAuth();
const route = useRoute();
const router = useRouter();
const offlineStore = useOfflineStore();
const departmentStore = useDepartmentStore();
const productStore = useProductStore();
const taxStore = useTaxStore();
const salesTaxGroupStore = useSalesTaxGroupStore();
const expenseCategoryStore = useExpenseCategoryStore();

const isVisible = computed(() => {
  return route.path === '/leader/accounts' ? false : true;
});

onMounted(async () => {
  offlineStore.isMobile = true;

  if (offlineStore.isOnline) {
    await departmentStore.fetchDepartments(true);
    await productStore.fetchProducts(true);
    await taxStore.fetchTaxes(true);
    await salesTaxGroupStore.fetchSalesTaxGroups(true);
    await expenseCategoryStore.fetchExpenseCategories(true);
  }
});

onUnmounted(() => {
  offlineStore.isMobile = false;
});

const navigateUser = () => {
  const leaderPath = `/leader`;
  const isReceiptsRoute = route.name?.toString().includes('receipts');
  const isExpenseDetailsRoute = route.name
    ?.toString()
    .includes('expenses-details');
  const isAccountDetailsRoute = route.name
    ?.toString()
    .includes('accounts-details');

  if (route.query.accountId) {
    if (isReceiptsRoute || isExpenseDetailsRoute) {
      router.push(`${leaderPath}/expenses?accountId=${route.query.accountId}`);
    } else if (
      isAccountDetailsRoute ||
      route.name?.toString().includes('expenses')
    ) {
      router.push(`${leaderPath}/accounts`);
    }
  } else {
    router.push(`${leaderPath}/accounts`);
  }
};

async function logOut() {
  await signOut({ redirect: false });
  window.location.replace(
    `https://login.microsoftonline.com/${config.public.azureAdTenantId}/oauth2/v2.0/logout`
  );
}
</script>
