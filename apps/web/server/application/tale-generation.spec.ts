import { describe, expect, it, vi } from 'vitest';
import { generateTale } from './tale-generation';

const request = {
  sourceTale: 'Rotkäppchen',
  twist: 'Der Wolf kann fliegen',
  language: 'de' as const,
};

const tale = {
  title: 'Rotkäppchen und der fliegende Wolf',
  speakers: [
    { id: 'narrator', name: 'Erzähler', role: 'narrator' as const, voice: { description: 'Ruhig' } },
  ],
  paragraphs: [
    { segments: [{ text: 'Es war einmal.', speakerId: 'narrator', emotion: 'neutral' }] },
  ],
};

describe('generateTale', () => {
  it('passes the request to the tale generator', async () => {
    const generate = vi.fn().mockResolvedValue(tale);

    await expect(generateTale(request, { generate })).resolves.toEqual(tale);
    expect(generate).toHaveBeenCalledWith(request);
  });

  it('wraps generator failures while preserving the original cause for logging', async () => {
    const providerError = new Error('private provider response and secret');
    const generator = { generate: vi.fn().mockRejectedValue(providerError) };

    await expect(generateTale(request, generator)).rejects.toMatchObject({
      name: 'TaleGenerationError',
      message: 'Tale generation failed.',
      cause: providerError,
    });
  });
});
