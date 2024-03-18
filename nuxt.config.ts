export default defineNuxtConfig({
  devtools: { enabled: true },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  routeRules: {
    '/leader/**': {
      ssr: false,
    },
  },

  app: {
    head: {
      title: 'Intrepid Leader Expenses',
      link: [
        {
          rel: 'icon',
          href: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        },
        {
          rel: 'apple-touch-icon',
          href: '/logos/apple-touch-icon-180x180.png',
        },
      ],
      meta: [
        {
          name: 'theme-color',
          content: '#EB281A',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      azureAdTenantId: process.env.NUXT_PUBLIC_AZURE_AD_TENANT_ID,
      deploymentEnv: process.env.NUXT_PUBLIC_DEPLOYMENT_ENV,
      buildVersion: process.env.NUXT_PUBLIC_BUILD_VERSION,
    },

    defaultPageLimit: 200,
    authSecret: process.env.NUXT_AUTH_SECRET,
    azureAdClientId: process.env.NUXT_AZURE_AD_CLIENT_ID,
    azureAdClientSecret: process.env.NUXT_AZURE_AD_CLIENT_SECRET,
  },

  modules: [
    '@vite-pwa/nuxt',
    'nuxt-primevue',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    'dayjs-nuxt',
    '@sidebase/nuxt-auth',
    '@artmizu/nuxt-prometheus',
    '@nuxt/test-utils/module',
    '@nuxtjs/google-fonts',
    '@nuxtjs/robots',
  ],
  robots: {
    rules: [
      {
        UserAgent: '*',
        Disallow: '/',
      },
    ],
  },
  googleFonts: { families: { Ubuntu: true } },

  components: {
    dirs: [
      '~/components/auth',
      '~/components/admin',
      '~/components/mobile',
      '~/components/common',
    ],
  },

  css: ['~/node_modules/primeflex/primeflex.css', '~/assets/scss/main.scss'],

  primevue: {
    options: {
      ripple: true,
    },
    components: {
      include: [
        'Button',
        'Card',
        'TabMenu',
        'Dropdown',
        'Menubar',
        'SplitButton',
        'Panel',
        'Toast',
        'InputText',
        'InputNumber',
        'TabView',
        'TabPanel',
        'DataTable',
        'Column',
        'Dialog',
        'Textarea',
        'Checkbox',
        'Message',
        'ConfirmDialog',
        'Tag',
        'Calendar',
        'FileUpload',
        'Tooltip',
        'InlineMessage',
        'RadioButton',
        'InputSwitch',
        'Accordion',
        'AccordionTab',
        'Row',
        'ColumnGroup',
        'DynamicDialog',
      ],
    },
  },

  pwa: {
    manifest: {
      name: 'Intrepid Leader Expenses',
      short_name: 'Leader Expenses',
      description: 'Easily Track Trip Expenses',
      icons: [
        { src: '/pwa-assets/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        {
          src: '/pwa-assets/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-assets/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-assets/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      theme_color: 'red',
    },

    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  auth: {
    globalAppMiddleware: true,
    provider: {
      type: 'authjs',
      defaultProvider: 'azure-ad',
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
});
