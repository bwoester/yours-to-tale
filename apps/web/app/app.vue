<script setup lang="ts">
import { ref } from 'vue';
import type { Tale, TaleGenerationRequest } from '#shared/domain/tale';
import TaleGeneratorForm from './components/TaleGeneratorForm.vue';
import TaleViewer from './components/TaleViewer.vue';

const tale = ref<Tale | null>(null);
const loading = ref(false);
const errorMessage = ref('');

async function generateTale(request: TaleGenerationRequest) {
  if (loading.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  tale.value = null;

  try {
    tale.value = await $fetch<Tale>('/api/tales/generate', {
      method: 'POST',
      body: request,
    });
  }
  catch {
    errorMessage.value = 'Die Geschichte konnte gerade nicht erstellt werden. Bitte versuche es erneut.';
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <NuxtRouteAnnouncer />
    <header class="hero">
      <p class="eyebrow">
        Yours to Tale
      </p>
      <h1>Alte Märchen, neue Wendungen.</h1>
      <p>Gestalte eine eigene Geschichte und entdecke, wohin deine Fantasie sie führt.</p>
    </header>

    <main>
      <TaleGeneratorForm
        :loading="loading"
        @generate="generateTale"
      />
      <output
        v-if="loading"
        class="status"
        aria-live="polite"
      >
        Dein Märchen wird gerade geschrieben …
      </output>
      <p
        v-if="errorMessage"
        class="error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <TaleViewer
        v-if="tale"
        :tale="tale"
      />
    </main>
  </div>
</template>

<style>
:root { color: #342a23; background: #f7f0e7; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input, select, textarea { font: inherit; }
.page-shell { width: min(100% - 2rem, 58rem); margin: 0 auto; padding: 3rem 0 5rem; }
.hero { margin: 0 auto 2rem; text-align: center; }
.hero h1 { max-width: 38rem; margin: 0.5rem auto 0.75rem; font-family: Georgia, serif; font-size: clamp(2.2rem, 7vw, 4.5rem); line-height: 1.05; }
.hero p:last-child { max-width: 34rem; margin: 0 auto; color: #685b4e; font-size: 1.1rem; line-height: 1.6; }
.eyebrow { color: #a35f39; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
main { display: grid; gap: 1.5rem; }
.status, .error { margin: 0; border-radius: 0.65rem; padding: 0.85rem 1rem; text-align: center; }
.status { background: #f3eadc; color: #684327; }
.error { background: #fce8e8; color: #8c2020; }
@media (max-width: 30rem) { .page-shell { width: min(100% - 1rem, 58rem); padding-top: 1.5rem; } }
</style>
