<template>
  <div class="top-navigation">
    <Menubar :model="authorizedLinks">
      <template #item="{ item, props }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="`/admin/${item.route}`"
          custom
        >
          <a
            v-ripple
            :id="`link-${item.route}`"
            :href="href"
            v-bind="props.action"
            @click="navigate"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
  </div>
</template>

<script setup lang="ts">
import { type NavigationLink } from '~/interfaces/common/navigation-link';
import { useUserStore } from '~/stores/useUserStore';
import { hasPermission } from '~/utils/access-control-list';

const userStore = useUserStore();
const authorizedLinks = ref<NavigationLink[]>([]);

onMounted(() => {
  const roles = userStore.loggedInUser?.roles!;

  navigationLinks.forEach((item) => {
    const result = hasPermission(item.route, roles);
    if (result) {
      authorizedLinks.value.push(item);
    }
  });
});
</script>
