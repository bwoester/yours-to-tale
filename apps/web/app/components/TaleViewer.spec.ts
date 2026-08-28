// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaleViewer from './TaleViewer.vue';

const tale = {
  title: 'Ein Märchen mit zwei Wegen',
  speakers: [
    { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig und warm' } },
    { id: 'speaker-a', name: 'Mira', role: 'character' as const, voice: { description: 'Hell und neugierig' } },
    { id: 'speaker-b', name: 'Taro', role: 'character' as const, voice: { description: 'Tief und freundlich' } },
  ],
  paragraphs: [
    { segments: [
      { text: 'Im Tal begann ein Abenteuer.', speakerId: 'narrator', emotion: 'neugierig' },
      { text: 'Hallo!', speakerId: 'speaker-a', emotion: 'fröhlich' },
      { text: 'Komm mit mir.', speakerId: 'speaker-a', emotion: 'aufgeregt' },
      { text: 'Ich kenne den Weg.', speakerId: 'speaker-b', emotion: 'sicher' },
      { text: 'Also gingen sie los.', speakerId: 'narrator', emotion: 'entschlossen' },
    ] },
    { segments: [
      { text: '„Schon gut.“', speakerId: 'speaker-a', emotion: 'ruhig' },
      { text: 'Und weiter.', speakerId: 'speaker-a', emotion: 'entschlossen' },
    ] },
  ],
};

function modeButton(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find(button => button.text() === label)!;
}

describe('TaleViewer', () => {
  it('derives inline speaker turns with German dialogue formatting and 1-to-1 paragraph mapping', () => {
    const original = structuredClone(tale);
    const wrapper = mount(TaleViewer, { props: { tale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(wrapper.find('.prose').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe(tale.title);
    expect(paragraphs).toHaveLength(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.element.tagName).toBe('P');
    }

    const firstParagraphTurns = paragraphs[0]!.findAll('.prose-turn');
    expect(firstParagraphTurns).toHaveLength(4);
    for (const turn of firstParagraphTurns) {
      expect(turn.element.tagName).toBe('SPAN');
    }
    expect(firstParagraphTurns[0]!.text()).toBe('Im Tal begann ein Abenteuer.');
    expect(firstParagraphTurns[1]!.text()).toBe('„Hallo! Komm mit mir.“');
    expect(firstParagraphTurns[2]!.text()).toBe('„Ich kenne den Weg.“');
    expect(firstParagraphTurns[3]!.text()).toBe('Also gingen sie los.');
    expect(paragraphs[0]!.text()).toBe('Im Tal begann ein Abenteuer. „Hallo! Komm mit mir.“ „Ich kenne den Weg.“ Also gingen sie los.');

    const secondParagraphTurns = paragraphs[1]!.findAll('.prose-turn');
    expect(secondParagraphTurns).toHaveLength(1);
    expect(secondParagraphTurns[0]!.element.tagName).toBe('SPAN');
    expect(secondParagraphTurns[0]!.text()).toBe('„Schon gut. Und weiter.“');
    expect(paragraphs[1]!.text()).toBe('„Schon gut. Und weiter.“');

    expect(JSON.stringify(tale)).toBe(JSON.stringify(original));
  });

  it('formats character speech followed by narrator attribution with leading punctuation seamlessly', () => {
    const attributionTale = {
      title: 'Rotkäppchen Ausschnitt',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'mother', name: 'Mutter', role: 'character' as const, voice: { description: 'Sanft' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: 'Sieh einmal, Rotkäppchen', speakerId: 'mother', emotion: 'liebevoll' },
            { text: ', sagte die Mutter,', speakerId: 'narrator', emotion: 'neutral' },
            { text: 'hier hast du ein Stück Kuchen.', speakerId: 'mother', emotion: 'freundlich' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: attributionTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]!.element.tagName).toBe('P');
    for (const turn of paragraphs[0]!.findAll('.prose-turn')) {
      expect(turn.element.tagName).toBe('SPAN');
    }
    expect(paragraphs[0]!.text()).toBe('„Sieh einmal, Rotkäppchen“, sagte die Mutter, „hier hast du ein Stück Kuchen.“');
  });

  it('formats character speech followed by narration without leading punctuation with standard spacing', () => {
    const speechTale = {
      title: 'Begrüßung',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'mira', name: 'Mira', role: 'character' as const, voice: { description: 'Hell' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: 'Hallo!', speakerId: 'mira', emotion: 'fröhlich' },
            { text: 'Sie winkte fröhlich.', speakerId: 'narrator', emotion: 'erfreut' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: speechTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]!.element.tagName).toBe('P');
    for (const turn of paragraphs[0]!.findAll('.prose-turn')) {
      expect(turn.element.tagName).toBe('SPAN');
    }
    expect(paragraphs[0]!.text()).toBe('„Hallo!“ Sie winkte fröhlich.');
  });

  it('preserves distinct paragraphs without cross-paragraph merging or splitting', () => {
    const multiParagraphTale = {
      title: 'Zwei Absätze',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'wolf', name: 'Wolf', role: 'character' as const, voice: { description: 'Grollend' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: 'Wo willst du hin?', speakerId: 'wolf', emotion: 'drohend' },
          ],
        },
        {
          segments: [
            { text: ', fragte der Wolf laut.', speakerId: 'narrator', emotion: 'erzählend' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: multiParagraphTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(2);
    for (const paragraph of paragraphs) {
      expect(paragraph.element.tagName).toBe('P');
    }
    expect(paragraphs[0]!.text()).toBe('„Wo willst du hin?“');
    expect(paragraphs[1]!.text()).toBe(', fragte der Wolf laut.');
  });

  it('does not split a paragraph containing multiple distinct character speakers', () => {
    const multiCharacterParagraphTale = {
      title: 'Zwei Sprecher in einem Absatz',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'speaker-a', name: 'Mira', role: 'character' as const, voice: { description: 'Hell' } },
        { id: 'speaker-b', name: 'Taro', role: 'character' as const, voice: { description: 'Tief' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: 'Komm mit!', speakerId: 'speaker-a', emotion: 'eifrig' },
            { text: 'Ich bin bereit.', speakerId: 'speaker-b', emotion: 'entschlossen' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: multiCharacterParagraphTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]!.element.tagName).toBe('P');
    for (const turn of paragraphs[0]!.findAll('.prose-turn')) {
      expect(turn.element.tagName).toBe('SPAN');
    }
    expect(paragraphs[0]!.text()).toBe('„Komm mit!“ „Ich bin bereit.“');
  });

  it('handles existing correctly paired quotation marks idempotently without duplicating them', () => {
    const quotedTale = {
      title: 'Bereits zitierte Abschnitte',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'speaker-a', name: 'Mira', role: 'character' as const, voice: { description: 'Hell' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: '„Guten Tag!“', speakerId: 'speaker-a', emotion: 'freundlich' },
            { text: '"Schön hier."', speakerId: 'speaker-a', emotion: 'glücklich' },
            { text: '“Auf Wiedersehen!”', speakerId: 'speaker-a', emotion: 'heiter' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: quotedTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]!.element.tagName).toBe('P');
    for (const turn of paragraphs[0]!.findAll('.prose-turn')) {
      expect(turn.element.tagName).toBe('SPAN');
    }
    expect(paragraphs[0]!.text()).toBe('„Guten Tag! Schön hier. Auf Wiedersehen!“');
  });

  it('normalizes mixed, one-sided, and malformed outer quotation marks without duplicating quotes', () => {
    const malformedTale = {
      title: 'Gemischte Anführungszeichen',
      speakers: [
        { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
        { id: 'speaker-a', name: 'Mira', role: 'character' as const, voice: { description: 'Hell' } },
      ],
      paragraphs: [
        {
          segments: [
            { text: '„Guten Tag!"', speakerId: 'speaker-a', emotion: 'freundlich' },
          ],
        },
        {
          segments: [
            { text: '"Guten Tag!“', speakerId: 'speaker-a', emotion: 'freundlich' },
          ],
        },
        {
          segments: [
            { text: '„Guten Tag!', speakerId: 'speaker-a', emotion: 'freundlich' },
          ],
        },
        {
          segments: [
            { text: 'Guten Tag!“', speakerId: 'speaker-a', emotion: 'freundlich' },
          ],
        },
      ],
    };

    const wrapper = mount(TaleViewer, { props: { tale: malformedTale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(paragraphs).toHaveLength(4);
    for (const paragraph of paragraphs) {
      expect(paragraph.element.tagName).toBe('P');
      expect(paragraph.text()).toBe('„Guten Tag!“');
      const turns = paragraph.findAll('.prose-turn');
      expect(turns).toHaveLength(1);
      expect(turns[0]!.element.tagName).toBe('SPAN');
    }
  });

  it('assigns stable distinct colors and exposes a legend for every speaker', async () => {
    const wrapper = mount(TaleViewer, { props: { tale } });

    await modeButton(wrapper, 'Hervorgehoben').trigger('click');
    const legend = wrapper.findAll('.legend-item');
    const segments = wrapper.findAll('.segment');
    const narratorColor = legend[0]!.attributes('style');
    const firstCharacterColor = legend[1]!.attributes('style');
    const secondCharacterColor = legend[2]!.attributes('style');

    expect(legend[0]!.text()).toContain('Erzähler');
    expect(legend[1]!.text()).toContain('Mira');
    expect(legend[1]!.text()).toContain('Figur');
    expect(legend[2]!.text()).toContain('Taro');
    expect(legend[2]!.text()).toContain('Figur');
    expect(narratorColor).not.toBe(firstCharacterColor);
    expect(firstCharacterColor).not.toBe(secondCharacterColor);
    expect(segments[1]!.attributes('style')).toBe(segments[2]!.attributes('style'));
    expect(segments[1]!.attributes('style')).not.toBe(segments[3]!.attributes('style'));

    const stylesBeforeSwitch = segments.map(segment => segment.attributes('style'));
    await modeButton(wrapper, 'JSON').trigger('click');
    await modeButton(wrapper, 'Prose').trigger('click');
    await modeButton(wrapper, 'Hervorgehoben').trigger('click');
    expect(wrapper.findAll('.segment').map(segment => segment.attributes('style'))).toEqual(stylesBeforeSwitch);
  });

  it('shows complete speaker and emotion metadata on focus and hover', async () => {
    const wrapper = mount(TaleViewer, { props: { tale } });

    await modeButton(wrapper, 'Hervorgehoben').trigger('click');
    const segment = wrapper.find('.segment');

    expect(segment.attributes('tabindex')).toBe('0');
    expect(segment.attributes('title')).toBeUndefined();
    expect(segment.attributes('aria-label')).toContain('Im Tal begann ein Abenteuer.');
    expect(segment.attributes('aria-label')).toContain('Ruhig und warm');

    await segment.trigger('focus');
    expect(segment.attributes('aria-describedby')).toBe('segment-metadata-0-0');
    expect(wrapper.find('.segment-metadata').text()).toContain('Erzähler');
    expect(wrapper.find('.segment-metadata').text()).toContain('Ruhig und warm');
    expect(wrapper.find('.segment-metadata').text()).toContain('neugierig');

    await segment.trigger('blur');
    await segment.trigger('mouseenter');
    expect(wrapper.find('.segment-metadata').exists()).toBe(true);
  });

  it('switches between highlighted, JSON, and prose modes', async () => {
    const wrapper = mount(TaleViewer, { props: { tale } });

    await modeButton(wrapper, 'Hervorgehoben').trigger('click');
    expect(wrapper.find('.highlighted').exists()).toBe(true);
    await modeButton(wrapper, 'JSON').trigger('click');
    expect(wrapper.find('pre').text()).toBe(JSON.stringify(tale, null, 2));
    await modeButton(wrapper, 'Prose').trigger('click');
    expect(wrapper.find('.prose').exists()).toBe(true);
  });
});
