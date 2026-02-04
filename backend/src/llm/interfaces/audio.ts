/**
 * Provider-agnostic audio interface.
 * Implementations: OpenAI Whisper, etc.
 */

export interface AudioTranscriptionInput {
  /** File buffer or base64 content for audio to transcribe */
  content: Buffer | string;
  /** Optional MIME type (e.g. audio/mpeg) */
  mimeType?: string;
}

export interface AudioTranscriber {
  transcribe(input: AudioTranscriptionInput): Promise<string>;
}
