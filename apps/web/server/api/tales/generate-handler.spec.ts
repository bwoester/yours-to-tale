import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGenerateTaleHandler } from './generate-handler';

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

const event = {} as Parameters<ReturnType<typeof createGenerateTaleHandler>>[0];

function createDependencies(overrides: Partial<Parameters<typeof createGenerateTaleHandler>[0]> = {}) {
  const generate = vi.fn().mockResolvedValue(tale);
  return {
    readBody: vi.fn().mockResolvedValue(request),
    getRuntimeConfig: vi.fn().mockReturnValue({
      geminiApiKey: 'private-key',
      geminiModel: 'gemini-3.6-flash',
    }),
    createError: vi.fn(({ status, statusText, message }) => Object.assign(new Error(message), { status, statusText })),
    createGenerator: vi.fn().mockReturnValue({ generate }),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createGenerateTaleHandler', () => {
  it('returns the generated tale and invokes the configured generator', async () => {
    const dependencies = createDependencies();
    const handler = createGenerateTaleHandler(dependencies);

    await expect(handler(event)).resolves.toEqual(tale);
    expect(dependencies.getRuntimeConfig).toHaveBeenCalledWith(event);
    expect(dependencies.createGenerator).toHaveBeenCalledWith('private-key', 'gemini-3.6-flash');
  });

  it('throws an HTTP error with status 400 for an unreadable request body', async () => {
    const dependencies = createDependencies({ readBody: vi.fn().mockRejectedValue(new Error('malformed JSON')) });

    await expect(createGenerateTaleHandler(dependencies)(event)).rejects.toMatchObject({
      status: 400,
      statusText: 'Bad Request',
      message: 'Invalid tale generation request.',
    });
  });

  it('throws an HTTP error with status 400 for schema-invalid request data before configuration or generator access', async () => {
    const dependencies = createDependencies({ readBody: vi.fn().mockResolvedValue({ ...request, language: 'en' }) });

    await expect(createGenerateTaleHandler(dependencies)(event)).rejects.toMatchObject({
      status: 400,
      statusText: 'Bad Request',
      message: 'Invalid tale generation request.',
    });
    expect(dependencies.getRuntimeConfig).not.toHaveBeenCalled();
    expect(dependencies.createGenerator).not.toHaveBeenCalled();
  });

  it('throws an HTTP error with status 500 without exposing missing configuration details', async () => {
    const dependencies = createDependencies({
      getRuntimeConfig: vi.fn().mockReturnValue({ geminiModel: 'gemini-3.6-flash' }),
    });
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(createGenerateTaleHandler(dependencies)(event)).rejects.toMatchObject({
      status: 500,
      statusText: 'Internal Server Error',
      message: 'Tale generation is not configured.',
    });
    expect(log).toHaveBeenCalledWith('Gemini API key is missing from server runtime configuration.');
    expect(dependencies.createGenerator).not.toHaveBeenCalled();
  });

  it('throws an HTTP error with status 502 and logs the original provider failure', async () => {
    const providerError = new Error('provider response contains private-key');
    const generate = vi.fn().mockRejectedValue(providerError);
    const dependencies = createDependencies({ createGenerator: vi.fn().mockReturnValue({ generate }) });
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = createGenerateTaleHandler(dependencies)(event);

    await expect(result).rejects.toMatchObject({
      status: 502,
      statusText: 'Bad Gateway',
      message: 'Tale generation failed.',
    });
    await expect(result).rejects.not.toMatchObject({ message: expect.stringContaining('private-key') });
    expect(log).toHaveBeenCalledWith('Tale generation failed.', providerError);
  });
});
