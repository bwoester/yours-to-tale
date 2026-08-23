<script setup lang="ts">
import { computed, ref } from 'vue';
import { PREDEFINED_TALES } from '#shared/constants/tales';
import type { TaleGenerationRequest } from '#shared/domain/tale';

const CUSTOM_TALE = '__custom__';

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  generate: [request: TaleGenerationRequest];
}>();

const selectedTale = ref<string>(PREDEFINED_TALES[0]);
const customTitle = ref('');
const twist = ref('');
const validationMessage = ref('');

const sourceTale = computed(() => selectedTale.value === CUSTOM_TALE
  ? customTitle.value.trim()
  : selectedTale.value.trim());

function submit() {
  if (props.loading) {
    return;
  }

  if (!sourceTale.value || !twist.value.trim()) {
    validationMessage.value = 'Bitte fülle alle Pflichtfelder aus.';
    return;
  }

  validationMessage.value = '';
  emit('generate', {
    sourceTale: sourceTale.value,
    twist: twist.value.trim(),
    language: 'de',
  });
}
</script>

<template>
  <form
    class="generator-form"
    @submit.prevent="submit"
  >
    <div class="form-heading">
      <p class="eyebrow">
        Dein Märchenlabor
      </p>
      <h2>Gib einer Geschichte eine neue Wendung</h2>
      <p>Wähle ein Märchen und beschreibe, was darin ganz anders passieren soll.</p>
    </div>

    <div class="field-group">
      <label for="source-tale">Ausgangsmärchen</label>
      <select
        id="source-tale"
        v-model="selectedTale"
        :disabled="loading"
      >
        <option
          v-for="tale in PREDEFINED_TALES"
          :key="tale"
          :value="tale"
        >
          {{ tale }}
        </option>
        <option :value="CUSTOM_TALE">
          Eigenen Titel eingeben
        </option>
      </select>
    </div>

    <div
      v-if="selectedTale === CUSTOM_TALE"
      class="field-group"
    >
      <label for="custom-title">Eigener Märchentitel</label>
      <input
        id="custom-title"
        v-model="customTitle"
        type="text"
        placeholder="Zum Beispiel: Die Stadt unter dem See"
        :disabled="loading"
        :required="selectedTale === CUSTOM_TALE"
      >
    </div>

    <div class="field-group">
      <label for="twist">Deine Wendung</label>
      <textarea
        id="twist"
        v-model="twist"
        rows="5"
        placeholder="Zum Beispiel: Der Wolf möchte eigentlich ein Fest für das Rotkäppchen veranstalten."
        :disabled="loading"
        required
      />
    </div>

    <p
      v-if="validationMessage"
      class="form-message"
      role="alert"
    >
      {{ validationMessage }}
    </p>

    <button
      class="primary-button"
      type="submit"
      :disabled="loading"
    >
      <span
        v-if="loading"
        class="spinner"
        aria-hidden="true"
      />
      {{ loading ? 'Geschichte wird geschrieben …' : 'Märchen generieren' }}
    </button>
  </form>
</template>

<style scoped>
.generator-form {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border: 1px solid #eadfce;
  border-radius: 1.25rem;
  background: #fffdf9;
  box-shadow: 0 1rem 3rem rgb(71 49 25 / 8%);
}

.form-heading { display: grid; gap: 0.45rem; }
.form-heading h2 { margin: 0; font-family: Georgia, serif; font-size: clamp(1.5rem, 3vw, 2rem); }
.form-heading p { margin: 0; color: #685b4e; }
.eyebrow { color: #a35f39 !important; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.field-group { display: grid; gap: 0.5rem; }
label { font-weight: 700; }
select, input, textarea { width: 100%; border: 1px solid #cfc0ad; border-radius: 0.65rem; background: #fff; color: #2d251f; font: inherit; padding: 0.75rem 0.85rem; }
textarea { min-height: 8rem; resize: vertical; }
select:focus-visible, input:focus-visible, textarea:focus-visible, button:focus-visible { outline: 3px solid #e3a64b; outline-offset: 2px; }
select:disabled, input:disabled, textarea:disabled, button:disabled { cursor: not-allowed; opacity: 0.65; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; border: 0; border-radius: 0.7rem; background: #a35f39; color: #fff; cursor: pointer; font: inherit; font-weight: 700; padding: 0.85rem 1.2rem; }
.primary-button:not(:disabled):hover { background: #814628; }
.form-message { margin: 0; color: #a12626; font-weight: 600; }
.spinner { width: 1rem; height: 1rem; border: 2px solid rgb(255 255 255 / 45%); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
