/**
 * OpenAI Whisper transcription (stub).
 * Implements AudioTranscriber; wire to OpenAI audio API when needed.
 */

import type { AudioTranscriber, AudioTranscriptionInput } from '../../../../interfaces/audio';
import type OpenAI from 'openai';

export class WhisperTranscriber implements AudioTranscriber {
  constructor(private readonly client: OpenAI) {}

  async transcribe(_input: AudioTranscriptionInput): Promise<string> {
    void _input;
    // TODO: call client.audio.transcriptions.create when needed
    return Promise.reject(new Error('Whisper transcription not yet implemented'));
  }
}
