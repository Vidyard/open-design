// @ts-nocheck
// AWS Bedrock BYOK adapter — used by chat proxy, agent runtime, and media
// generation. The AWS SDK is lazy-imported so daemon cold-start pays no
// cost when Bedrock is unused. Credentials always come from
// fromNodeProviderChain (env, shared config, IAM role, SSO); the UI never
// captures access keys.
//
// Public surface:
//   loadBedrockConfig(dataDir)         → BedrockResolvedConfig | null
//   getBedrockRuntimeClient(cfg)       → @aws-sdk/client-bedrock-runtime client
//   streamBedrockChat({...})           → AsyncIterable of {type, text}
//   invokeBedrockImage({...})          → { bytes, mime }
//   testBedrockConnection(cfg)         → { ok, modelCount?, error? }

import { readAppConfig } from './app-config.js';

const REGION_RE = /^[a-z]{2}-[a-z-]+-\d$/;

let runtimeModulePromise = null;
let controlModulePromise = null;
let credentialsModulePromise = null;

async function loadRuntimeModule() {
  if (!runtimeModulePromise) {
    runtimeModulePromise = import('@aws-sdk/client-bedrock-runtime');
  }
  return runtimeModulePromise;
}

async function loadControlModule() {
  if (!controlModulePromise) {
    controlModulePromise = import('@aws-sdk/client-bedrock');
  }
  return controlModulePromise;
}

async function loadCredentialsModule() {
  if (!credentialsModulePromise) {
    credentialsModulePromise = import('@aws-sdk/credential-providers');
  }
  return credentialsModulePromise;
}

export async function loadBedrockConfig(dataDir) {
  const cfg = await readAppConfig(dataDir);
  const aws = cfg?.awsBedrock;
  if (!aws || typeof aws !== 'object') return null;
  const region = typeof aws.region === 'string' ? aws.region.trim() : '';
  if (!region || !REGION_RE.test(region)) return null;
  const profile =
    typeof aws.profile === 'string' && aws.profile.trim()
      ? aws.profile.trim()
      : undefined;
  return { region, ...(profile ? { profile } : {}) };
}

export async function getBedrockRuntimeClient(cfg) {
  const [{ BedrockRuntimeClient }, { fromNodeProviderChain }] =
    await Promise.all([loadRuntimeModule(), loadCredentialsModule()]);
  const credentials = fromNodeProviderChain(
    cfg.profile ? { profile: cfg.profile } : {},
  );
  return new BedrockRuntimeClient({ region: cfg.region, credentials });
}

async function getBedrockControlClient(cfg) {
  const [{ BedrockClient }, { fromNodeProviderChain }] = await Promise.all([
    loadControlModule(),
    loadCredentialsModule(),
  ]);
  const credentials = fromNodeProviderChain(
    cfg.profile ? { profile: cfg.profile } : {},
  );
  return new BedrockClient({ region: cfg.region, credentials });
}

// Anthropic-on-Bedrock streaming. Bedrock yields { chunk: { bytes } } where
// bytes decodes to objects matching Anthropic's native SSE events
// (message_start / content_block_delta / message_stop). We translate to
// the same {type, text} shape consumers of streamProxyEndpoint already
// understand.
export async function* streamBedrockChat(args) {
  const {
    cfg,
    modelId,
    systemPrompt,
    messages,
    maxTokens,
    signal,
  } = args;
  const { InvokeModelWithResponseStreamCommand } = await loadRuntimeModule();
  const client = await getBedrockRuntimeClient(cfg);

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: typeof maxTokens === 'number' && maxTokens > 0 ? maxTokens : 8192,
    messages: Array.isArray(messages) ? messages : [],
  };
  if (typeof systemPrompt === 'string' && systemPrompt) {
    body.system = systemPrompt;
  }

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  });

  let response;
  try {
    response = await client.send(command, signal ? { abortSignal: signal } : undefined);
  } catch (err) {
    yield { type: 'error', message: err?.message || 'Bedrock invocation failed' };
    return;
  }

  const stream = response?.body;
  if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
    yield { type: 'error', message: 'Bedrock returned no stream body' };
    return;
  }

  const decoder = new TextDecoder();
  try {
    for await (const event of stream) {
      const bytes = event?.chunk?.bytes;
      if (!bytes) continue;
      let parsed;
      try {
        parsed = JSON.parse(decoder.decode(bytes));
      } catch {
        continue;
      }
      const eventType = parsed?.type;
      if (eventType === 'content_block_delta' && typeof parsed?.delta?.text === 'string') {
        yield { type: 'delta', text: parsed.delta.text };
      } else if (eventType === 'message_stop') {
        yield { type: 'end' };
        return;
      } else if (eventType === 'error') {
        const message =
          parsed?.error?.message || parsed?.message || 'Bedrock stream error';
        yield { type: 'error', message };
        return;
      }
    }
    yield { type: 'end' };
  } catch (err) {
    yield { type: 'error', message: err?.message || 'Bedrock stream interrupted' };
  }
}

const ASPECT_DIMENSIONS = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3': { width: 1024, height: 768 },
  '3:4': { width: 768, height: 1024 },
};

function dimensionsFor(aspect) {
  return ASPECT_DIMENSIONS[aspect] || ASPECT_DIMENSIONS['1:1'];
}

export async function invokeBedrockImage(args) {
  const { cfg, modelId, prompt, aspect } = args;
  const { InvokeModelCommand } = await loadRuntimeModule();
  const client = await getBedrockRuntimeClient(cfg);
  const { width, height } = dimensionsFor(aspect);

  // Both Nova Canvas and Titan G1 v2 share the TEXT_IMAGE shape today.
  // Body is identical; only the modelId differs. Keep this branch in case
  // future Bedrock image families want a per-model body.
  const body = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: { text: prompt },
    imageGenerationConfig: {
      numberOfImages: 1,
      width,
      height,
      cfgScale: 8.0,
    },
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  });

  const response = await client.send(command);
  const decoded = new TextDecoder().decode(response.body);
  let parsed;
  try {
    parsed = JSON.parse(decoded);
  } catch (err) {
    throw new Error(`Bedrock image response was not JSON: ${err?.message || err}`);
  }

  const b64 = Array.isArray(parsed?.images) ? parsed.images[0] : null;
  if (typeof b64 !== 'string' || !b64) {
    const errMsg = parsed?.error || parsed?.message || 'no image bytes returned';
    throw new Error(`Bedrock image generation failed: ${errMsg}`);
  }

  return { bytes: Buffer.from(b64, 'base64'), mime: 'image/png' };
}

export async function testBedrockConnection(cfg) {
  try {
    const { ListFoundationModelsCommand } = await loadControlModule();
    const client = await getBedrockControlClient(cfg);
    const result = await client.send(new ListFoundationModelsCommand({}));
    const modelCount = Array.isArray(result?.modelSummaries)
      ? result.modelSummaries.length
      : 0;
    return { ok: true, modelCount };
  } catch (err) {
    return { ok: false, error: err?.message || 'Bedrock connection failed' };
  }
}

// Map a friendly id (the one we expose in MEDIA models registries) to the
// fully qualified Bedrock model id. Keeping this mapping inside the daemon
// adapter (not in the registry) lets us version it without touching the
// shared web/daemon ID list.
export function bedrockImageModelIdFor(friendlyId) {
  switch (friendlyId) {
    case 'bedrock-nova-canvas-v1':
      return 'amazon.nova-canvas-v1:0';
    case 'bedrock-titan-image-v2':
      return 'amazon.titan-image-generator-v2:0';
    default:
      return null;
  }
}
