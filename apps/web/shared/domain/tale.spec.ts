import { describe, it, expect } from 'vitest';
import { TaleSchema, TaleStructureSchema, TaleGenerationRequestSchema, deriveProse } from './tale';
import { z } from 'zod';

describe('Tale Domain', () => {
  const validSpeaker = {
    id: 'narrator',
    name: 'Narrator',
    role: 'narrator' as const,
    voice: { description: 'Calm voice' },
  };

  const validCharacter = {
    id: 'cinderella',
    name: 'Cinderella',
    role: 'character' as const,
    voice: { description: 'Kind voice' },
  };

  const validTale = {
    title: 'Cinderella in Space',
    speakers: [validSpeaker, validCharacter],
    paragraphs: [
      {
        segments: [
          { text: 'Once upon a time', speakerId: 'narrator', emotion: 'neutral' },
          { text: 'I want to go to the stars!', speakerId: 'cinderella', emotion: 'excited' },
        ],
      },
    ],
  };

  describe('TaleSchema Validation', () => {
    it('should validate a correct tale', () => {
      const result = TaleSchema.safeParse(validTale);
      expect(result.success).toBe(true);
    });

    it('should fail if speaker IDs are not unique', () => {
      const invalidTale = {
        ...validTale,
        speakers: [validSpeaker, { ...validSpeaker, name: 'Duplicate' }],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Speaker IDs must be unique',
            }),
          ]),
        );
      }
    });

    it('should fail if there is no narrator', () => {
      const invalidTale = {
        ...validTale,
        speakers: [validCharacter],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('Tale must have exactly one narrator'),
            }),
          ]),
        );
      }
    });

    it('should fail if there are multiple narrators', () => {
      const invalidTale = {
        ...validTale,
        speakers: [validSpeaker, { ...validSpeaker, id: 'narrator2' }],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('Tale must have exactly one narrator'),
            }),
          ]),
        );
      }
    });

    it('should fail if a segment references an unknown speaker', () => {
      const invalidTale = {
        ...validTale,
        paragraphs: [
          {
            segments: [
              { text: 'Hello', speakerId: 'unknown', emotion: 'neutral' },
            ],
          },
        ],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('Speaker ID \'unknown\' not found'),
            }),
          ]),
        );
      }
    });

    it('should fail if strings are empty or only whitespace', () => {
      const invalidTale = {
        ...validTale,
        title: '   ',
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
    });

    it('should fail if paragraphs are empty', () => {
      const invalidTale = {
        ...validTale,
        paragraphs: [],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
    });

    it('should fail if segments are empty', () => {
      const invalidTale = {
        ...validTale,
        paragraphs: [{ segments: [] }],
      };
      const result = TaleSchema.safeParse(invalidTale);
      expect(result.success).toBe(false);
    });
  });

  describe('Prose Derivation', () => {
    it('should correctly derive prose from segments and paragraphs', () => {
      const tale = TaleSchema.parse({
        title: 'Test',
        speakers: [validSpeaker],
        paragraphs: [
          {
            segments: [
              { text: 'Part 1.', speakerId: 'narrator', emotion: 'neutral' },
              { text: 'Part 2.', speakerId: 'narrator', emotion: 'neutral' },
            ],
          },
          {
            segments: [
              { text: 'Part 3.', speakerId: 'narrator', emotion: 'neutral' },
            ],
          },
        ],
      });
      expect(deriveProse(tale))
        .toBe('Part 1. Part 2.\n\nPart 3.');
    });
  });

  describe('JSON Schema Generation', () => {
    it('should generate a valid JSON Schema from TaleStructureSchema', () => {
      const jsonSchema = z.toJSONSchema(TaleStructureSchema);

      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toBeDefined();
    });
  });

  describe('TaleGenerationRequestSchema Validation', () => {
    const validRequest = {
      sourceTale: 'Cinderella',
      twist: 'in space',
      language: 'de',
    };

    it('accepts a valid request', () => {
      const result = TaleGenerationRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('trims sourceTale', () => {
      const result = TaleGenerationRequestSchema.parse({
        ...validRequest,
        sourceTale: '  Cinderella  ',
      });
      expect(result.sourceTale).toBe('Cinderella');
    });

    it('trims twist', () => {
      const result = TaleGenerationRequestSchema.parse({
        ...validRequest,
        twist: '  in space  ',
      });
      expect(result.twist).toBe('in space');
    });

    it('rejects an empty sourceTale', () => {
      const result = TaleGenerationRequestSchema.safeParse({
        ...validRequest,
        sourceTale: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only sourceTale', () => {
      const result = TaleGenerationRequestSchema.safeParse({
        ...validRequest,
        sourceTale: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty twist', () => {
      const result = TaleGenerationRequestSchema.safeParse({
        ...validRequest,
        twist: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a whitespace-only twist', () => {
      const result = TaleGenerationRequestSchema.safeParse({
        ...validRequest,
        twist: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a language other than "de"', () => {
      const result = TaleGenerationRequestSchema.safeParse({
        ...validRequest,
        language: 'en',
      });
      expect(result.success).toBe(false);
    });
  });
});
