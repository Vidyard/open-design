import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadBedrockConfig, bedrockImageModelIdFor } from '../src/bedrock.js';

describe('bedrock loadBedrockConfig', () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), 'od-bedrock-load-'));
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it('returns null when no app-config exists', async () => {
    expect(await loadBedrockConfig(dataDir)).toBeNull();
  });

  it('returns null when awsBedrock block missing', async () => {
    await writeFile(
      path.join(dataDir, 'app-config.json'),
      JSON.stringify({ onboardingCompleted: true }),
    );
    expect(await loadBedrockConfig(dataDir)).toBeNull();
  });

  it('returns null when region malformed', async () => {
    await writeFile(
      path.join(dataDir, 'app-config.json'),
      JSON.stringify({ awsBedrock: { region: 'mars-1' } }),
    );
    expect(await loadBedrockConfig(dataDir)).toBeNull();
  });

  it('returns region only when no profile set', async () => {
    await writeFile(
      path.join(dataDir, 'app-config.json'),
      JSON.stringify({ awsBedrock: { region: 'us-west-2' } }),
    );
    expect(await loadBedrockConfig(dataDir)).toEqual({ region: 'us-west-2' });
  });

  it('returns region + profile when both set', async () => {
    await writeFile(
      path.join(dataDir, 'app-config.json'),
      JSON.stringify({
        awsBedrock: { region: 'eu-west-1', profile: 'work' },
      }),
    );
    expect(await loadBedrockConfig(dataDir)).toEqual({
      region: 'eu-west-1',
      profile: 'work',
    });
  });
});

describe('bedrockImageModelIdFor', () => {
  it('maps friendly ids to Bedrock model ids', () => {
    expect(bedrockImageModelIdFor('bedrock-nova-canvas-v1')).toBe(
      'amazon.nova-canvas-v1:0',
    );
    expect(bedrockImageModelIdFor('bedrock-titan-image-v2')).toBe(
      'amazon.titan-image-generator-v2:0',
    );
  });

  it('returns null for unknown models', () => {
    expect(bedrockImageModelIdFor('made-up-model')).toBeNull();
    expect(bedrockImageModelIdFor('')).toBeNull();
  });
});

// SDK-mocked tests cover the actual invocation path. We mock the dynamic
// import so the real client doesn't try to resolve AWS credentials in CI.
describe('streamBedrockChat (SDK-mocked)', () => {
  const sentChunks: any[] = [];
  let lastCommandInput: any = null;

  beforeEach(() => {
    sentChunks.length = 0;
    lastCommandInput = null;

    vi.doMock('@aws-sdk/credential-providers', () => ({
      fromNodeProviderChain: () => async () => ({
        accessKeyId: 'AKIA',
        secretAccessKey: 'secret',
      }),
    }));

    vi.doMock('@aws-sdk/client-bedrock-runtime', () => ({
      BedrockRuntimeClient: class {
        async send(command: any) {
          lastCommandInput = command.__input;
          return {
            body: (async function* () {
              for (const chunk of sentChunks) yield chunk;
            })(),
          };
        }
      },
      InvokeModelWithResponseStreamCommand: class {
        __input: any;
        constructor(input: any) {
          this.__input = input;
        }
      },
      InvokeModelCommand: class {
        __input: any;
        constructor(input: any) {
          this.__input = input;
        }
      },
    }));
  });

  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('@aws-sdk/credential-providers');
    vi.doUnmock('@aws-sdk/client-bedrock-runtime');
  });

  it('encodes the request body with anthropic_version + system + messages', async () => {
    const { streamBedrockChat } = await import('../src/bedrock.js');

    sentChunks.push({
      chunk: {
        bytes: new TextEncoder().encode(
          JSON.stringify({
            type: 'content_block_delta',
            delta: { text: 'hello' },
          }),
        ),
      },
    });
    sentChunks.push({
      chunk: {
        bytes: new TextEncoder().encode(JSON.stringify({ type: 'message_stop' })),
      },
    });

    const events: any[] = [];
    for await (const ev of streamBedrockChat({
      cfg: { region: 'us-west-2' } as any,
      modelId: 'us.anthropic.claude-sonnet-4-5-20251022-v1:0',
      systemPrompt: 'You are a helper.',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 256,
    })) {
      events.push(ev);
    }

    expect(events).toEqual([
      { type: 'delta', text: 'hello' },
      { type: 'end' },
    ]);

    const decoded = JSON.parse(
      new TextDecoder().decode(lastCommandInput.body),
    );
    expect(decoded.anthropic_version).toBe('bedrock-2023-05-31');
    expect(decoded.max_tokens).toBe(256);
    expect(decoded.system).toBe('You are a helper.');
    expect(decoded.messages).toEqual([{ role: 'user', content: 'hi' }]);
    expect(lastCommandInput.modelId).toBe(
      'us.anthropic.claude-sonnet-4-5-20251022-v1:0',
    );
  });

  it('translates Bedrock error events to error yields', async () => {
    const { streamBedrockChat } = await import('../src/bedrock.js');

    sentChunks.push({
      chunk: {
        bytes: new TextEncoder().encode(
          JSON.stringify({
            type: 'error',
            error: { message: 'rate limited' },
          }),
        ),
      },
    });

    const events: any[] = [];
    for await (const ev of streamBedrockChat({
      cfg: { region: 'us-west-2' } as any,
      modelId: 'us.anthropic.claude-sonnet-4-5-20251022-v1:0',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 256,
    })) {
      events.push(ev);
    }

    expect(events).toEqual([{ type: 'error', message: 'rate limited' }]);
  });
});

describe('invokeBedrockImage (SDK-mocked)', () => {
  let lastInput: any = null;
  let mockResponseBody: Uint8Array | null = null;

  beforeEach(() => {
    lastInput = null;
    mockResponseBody = null;

    vi.doMock('@aws-sdk/credential-providers', () => ({
      fromNodeProviderChain: () => async () => ({
        accessKeyId: 'AKIA',
        secretAccessKey: 'secret',
      }),
    }));

    vi.doMock('@aws-sdk/client-bedrock-runtime', () => ({
      BedrockRuntimeClient: class {
        async send(command: any) {
          lastInput = command.__input;
          return { body: mockResponseBody };
        }
      },
      InvokeModelWithResponseStreamCommand: class {
        __input: any;
        constructor(input: any) {
          this.__input = input;
        }
      },
      InvokeModelCommand: class {
        __input: any;
        constructor(input: any) {
          this.__input = input;
        }
      },
    }));
  });

  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('@aws-sdk/credential-providers');
    vi.doUnmock('@aws-sdk/client-bedrock-runtime');
  });

  it('returns decoded PNG bytes for Nova Canvas response', async () => {
    const { invokeBedrockImage } = await import('../src/bedrock.js');

    const fakeBytes = Buffer.from('fake-png-bytes');
    mockResponseBody = new TextEncoder().encode(
      JSON.stringify({ images: [fakeBytes.toString('base64')] }),
    );

    const result = await invokeBedrockImage({
      cfg: { region: 'us-west-2' } as any,
      modelId: 'amazon.nova-canvas-v1:0',
      prompt: 'a red circle',
      aspect: '1:1',
    });

    expect(result.mime).toBe('image/png');
    expect(result.bytes.equals(fakeBytes)).toBe(true);
    const decoded = JSON.parse(new TextDecoder().decode(lastInput.body));
    expect(decoded.taskType).toBe('TEXT_IMAGE');
    expect(decoded.textToImageParams.text).toBe('a red circle');
    expect(decoded.imageGenerationConfig.width).toBe(1024);
    expect(decoded.imageGenerationConfig.height).toBe(1024);
    expect(lastInput.modelId).toBe('amazon.nova-canvas-v1:0');
  });

  it('uses 16:9 dimensions when requested', async () => {
    const { invokeBedrockImage } = await import('../src/bedrock.js');

    mockResponseBody = new TextEncoder().encode(
      JSON.stringify({ images: ['AAEC'] }),
    );

    await invokeBedrockImage({
      cfg: { region: 'us-west-2' } as any,
      modelId: 'amazon.titan-image-generator-v2:0',
      prompt: 'sky',
      aspect: '16:9',
    });

    const decoded = JSON.parse(new TextDecoder().decode(lastInput.body));
    expect(decoded.imageGenerationConfig.width).toBe(1280);
    expect(decoded.imageGenerationConfig.height).toBe(720);
  });

  it('throws when response has no images array', async () => {
    const { invokeBedrockImage } = await import('../src/bedrock.js');

    mockResponseBody = new TextEncoder().encode(
      JSON.stringify({ error: 'content blocked' }),
    );

    await expect(
      invokeBedrockImage({
        cfg: { region: 'us-west-2' } as any,
        modelId: 'amazon.nova-canvas-v1:0',
        prompt: 'x',
        aspect: '1:1',
      }),
    ).rejects.toThrow(/Bedrock image generation failed/);
  });
});
