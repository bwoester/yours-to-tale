import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { GoogleGenAI } from '@google/genai';
import { TaleStructureSchema } from '#shared/domain/tale';
import { GeminiTaleGenerator } from './gemini-tale-generator';

describe('GeminiTaleGenerator', () => {
  const mockTale = {
    title: 'Rotkäppchen mit einem Twist',
    speakers: [
      { id: 'n1', name: 'Erzähler', role: 'narrator', voice: { description: 'Tiefe, ruhige Stimme' } },
      { id: 'c1', name: 'Rotkäppchen', role: 'character', voice: { description: 'Helle, junge Stimme' } },
    ],
    paragraphs: [
      {
        segments: [
          { text: 'Es war einmal...', speakerId: 'n1', emotion: 'neutral' },
          { text: 'Hallo Großmutter!', speakerId: 'c1', emotion: 'happy' },
        ],
      },
    ],
  };

  const createMockClient = (mockResponse: unknown) => {
    return {
      interactions: {
        create: vi.fn().mockResolvedValue(mockResponse),
      },
    } as unknown as GoogleGenAI;
  };

  it('configures Gemini interaction correctly (store: false, structured output)', async () => {
    const mockClient = createMockClient({
      status: 'completed',
      output_text: JSON.stringify(mockTale),
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Rotkäppchen', twist: 'Der Wolf ist vegetarisch', language: 'de' as const };

    await generator.generate(request);
    const calls = vi.mocked(mockClient.interactions.create).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const callArgs = calls[0]![0] as Record<string, unknown>;
    const responseFormat = callArgs.response_format as Record<string, unknown>;
    expect(callArgs.store).toBe(false);
    expect(responseFormat.type).toBe('text');
    expect(responseFormat.mime_type).toBe('application/json');
    expect(responseFormat.schema).toEqual(z.toJSONSchema(TaleStructureSchema));
  });

  it('explicitly requests a German tale and structural rules in system_instruction', async () => {
    const mockClient = createMockClient({
      status: 'completed',
      output_text: JSON.stringify(mockTale),
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Rotkäppchen', twist: 'Der Wolf ist vegetarisch', language: 'de' as const };

    await generator.generate(request);
    const calls = vi.mocked(mockClient.interactions.create).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const callArgs = calls[0]![0] as Record<string, unknown>;
    expect(callArgs.system_instruction as string).toContain('German');
    expect(callArgs.system_instruction as string).toContain('JSON');
    expect(callArgs.input as string).toContain('Rotkäppchen');
    expect(callArgs.input as string).toContain('Der Wolf ist vegetarisch');
  });

  it('validates and returns a valid tale', async () => {
    const mockClient = createMockClient({
      status: 'completed',
      output_text: JSON.stringify(mockTale),
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Rotkäppchen', twist: 'Twist', language: 'de' as const };

    const result = await generator.generate(request);
    expect(result).toEqual(mockTale);
  });

  it('fails when Gemini returns structurally valid JSON but violates semantic invariants', async () => {
    const invalidTale = {
      ...mockTale,
      speakers: [
        ...mockTale.speakers,
        { id: 'n2', name: 'Erzähler 2', role: 'narrator', voice: { description: 'V2' } }, // Multiple narrators
      ],
    };
    const mockClient = createMockClient({
      status: 'completed',
      output_text: JSON.stringify(invalidTale),
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Story', twist: 'Twist', language: 'de' as const };

    // Expect Zod error (TaleSchema.parse will fail)
    await expect(generator.generate(request)).rejects.toThrow();
  });

  it('handles failed status', async () => {
    const mockClient = createMockClient({
      status: 'failed',
      errors: [{ message: 'Quota exceeded' }],
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Story', twist: 'Twist', language: 'de' as const };

    await expect(generator.generate(request)).rejects.toThrow('Gemini interaction failed: Quota exceeded');
  });

  it('handles missing output_text', async () => {
    const mockClient = createMockClient({
      status: 'completed',
      output_text: null,
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Story', twist: 'Twist', language: 'de' as const };

    await expect(generator.generate(request)).rejects.toThrow('Gemini response did not contain text content.');
  });

  it('handles malformed JSON response', async () => {
    const mockClient = createMockClient({
      status: 'completed',
      output_text: 'not json',
    });
    const generator = new GeminiTaleGenerator({ client: mockClient, model: 'gemini-3.6-flash' });
    const request = { sourceTale: 'Story', twist: 'Twist', language: 'de' as const };

    await expect(generator.generate(request)).rejects.toThrow('Failed to parse Gemini response as JSON');
  });
});
