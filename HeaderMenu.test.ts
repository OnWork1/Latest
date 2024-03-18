import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import HeaderMenu from '../../navigation/HeaderMenu.vue';
import { shallowMount } from '@vue/test-utils';

describe('Navigation -> HeaderMenu', () => {
  beforeAll(() => {
    mockNuxtImport('useUserStore', () => {
      return () => {
        return {
          loggedInUser: {
            name: 'dilusha',
            roles: ['Admin'],
          },
          userList: { name: 'user1' },
          fetchUsers: vi.fn(),
        };
      };
    });
  });

  it('should load headermenu correctly', () => {
    const component = shallowMount(HeaderMenu);

    expect(component.find('div').attributes('class')).toBe('top-navigation');
    expect(component.find('menubar-stub').attributes('model')).toBe('');
  });
});
