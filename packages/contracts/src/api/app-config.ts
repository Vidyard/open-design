export interface AgentModelPrefs {
  model?: string;
  reasoning?: string;
}

export type AgentCliEnvPrefs = Record<string, Record<string, string>>;

// AWS Bedrock BYOK config. Credentials come from the AWS SDK default
// credential chain (env vars, shared config, IAM role, SSO) — the UI only
// captures region and an optional profile name, never raw access keys.
//
// Per-area enablement is mostly implicit:
//   - chat:  cfg.apiProtocol === 'bedrock' picks Bedrock for the chat sidebar
//   - media: model id starts with 'bedrock-' picks Bedrock for image gen
// The agent runtime needs an explicit toggle because flipping it changes
// where Claude Code sends invoices.
export interface BedrockPrefs {
  region: string;
  profile?: string;
  useForAgent?: { claude?: boolean };
  chatModelId?: string;
}

export interface AppConfigPrefs {
  onboardingCompleted?: boolean;
  agentId?: string | null;
  agentModels?: Record<string, AgentModelPrefs>;
  agentCliEnv?: AgentCliEnvPrefs;
  skillId?: string | null;
  designSystemId?: string | null;
  disabledSkills?: string[];
  disabledDesignSystems?: string[];
  awsBedrock?: BedrockPrefs;
}

export interface AppConfigResponse {
  config: AppConfigPrefs;
}

export type UpdateAppConfigRequest = Partial<AppConfigPrefs>;
