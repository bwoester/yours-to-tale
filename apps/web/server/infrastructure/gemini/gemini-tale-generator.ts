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
      Erstelle ein umschriebenes Märchen basierend auf einer Quelle und einer Wendung.
      Die Ausgabe MUSS in Deutsch erfolgen.
      Halte dich exakt an die geforderte strukturierte JSON-Ausgabe.
      Gib Sprecher, Absätze und Segmente gemäß dem Domänenmodell an.
      Verwende Sprecherreferenzen konsistent.
      Gib genau einen Erzähler an.
    `.trim();

    const input = `Quelle: "${request.sourceTale}"\nWendung: "${request.twist}"`;

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
