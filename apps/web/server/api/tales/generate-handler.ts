import { TaleGenerationRequestSchema } from '#shared/domain/tale';
import { generateTale, TaleGenerationError } from '#server/application/tale-generation';
import type { TaleGenerator } from '#server/application/tale-generator';

type CreateError = (options: {
  status: number;
  statusText: string;
  message: string;
}) => Error;

export type TaleRuntimeConfig = {
  geminiApiKey?: string;
  geminiModel: string;
};

export type GenerateTaleHandlerDependencies<Event> = {
  readBody: (event: Event) => Promise<unknown>;
  getRuntimeConfig: (event: Event) => TaleRuntimeConfig;
  createError: CreateError;
  createGenerator: (apiKey: string, model: string) => TaleGenerator;
};

export function createGenerateTaleHandler<Event>(dependencies: GenerateTaleHandlerDependencies<Event>) {
  return async (event: Event) => {
    let body: unknown;

    try {
      body = await dependencies.readBody(event);
    }
    catch {
      throw dependencies.createError({
        status: 400,
        statusText: 'Bad Request',
        message: 'Invalid tale generation request.',
      });
    }

    const request = TaleGenerationRequestSchema.safeParse(body);
    if (!request.success) {
      throw dependencies.createError({
        status: 400,
        statusText: 'Bad Request',
        message: 'Invalid tale generation request.',
      });
    }

    const config = dependencies.getRuntimeConfig(event);
    if (!config.geminiApiKey) {
      console.error('Gemini API key is missing from server runtime configuration.');
      throw dependencies.createError({
        status: 500,
        statusText: 'Internal Server Error',
        message: 'Tale generation is not configured.',
      });
    }

    try {
      return await generateTale(
        request.data,
        dependencies.createGenerator(config.geminiApiKey, config.geminiModel),
      );
    }
    catch (error) {
      console.error('Tale generation failed.', error instanceof TaleGenerationError ? error.cause : error);
      throw dependencies.createError({
        status: 502,
        statusText: 'Bad Gateway',
        message: 'Tale generation failed.',
      });
    }
  };
}
