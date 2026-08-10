import type { Tale, TaleGenerationRequest } from '#shared/domain/tale';

export interface TaleGenerator {
  /**
   * Generates a structured tale based on a source title and a twist.
   * Implementation should guarantee that the output matches TaleSchema.
   */
  generate(request: TaleGenerationRequest): Promise<Tale>;
}
