// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  runtimeConfig: {
    geminiApiKey: '',
    geminiModel: 'gemini-3.6-flash',
  },
  compatibilityDate: '2026-08-09',
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: true,
        blockSpacing: true,
        commaDangle: 'always-multiline',
      },
    },
  },
});
