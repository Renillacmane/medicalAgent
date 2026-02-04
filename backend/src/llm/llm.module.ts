import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLM_TEXT_GENERATOR } from './interfaces/text';
import { createLLMService } from './llm-provider-factory';
import { SystemPromptBuilder } from './prompts/system-prompt.builder';
import { OPENAI_MODELS } from './providers/openai/config';

/**
 * LLM Module
 *
 * Provides LLM capabilities and agent utilities:
 * - LLM_TEXT_GENERATOR: TextGenerator for text generation
 * - SystemPromptBuilder: Builds system/user prompts for agent flows
 *
 * Provider and model are selected via config (LLM_PROVIDER, OPENAI_CHAT_MODEL).
 */
@Module({
  providers: [
    SystemPromptBuilder,
    {
      provide: LLM_TEXT_GENERATOR,
      useFactory: (config: ConfigService) => {
        const provider = (config.get<string>('LLM_PROVIDER') || 'openai') as 'openai' | 'gemini';
        const apiKey =
          provider === 'openai'
            ? config.get<string>('OPENAI_API_KEY') || ''
            : config.get<string>('GEMINI_API_KEY') || '';
        const openaiModelRaw = config.get<string>('OPENAI_CHAT_MODEL') || 'gpt-4o';
        const openaiModel =
          openaiModelRaw === OPENAI_MODELS.GPT_41_MINI ? 'gpt-4.1-mini' : 'gpt-4o';

        const llmService = createLLMService({
          provider,
          apiKey,
          openaiModel,
        });

        // Return the TextGenerator directly
        return llmService.text.generator;
      },
      inject: [ConfigService],
    },
  ],
  exports: [LLM_TEXT_GENERATOR, SystemPromptBuilder],
})
export class LlmModule {}
