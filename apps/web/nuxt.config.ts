import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

/**
 * Create a resolver anchored at the current working directory without using
 * import.meta. npm executes workspace scripts with the workspace as cwd, and
 * Node's regular module lookup can also walk up to the repository-level
 * node_modules directory.
 */
const requireFromProject = createRequire(resolve('package.json'));
const requireFromNuxt = createRequire(
  requireFromProject.resolve('nuxt/package.json'),
);
const requireFromNitroServer = createRequire(
  requireFromNuxt.resolve('@nuxt/nitro-server/package.json'),
);

/**
 * Nuxt 4.5.x uses H3 v1 through @nuxt/nitro-server, while the development
 * dependency chain @nuxt/eslint -> config-inspector -> devframe installs
 * H3 v2. npm may place that unrelated H3 v2 installation in the repository's
 * root node_modules directory.
 *
 * Nuxt 4.5.2 can consequently generate TypeScript paths for the bare "h3"
 * import against H3 v2, although the Nitro server and its request handlers
 * use H3 v1. The runtime is unaffected, but TypeScript considers the two
 * H3Event declarations incompatible.
 *
 * Resolve H3 relative to @nuxt/nitro-server so type-checking uses the same
 * package as Nitro itself. No H3 version is pinned: this follows Nitro
 * automatically whenever Nuxt changes its H3 dependency.
 *
 * API route files are checked in both the app and Nitro server TypeScript
 * contexts. The same path override is therefore applied to both contexts.
 *
 * TODO: Remove this workaround once Nuxt generates both H3 paths relative to
 * @nuxt/nitro-server and useRuntimeConfig(event) type-checks without it.
 *
 * Context: https://github.com/nuxt/nuxt/pull/35774
 */
const nitroH3PackageRoot = dirname(
  requireFromNitroServer.resolve('h3/package.json'),
);

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },
  runtimeConfig: {
    geminiApiKey: '',
    geminiModel: 'gemini-3.6-flash',
  },
  compatibilityDate: '2026-08-09',
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {
            // Use Nitro's own H3 installation for the server type context.
            h3: [nitroH3PackageRoot],
          },
        },
      },
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          // API routes are also checked while Nuxt derives client-side API types.
          h3: [nitroH3PackageRoot],
        },
      },
    },
  },
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
