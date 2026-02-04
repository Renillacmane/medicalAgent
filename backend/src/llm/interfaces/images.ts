/**
 * Provider-agnostic image generation interface.
 * Implementations: DALL-E, etc.
 */

export interface ImageGenerationInput {
  prompt: string;
  /** Optional overrides per provider */
  options?: Record<string, unknown>;
}

export interface ImageGenerator {
  generate(input: ImageGenerationInput): Promise<string>;
}
