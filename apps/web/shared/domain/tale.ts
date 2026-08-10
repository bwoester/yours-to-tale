import { z } from 'zod';

export const SpeakerSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  role: z.enum(['narrator', 'character']),
  voice: z.object({
    description: z.string().trim().min(1)
  })
});

export const TaleSegmentSchema = z.object({
  text: z.string().trim().min(1),
  speakerId: z.string().trim().min(1),
  emotion: z.string().trim().min(1) // e.g., "excited", "happy", "neutral"
});

export const TaleParagraphSchema = z.object({
  segments: z.array(TaleSegmentSchema).min(1)
});

export const TaleStructureSchema = z.object({
  title: z.string().trim().min(1),
  speakers: z.array(SpeakerSchema).min(1),
  paragraphs: z.array(TaleParagraphSchema).min(1)
});

export const TaleSchema = TaleStructureSchema.check((data) => {
  const { value, issues } = data;
  const speakers = value.speakers;
  const speakerIds = new Set(speakers.map(s => s.id));
  
  // Unique Speaker IDs
  if (speakerIds.size !== speakers.length) {
    issues.push({
      code: 'custom',
      message: 'Speaker IDs must be unique',
      path: ['speakers'],
      input: speakers
    });
  }

  // Exactly one narrator
  const narratorCount = speakers.filter(s => s.role === 'narrator').length;
  if (narratorCount !== 1) {
    issues.push({
      code: 'custom',
      message: `Tale must have exactly one narrator (found ${narratorCount})`,
      path: ['speakers'],
      input: speakers
    });
  }

  // Referential Integrity
  value.paragraphs.forEach((paragraph, pIdx) => {
    paragraph.segments.forEach((segment, sIdx) => {
      if (!speakerIds.has(segment.speakerId)) {
        issues.push({
          code: 'custom',
          message: `Speaker ID '${segment.speakerId}' not found in speakers list`,
          path: ['paragraphs', pIdx, 'segments', sIdx, 'speakerId'],
          input: segment.speakerId
        });
      }
    });
  });
});

export const TaleGenerationRequestSchema = z.object({
  sourceTale: z.string().trim().min(1),
  twist: z.string().trim().min(1),
  language: z.literal('de')
});

export type Tale = z.infer<typeof TaleSchema>;
export type TaleStructure = z.infer<typeof TaleStructureSchema>;
export type Speaker = z.infer<typeof SpeakerSchema>;
export type TaleGenerationRequest = z.infer<typeof TaleGenerationRequestSchema>;

/**
 * Derives the readable prose from the structured tale.
 * Paragraphs are separated by double newlines, segments are joined by a space.
 */
export function deriveProse(tale: Tale): string {
  return tale.paragraphs
      .map(paragraph =>
          paragraph.segments
              .map(segment => segment.text)
              .join(' ')
      )
      .join('\n\n')
}
