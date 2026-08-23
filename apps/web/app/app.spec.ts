// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PREDEFINED_TALES } from '#shared/constants/tales';
import App from './app.vue';

const tale = {
  title: 'Ein neues Märchen',
  speakers: [{ id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } }],
  paragraphs: [{ segments: [{ text: 'Es war einmal.', speakerId: 'narrator', emotion: 'neutral' }] }],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('application orchestration', () => {
  it('posts the form request and passes a successful tale to the viewer', async () => {
    let resolveFetch: (value: typeof tale) => void = () => undefined;
    const fetchTale = vi.fn().mockImplementation(() => new Promise<typeof tale>((resolve) => {
      resolveFetch = resolve;
    }));
    vi.stubGlobal('$fetch', fetchTale);
    const wrapper = mount(App, { global: { stubs: { NuxtRouteAnnouncer: true } } });

    await wrapper.find('#twist').setValue('Die Sterne fallen vom Himmel.');
    await wrapper.find('form').trigger('submit');
    expect(fetchTale).toHaveBeenCalledWith('/api/tales/generate', {
      method: 'POST',
      body: { sourceTale: PREDEFINED_TALES[0], twist: 'Die Sterne fallen vom Himmel.', language: 'de' },
    });
    expect(wrapper.text()).toContain('wird gerade geschrieben');

    resolveFetch(tale);
    await flushPromises();
    expect(wrapper.findComponent({ name: 'TaleViewer' }).exists()).toBe(true);
    expect(wrapper.text()).toContain(tale.title);
  });

  it('shows a safe client-owned message when generation fails', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('provider secret')));
    const wrapper = mount(App, { global: { stubs: { NuxtRouteAnnouncer: true } } });

    await wrapper.find('#twist').setValue('Eine unerwartete Wendung.');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toBe('Die Geschichte konnte gerade nicht erstellt werden. Bitte versuche es erneut.');
    expect(wrapper.text()).not.toContain('provider secret');
  });

  it('sends only one request when submitted twice before the first resolves', async () => {
    let resolveFetch: (value: typeof tale) => void = () => undefined;
    const fetchTale = vi.fn().mockImplementation(() => new Promise<typeof tale>((resolve) => {
      resolveFetch = resolve;
    }));
    vi.stubGlobal('$fetch', fetchTale);
    const wrapper = mount(App, { global: { stubs: { NuxtRouteAnnouncer: true } } });

    await wrapper.find('#twist').setValue('Die Sterne fallen vom Himmel.');
    await wrapper.find('form').trigger('submit');
    await wrapper.find('form').trigger('submit');

    expect(fetchTale).toHaveBeenCalledTimes(1);
    resolveFetch(tale);
    await flushPromises();
  });
});
