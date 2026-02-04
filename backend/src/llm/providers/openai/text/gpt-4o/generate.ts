/**
 * GPT-4o text generator (Strategy for this model variant).
 */

import { GPTTextBaseProvider } from '../gpt/gpt-text-base-provider';
import { OPENAI_MODELS, OPENAI_DEFAULTS } from '../../config';
import type OpenAI from 'openai';

export class GPT4oTextGenerator extends GPTTextBaseProvider {
  protected model = OPENAI_MODELS.GPT_4O;
  protected defaultTemperature = OPENAI_DEFAULTS.temperature;
  protected defaultMaxTokens = OPENAI_DEFAULTS.maxTokens;

  constructor(client: OpenAI) {
    super(client);
  }
}
