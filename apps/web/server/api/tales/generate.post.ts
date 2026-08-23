import { createGenerateTaleHandler } from './generate-handler';
import { GeminiTaleGenerator } from '#server/infrastructure/gemini/gemini-tale-generator';

export default defineEventHandler(createGenerateTaleHandler({
  readBody,
  getRuntimeConfig: event => useRuntimeConfig(event),
  createError,
  createGenerator: (apiKey, model) => new GeminiTaleGenerator({ apiKey, model }),
}));
