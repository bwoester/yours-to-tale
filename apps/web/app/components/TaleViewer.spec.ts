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
  it('derives speaker turns with German dialogue formatting and preserves paragraphs', () => {
    const original = structuredClone(tale);
    const wrapper = mount(TaleViewer, { props: { tale } });
    const paragraphs = wrapper.findAll('.prose-paragraph');

    expect(wrapper.find('.prose').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe(tale.title);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]!.findAll('p')).toHaveLength(4);
    expect(paragraphs[0]!.findAll('p')[0]!.text()).toBe('Im Tal begann ein Abenteuer.');
    expect(paragraphs[0]!.findAll('p')[1]!.text()).toBe('„Hallo! Komm mit mir.“');
    expect(paragraphs[0]!.findAll('p')[2]!.text()).toBe('„Ich kenne den Weg.“');
    expect(paragraphs[0]!.findAll('p')[3]!.text()).toBe('Also gingen sie los.');
    expect(paragraphs[1]!.find('p').text()).toBe('„Schon gut. Und weiter.“');
    expect(JSON.stringify(tale)).toBe(JSON.stringify(original));
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
