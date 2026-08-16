import { describe, expect, it } from 'vitest';
import { PREDEFINED_TALES } from './tales';

describe('PREDEFINED_TALES', () => {
  it('exports a stable list of classic German fairy-tale titles', () => {
    expect(PREDEFINED_TALES).toEqual([
      'Rotkäppchen',
      'Hänsel und Gretel',
      'Aschenputtel',
      'Schneewittchen',
      'Dornröschen',
    ]);
    expect(PREDEFINED_TALES).toHaveLength(5);
  });
});
