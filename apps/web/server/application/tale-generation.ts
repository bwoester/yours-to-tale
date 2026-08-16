import type { Tale, TaleGenerationRequest } from '#shared/domain/tale';
import type { TaleGenerator } from '#server/application/tale-generator';

export class TaleGenerationError extends Error {
  constructor(cause: unknown) {
    super('Tale generation failed.', { cause });
    this.name = 'TaleGenerationError';
  }
}

export async function generateTale(
  request: TaleGenerationRequest,
  generator: TaleGenerator,
): Promise<Tale> {
  try {
    return await generator.generate(request);
  }
  catch (error) {
    throw new TaleGenerationError(error);
  }
}
