<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Tale } from '#shared/domain/tale';

type ViewMode = 'prose' | 'highlighted' | 'json';
type ProseTurn = {
  speakerId: string;
  text: string;
};
type ProseParagraph = ProseTurn[];

const narratorColor = '#f3eadc';
const characterColors = [
  '#dcecf4',
  '#e5f0df',
  '#f4e2ed',
  '#eee4d5',
  '#e1e2f2',
  '#f1e8c9',
  '#e2eee9',
  '#f0dfd5',
];

const props = defineProps<{
  tale: Tale;
}>();

const mode = ref<ViewMode>('prose');
const activeSegment = ref<string | null>(null);
const modes: Array<{ value: ViewMode; label: string }> = [
  { value: 'prose', label: 'Prose' },
  { value: 'highlighted', label: 'Hervorgehoben' },
  { value: 'json', label: 'JSON' },
];

const speakers = computed(() => new Map(props.tale.speakers.map(speaker => [speaker.id, speaker])));

function speakerFor(speakerId: string) {
  return speakers.value.get(speakerId) ?? {
    id: speakerId,
    name: 'Unbekannte Stimme',
    role: 'character' as const,
    voice: { description: 'Keine Beschreibung verfügbar' },
  };
}

function removeOuterQuotes(text: string) {
  const trimmedText = text.trim();
  const quotePairs: Array<[string, string]> = [
    ['„', '“'],
    ['"', '"'],
    ['“', '”'],
  ];

  for (const [opening, closing] of quotePairs) {
    if (trimmedText.startsWith(opening) && trimmedText.endsWith(closing) && trimmedText.length > opening.length + closing.length) {
      return trimmedText.slice(opening.length, -closing.length).trim();
    }
  }

  return trimmedText;
}

function formatTurnText(text: string, role: 'narrator' | 'character') {
  const normalizedText = role === 'character' ? removeOuterQuotes(text) : text.trim();
  return role === 'character' ? `„${normalizedText}“` : normalizedText;
}

const proseParagraphs = computed<ProseParagraph[]>(() => props.tale.paragraphs.map((paragraph) => {
  const turns: ProseTurn[] = [];

  for (const segment of paragraph.segments) {
    const speaker = speakerFor(segment.speakerId);
    const segmentText = speaker.role === 'character'
      ? removeOuterQuotes(segment.text)
      : segment.text.trim();
    const previousTurn = turns.at(-1);

    if (previousTurn?.speakerId === segment.speakerId) {
      previousTurn.text = `${previousTurn.text} ${segmentText}`;
    }
    else {
      turns.push({ speakerId: segment.speakerId, text: segmentText });
    }
  }

  return turns.map(turn => ({
    ...turn,
    text: formatTurnText(turn.text, speakerFor(turn.speakerId).role),
  }));
}));
const json = computed(() => JSON.stringify(props.tale, null, 2));

function segmentKey(paragraphIndex: number, segmentIndex: number) {
  return `${paragraphIndex}-${segmentIndex}`;
}

function metadataId(paragraphIndex: number, segmentIndex: number) {
  return `segment-metadata-${segmentKey(paragraphIndex, segmentIndex)}`;
}

function speakerRoleLabel(speakerId: string) {
  return speakerFor(speakerId).role === 'narrator' ? 'Erzähler' : 'Figur';
}

function speakerLabel(speakerId: string, emotion: string) {
  const speaker = speakerFor(speakerId);
  return `${speaker.name}, ${speakerRoleLabel(speakerId)}, ${speaker.voice.description}, Stimmung: ${emotion}`;
}

function stableHue(value: string) {
  let hue = 0;

  for (const character of value) {
    hue = (
        hue * 31
        + (character.codePointAt(0) ?? 0)
    ) % 360;
  }

  return hue;
}

function speakerColor(speakerId: string) {
  const speaker = speakerFor(speakerId);
  if (speaker.role === 'narrator') {
    return narratorColor;
  }

  const characterIndex = props.tale.speakers
    .filter(candidate => candidate.role === 'character')
    .findIndex(candidate => candidate.id === speakerId);

  if (characterIndex >= 0 && characterIndex < characterColors.length) {
    return characterColors[characterIndex] ?? narratorColor;
  }

  // TODO: For the PoC, characters beyond the fixed color palette derive their
  // hue from the speaker ID. Different speaker IDs may therefore map to the same
  // hue. If tales with larger casts become relevant, replace this fallback with
  // collision-aware color assignment and add a test covering more than eight
  // characters.
  const hue = stableHue(speakerId) % 360;
  return `hsl(${hue} 48% 87%)`;
}

function speakerStyle(speakerId: string) {
  return {
    '--speaker-background': speakerColor(speakerId),
    '--speaker-foreground': '#342a23',
  };
}
</script>

<template>
  <section
    class="viewer"
    aria-labelledby="tale-title"
  >
    <div class="viewer-heading">
      <p class="eyebrow">
        Deine Geschichte
      </p>
      <h2 id="tale-title">
        {{ tale.title }}
      </h2>
    </div>

    <div
      class="mode-controls"
      aria-label="Ansicht auswählen"
    >
      <button
        v-for="viewMode in modes"
        :key="viewMode.value"
        type="button"
        :aria-pressed="mode === viewMode.value"
        :class="{ active: mode === viewMode.value }"
        @click="mode = viewMode.value"
      >
        {{ viewMode.label }}
      </button>
    </div>

    <article
      v-if="mode === 'prose'"
      class="prose"
      aria-label="Märchen als Prosa"
    >
      <div
        v-for="(paragraph, paragraphIndex) in proseParagraphs"
        :key="paragraphIndex"
        class="prose-paragraph"
      >
        <p
          v-for="(turn, turnIndex) in paragraph"
          :key="`${paragraphIndex}-${turnIndex}`"
        >
          {{ turn.text }}
        </p>
      </div>
    </article>

    <article
      v-else-if="mode === 'highlighted'"
      class="highlighted"
      aria-label="Märchen mit Sprecherinformationen"
    >
      <ul
        class="speaker-legend"
        aria-label="Sprecherfarben"
      >
        <li
          v-for="speaker in tale.speakers"
          :key="speaker.id"
          class="legend-item"
          :style="speakerStyle(speaker.id)"
        >
          <span
            class="legend-swatch"
            aria-hidden="true"
          />
          <span>{{ speaker.name }}</span>
          <small>{{ speakerRoleLabel(speaker.id) }}</small>
        </li>
      </ul>
      <p
        v-for="(paragraph, paragraphIndex) in tale.paragraphs"
        :key="paragraphIndex"
      >
        <!-- Intentionally focusable so keyboard users can access the hover metadata. -->
        <span
          v-for="(segment, segmentIndex) in paragraph.segments"
          :key="segmentKey(paragraphIndex, segmentIndex)"
          class="segment"
          :style="speakerStyle(segment.speakerId)"
          tabindex="0"
          :aria-label="`${segment.text} ${speakerLabel(segment.speakerId, segment.emotion)}`"
          :aria-describedby="activeSegment === segmentKey(paragraphIndex, segmentIndex) ? metadataId(paragraphIndex, segmentIndex) : undefined"
          @mouseenter="activeSegment = segmentKey(paragraphIndex, segmentIndex)"
          @mouseleave="activeSegment = null"
          @focus="activeSegment = segmentKey(paragraphIndex, segmentIndex)"
          @blur="activeSegment = null"
          @keydown.esc="activeSegment = null"
        >
          <strong>{{ speakerFor(segment.speakerId).name }}</strong>
          <span>{{ segment.text }}</span>
          <small>{{ segment.emotion }}</small>
          <span
            v-if="activeSegment === segmentKey(paragraphIndex, segmentIndex)"
            :id="metadataId(paragraphIndex, segmentIndex)"
            class="segment-metadata"
            role="tooltip"
          >
            <strong>{{ speakerFor(segment.speakerId).name }}</strong>
            <span>{{ speakerRoleLabel(segment.speakerId) }} · {{ speakerFor(segment.speakerId).voice.description }}</span>
            <span>Stimmung: {{ segment.emotion }}</span>
          </span>
        </span>
      </p>
    </article>

    <pre
      v-else
      class="json-view"
      aria-label="Strukturierte Tale-Daten"
    ><code>{{ json }}</code></pre>
  </section>
</template>

<style scoped>
.viewer { display: grid; gap: 1.5rem; padding: clamp(1.25rem, 4vw, 2.5rem); border: 1px solid #eadfce; border-radius: 1.25rem; background: #fffdf9; }
.viewer-heading { display: grid; gap: 0.45rem; }
.viewer-heading h2 { margin: 0; font-family: Georgia, serif; font-size: clamp(1.75rem, 4vw, 2.7rem); }
.eyebrow { margin: 0; color: #a35f39; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.mode-controls { display: flex; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid #eadfce; padding-bottom: 1rem; }
.mode-controls button { border: 1px solid #cfc0ad; border-radius: 999px; background: transparent; color: #503e30; cursor: pointer; font: inherit; padding: 0.55rem 0.9rem; }
.mode-controls button.active { border-color: #a35f39; background: #a35f39; color: #fff; }
.mode-controls button:focus-visible { outline: 3px solid #e3a64b; outline-offset: 3px; }
.prose { color: #342a23; font: 1.12rem/1.85 Georgia, serif; }
.prose-paragraph { margin: 0 0 1.35rem; }
.prose-paragraph:last-child { margin-bottom: 0; }
.prose p { margin: 0 0 0.8rem; }
.prose p:last-child { margin-bottom: 0; }
.highlighted { color: #342a23; font-size: 1.05rem; line-height: 1.8; }
.highlighted p { margin: 0 0 1.35rem; }
.highlighted p:last-child { margin-bottom: 0; }
.speaker-legend { display: flex; flex-wrap: wrap; gap: 0.55rem 0.8rem; margin: 0 0 0.4rem; padding: 0; list-style: none; }
.legend-item { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--speaker-foreground); font-size: 0.88rem; }
.legend-item small { color: #685b4e; font-size: 0.82em; }
.legend-swatch { width: 0.85rem; height: 0.85rem; border: 1px solid rgb(52 42 35 / 20%); border-radius: 50%; background: var(--speaker-background); }
.segment { position: relative; display: inline-flex; align-items: baseline; gap: 0.35rem; margin: 0.12rem 0.2rem 0.12rem 0; border-radius: 0.35rem; background: var(--speaker-background); color: var(--speaker-foreground); cursor: default; padding: 0.1rem 0.25rem; }
.segment strong { font-size: 0.78em; }
.segment small { color: #685b4e; font-size: 0.72em; font-style: italic; }
.segment:focus-visible { outline: 3px solid #e3a64b; outline-offset: 2px; }
.segment-metadata { position: absolute; z-index: 1; top: calc(100% + 0.45rem); left: 0; display: grid; gap: 0.1rem; min-width: min(18rem, 80vw); max-width: min(24rem, 80vw); border: 1px solid #cfc0ad; border-radius: 0.5rem; background: #fffdf9; box-shadow: 0 0.5rem 1.5rem rgb(71 49 25 / 18%); color: #342a23; font-size: 0.82rem; line-height: 1.4; padding: 0.65rem 0.75rem; white-space: normal; }
.segment-metadata strong { font-size: 1em; }
.json-view { max-height: 35rem; overflow: auto; margin: 0; border-radius: 0.65rem; background: #2d251f; color: #f8eee1; font: 0.86rem/1.6 ui-monospace, SFMono-Regular, Consolas, monospace; padding: 1rem; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
