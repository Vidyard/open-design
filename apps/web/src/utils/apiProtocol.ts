import type { ApiProtocol } from '../types';

const API_PROTOCOL_LABELS: Record<ApiProtocol, string> = {
  anthropic: 'Anthropic API',
  openai: 'OpenAI API',
  azure: 'Azure OpenAI',
  google: 'Google Gemini',
  bedrock: 'AWS Bedrock',
};

const API_PROTOCOL_AGENT_IDS: Record<ApiProtocol, string> = {
  anthropic: 'anthropic-api',
  openai: 'openai-api',
  azure: 'azure-openai-api',
  google: 'google-gemini-api',
  bedrock: 'aws-bedrock-api',
};

export function apiProtocolLabel(protocol: ApiProtocol | undefined): string {
  return API_PROTOCOL_LABELS[protocol ?? 'anthropic'];
}

export function apiProtocolModelLabel(
  protocol: ApiProtocol | undefined,
  model: string,
): string {
  const label = apiProtocolLabel(protocol);
  const trimmed = model.trim();
  return trimmed ? `${label} · ${trimmed}` : label;
}

export function apiProtocolAgentId(protocol: ApiProtocol | undefined): string {
  return API_PROTOCOL_AGENT_IDS[protocol ?? 'anthropic'];
}
