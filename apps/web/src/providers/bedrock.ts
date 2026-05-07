/**
 * AWS Bedrock chat provider. Routes through /api/proxy/bedrock/stream so
 * the daemon can sign requests with the AWS SDK default credential chain.
 * Browser never sees AWS credentials.
 *
 * Differences from openai-compatible.ts:
 *   - body carries `modelId` (not `model`/`baseUrl`/`apiKey`)
 *   - no apiKey gate — Bedrock auth is server-side only
 */
import type { AppConfig, ChatMessage } from '../types';
import type { StreamHandlers } from './anthropic';
import { effectiveMaxTokens } from '../state/maxTokens';
import { consumeProxySseStream } from './api-proxy';

export async function streamMessageBedrock(
  cfg: AppConfig,
  system: string,
  history: ChatMessage[],
  signal: AbortSignal,
  handlers: StreamHandlers,
): Promise<void> {
  // Prefer the user's saved Bedrock chat model when set; fall back to the
  // generic cfg.model field which carries whatever the API-protocol picker
  // last wrote.
  const modelId = cfg.awsBedrock?.chatModelId?.trim() || cfg.model;
  if (!modelId) {
    handlers.onError(
      new Error('Bedrock model id missing — pick one in Settings → AWS Bedrock.'),
    );
    return;
  }

  return consumeProxySseStream(
    '/api/proxy/bedrock/stream',
    {
      modelId,
      systemPrompt: system,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      maxTokens: effectiveMaxTokens(cfg),
    },
    signal,
    handlers,
  );
}
