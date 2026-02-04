/**
 * GPT-4.1-mini text generator (Strategy for this model variant).
 */

import { GPTTextBaseProvider } from '../gpt/gpt-text-base-provider';
import { OPENAI_MODELS, OPENAI_DEFAULTS } from '../../config';
import type OpenAI from 'openai';

export class GPT41MiniTextGenerator extends GPTTextBaseProvider {
  protected model = OPENAI_MODELS.GPT_41_MINI;
  protected defaultTemperature = OPENAI_DEFAULTS.temperature;
  protected defaultMaxTokens = OPENAI_DEFAULTS.maxTokens;

  constructor(client: OpenAI) {
    super(client);
  }
}
