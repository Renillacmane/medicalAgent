/**
 * Provider-agnostic LLM service shape.
 * Each vendor (OpenAI, Gemini) exposes an instance conforming to this interface.
 * App code depends only on LLMService and the interfaces.
 */

import type { TextGenerator } from './interfaces/text';
import type { AudioTranscriber } from './interfaces/audio';
import type { ImageGenerator } from './interfaces/images';

export interface LLMService {
  text: {
    generator: TextGenerator;
  };
  audio?: {
    transcriber?: AudioTranscriber;
  };
  images?: {
    generator?: ImageGenerator;
  };
}
