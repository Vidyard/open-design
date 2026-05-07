import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseAwsProfiles, loadAwsProfiles } from '../src/aws-profiles.js';

describe('parseAwsProfiles', () => {
  it('extracts profile names from [profile NAME] sections', () => {
    const ini = `
[profile SSO-Staging-075505783641]
sso_start_url      = https://d-9067694978.awsapps.com/start
sso_account_id     = 075505783641

[profile SSO-Operations-433642156251]
sso_account_id     = 433642156251
`;
    expect(parseAwsProfiles(ini)).toEqual([
      'SSO-Staging-075505783641',
      'SSO-Operations-433642156251',
    ]);
  });

  it('handles the special [default] section', () => {
    const ini = `
[default]
region = us-east-1

[profile work]
region = us-west-2
`;
    expect(parseAwsProfiles(ini)).toEqual(['default', 'work']);
  });

  it('ignores comments and blank lines', () => {
    const ini = `
# this is a comment
; semicolon comment too

[profile alpha]
region = us-east-1
`;
    expect(parseAwsProfiles(ini)).toEqual(['alpha']);
  });

  it('returns empty array for non-string input', () => {
    expect(parseAwsProfiles(null as any)).toEqual([]);
    expect(parseAwsProfiles(undefined as any)).toEqual([]);
    expect(parseAwsProfiles(123 as any)).toEqual([]);
  });

  it('skips malformed headers', () => {
    const ini = `
[profile]
[profile  ]
[notaprofile foo]
[profile real]
`;
    expect(parseAwsProfiles(ini)).toEqual(['real']);
  });
});

describe('loadAwsProfiles', () => {
  let tmpRoot: string;
  let originalVidyardPath: string | undefined;
  let originalAwsConfigFile: string | undefined;
  let originalHome: string | undefined;

  beforeEach(async () => {
    tmpRoot = await mkdtemp(path.join(tmpdir(), 'od-aws-profiles-'));
    originalVidyardPath = process.env.VIDYARD_PATH;
    originalAwsConfigFile = process.env.AWS_CONFIG_FILE;
    originalHome = process.env.HOME;
    delete process.env.VIDYARD_PATH;
    delete process.env.AWS_CONFIG_FILE;
    process.env.HOME = tmpRoot;
  });

  afterEach(async () => {
    if (originalVidyardPath === undefined) delete process.env.VIDYARD_PATH;
    else process.env.VIDYARD_PATH = originalVidyardPath;
    if (originalAwsConfigFile === undefined) delete process.env.AWS_CONFIG_FILE;
    else process.env.AWS_CONFIG_FILE = originalAwsConfigFile;
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
    await rm(tmpRoot, { recursive: true, force: true });
  });

  it('returns empty list when no files exist', async () => {
    const result = await loadAwsProfiles();
    expect(result.profiles).toEqual([]);
    expect(result.sources).toEqual([]);
  });

  it('loads profiles from $VIDYARD_PATH/devyard/.aws-profile', async () => {
    const vidyardDir = path.join(tmpRoot, 'vidyard-repo');
    const devyardDir = path.join(vidyardDir, 'devyard');
    await rm(devyardDir, { recursive: true, force: true });
    await writeFile(
      path.join(tmpRoot, 'pre.txt'),
      '',
    ).catch(() => {});
    const fs = await import('node:fs/promises');
    await fs.mkdir(devyardDir, { recursive: true });
    await writeFile(
      path.join(devyardDir, '.aws-profile'),
      `[profile vid-staging]
region = us-east-1
[profile vid-prod]
region = us-east-1
`,
    );
    process.env.VIDYARD_PATH = vidyardDir;

    const result = await loadAwsProfiles();
    expect(result.profiles).toEqual(['vid-prod', 'vid-staging']);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toBe(path.join(devyardDir, '.aws-profile'));
  });

  it('merges and de-dupes across multiple files', async () => {
    const fs = await import('node:fs/promises');
    const vidyardDir = path.join(tmpRoot, 'vidyard-repo');
    const devyardDir = path.join(vidyardDir, 'devyard');
    await fs.mkdir(devyardDir, { recursive: true });
    await writeFile(
      path.join(devyardDir, '.aws-profile'),
      `[profile shared]
[profile vid-only]
`,
    );

    const awsDir = path.join(tmpRoot, '.aws');
    await fs.mkdir(awsDir, { recursive: true });
    await writeFile(
      path.join(awsDir, 'config'),
      `[profile shared]
[profile home-only]
`,
    );

    process.env.VIDYARD_PATH = vidyardDir;

    const result = await loadAwsProfiles();
    expect(result.profiles).toEqual(['home-only', 'shared', 'vid-only']);
    expect(result.sources).toHaveLength(2);
  });
});
