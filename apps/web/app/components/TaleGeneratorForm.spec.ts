// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PREDEFINED_TALES } from '#shared/constants/tales';
import TaleGeneratorForm from './TaleGeneratorForm.vue';

describe('TaleGeneratorForm', () => {
  it('presents every predefined tale', () => {
    const wrapper = mount(TaleGeneratorForm, { props: { loading: false } });

    expect(wrapper.find('#source-tale').findAll('option').map(option => option.text())).toEqual([
      ...PREDEFINED_TALES,
      'Eigenen Titel eingeben',
    ]);
  });

  it('emits a German request for a predefined tale', async () => {
    const wrapper = mount(TaleGeneratorForm, { props: { loading: false } });

    await wrapper.find('#source-tale').setValue(PREDEFINED_TALES[1]);
    await wrapper.find('#twist').setValue('Der Wald kann sprechen.');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('generate')).toEqual([[
      {
        sourceTale: PREDEFINED_TALES[1],
        twist: 'Der Wald kann sprechen.',
        language: 'de',
      },
    ]]);
  });

  it('uses a custom title when that option is selected', async () => {
    const wrapper = mount(TaleGeneratorForm, { props: { loading: false } });

    await wrapper.find('#source-tale').setValue('__custom__');
    await wrapper.find('#custom-title').setValue('Die Uhr im Wolkenschloss');
    await wrapper.find('#twist').setValue('Die Zeit läuft rückwärts.');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('generate')?.[0]?.[0]).toEqual({
      sourceTale: 'Die Uhr im Wolkenschloss',
      twist: 'Die Zeit läuft rückwärts.',
      language: 'de',
    });
  });

  it('does not emit when a required value is blank', async () => {
    const wrapper = mount(TaleGeneratorForm, { props: { loading: false } });

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('generate')).toBeUndefined();
    expect(wrapper.find('[role="alert"]').text()).toContain('Pflichtfelder');
  });

  it('prevents duplicate submissions while loading', async () => {
    const wrapper = mount(TaleGeneratorForm, { props: { loading: true } });

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('generate')).toBeUndefined();
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
