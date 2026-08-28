import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { TaleSchema, TaleStructureSchema } from '#shared/domain/tale';
import type { Tale, TaleGenerationRequest } from '#shared/domain/tale';
import type { TaleGenerator } from '#server/application/tale-generator';

export class GeminiTaleGenerator implements TaleGenerator {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor(config: { apiKey: string; model: string } | { client: GoogleGenAI; model: string }) {
    if ('client' in config) {
      this.client = config.client;
    }
    else {
      this.client = new GoogleGenAI({ apiKey: config.apiKey });
    }
    this.model = config.model;
  }

  async generate(request: TaleGenerationRequest): Promise<Tale> {
    const jsonSchema = z.toJSONSchema(TaleStructureSchema);

    const systemInstruction = `
      You are generating an alternative version of a well-known fairy tale based on a source tale and a user-provided
      twist.
      
      The final story MUST be written in German.
      
      ## Faithfulness to the source tale
      
      The generated story must remain clearly recognizable as an alternative version of the source fairy tale.
      
      Preserve the source tale's central characters, setting, relationships, important objects, major plot beats, and
      iconic scenes unless changing them is necessary to implement the requested twist.
      
      Do not merely use the source tale as loose inspiration and do not replace it with an unrelated story involving
      similar characters.
      
      Treat the user's twist as a deliberate divergence from the source tale. Change what naturally follows from that
      divergence while preserving unaffected parts of the original story whenever possible.
      
      When the twist affects an iconic scene or important plot point, reinterpret that scene instead of simply removing
      it.
      
      ## Narrative quality and depth
      
      Write a complete narrated fairy tale, not a synopsis, outline, summary, or condensed retelling.
      
      Fully develop important scenes through narration, actions, dialogue, descriptions, and character reactions. Do
      not rush through major events in only one or two sentences.
      
      The story should have enough narrative depth to feel like a complete fairy tale suitable for being read aloud.
      Aim for approximately 8–12 substantial scenes.
      
      Use a timeless, traditional fairy-tale narrative voice. Keep the prose clear, vivid, atmospheric, and natural
      when read aloud.
      
      Prefer concrete actions, events, dialogue, and evocative descriptions over lengthy explanations of characters'
      emotions or motivations.
      
      Avoid a modern self-help tone, meta commentary, excessive moralizing, and explicit explanations of the story's
      lesson.
      
      Do not modernize the setting, characters, vocabulary, technology, or social context unless the requested twist
      specifically requires it.
      
      ## Twist integration
      
      The twist must have meaningful consequences for the story.
      
      Do not simply mention the twist once and then continue with an otherwise unchanged story. Let its consequences
      develop naturally across later scenes, character decisions, conflicts, and the ending.
      
      At the same time, do not use the twist as justification to discard the recognizable structure and identity of the
      source tale.
      
      ## Structured output
      
      Follow the required structured JSON output schema exactly.
      
      Represent speakers, paragraphs, and segments according to the provided domain model.
      
      Use speaker references consistently throughout the entire story.
      
      Provide exactly one narrator.
      
      Do not include any text, explanation, Markdown, or commentary outside the required JSON output.
    `.trim();

    const input = `Quelle: "${request.sourceTale}"\nWendung: "${request.twist}"`;

    // TODO: Before exposing tale generation to external users, implement the
    // production child-safety pipeline: define the supported age range and content
    // policy, configure Gemini safety thresholds explicitly, validate user input,
    // moderate generated output before storage, display, or TTS, provide safe
    // fallbacks and abuse controls, and add adversarial safety tests.
    // The system prompt alone must not be treated as a security boundary.
    const interaction = await this.client.interactions.create({
      model: this.model,
      system_instruction: systemInstruction,
      store: false,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: jsonSchema,
      },
      input,
    });

    if (interaction.status === 'failed') {
      const errorMsg = interaction.errors?.[0]?.message || 'Unknown Gemini error';
      throw new Error(`Gemini interaction failed: ${errorMsg}`);
    }

    if (!interaction.output_text) {
      throw new Error('Gemini response did not contain text content.');
    }

    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(interaction.output_text);
    }
    catch (e) {
      throw new Error(`Failed to parse Gemini response as JSON: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
    }

    // Full domain validation after structural guarantee
    return TaleSchema.parse(parsedResponse);
  }
}
