import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { shallowMount } from '@vue/test-utils';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import TheHeader from '../../navigation/TheHeader.vue';

describe('TheHeader', () => {
  beforeAll(() => {
    mockNuxtImport('useRuntimeConfig', () => {
      return () => {
        return { public: { azureAdTenantId: '123' } };
      };
    });

    mockNuxtImport('useAuth', () => {
      return () => {
        return { signOut: vi.fn(), data: {} };
      };
    });
  });

  it('should load theHeader correctly', () => {
    const component = shallowMount(TheHeader);
    expect(component).toBeTruthy();
    expect(component.find('menubar-stub').attributes('class')).toBe(
      'h-5rem border-noround border-transparent shadow-1'
    );
  });
});
