// @ts-nocheck
import { describe, expect, it } from 'vitest';

import { lintArtifact } from '../src/lint-artifact.js';


describe('all-caps-no-tracking', () => {
  it('flags uppercase rule with no letter-spacing at all', () => {
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; font-size: 12px; }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    const hit = findings.find((f) => f.id === 'all-caps-no-tracking');
    expect(hit).toBeDefined();
    expect(hit.severity).toBe('P1');
  });

  it('flags uppercase rule with too-small letter-spacing', () => {
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: 0.02em; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes uppercase rule with adequate letter-spacing in em', () => {
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes uppercase rule with adequate letter-spacing in px', () => {
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: 2px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('does not flag a style block with no uppercase rule', () => {
    const html = `<style>.x { color: red; }</style>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags an uppercase rule in a SECOND <style> block', () => {
    // Regression: the scan used to call `exec` once on a non-global
    // regex, so only the first <style> block was inspected. Artifacts
    // commonly emit a reset/normalize block before the components
    // block; the offending uppercase rule sat in block #2 and slipped
    // past. The scan now iterates every <style> block.
    const html = `
      <style>.reset { box-sizing: border-box; }</style>
      <style>.eyebrow { text-transform: uppercase; font-size: 12px; }</style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    const hit = findings.find((f) => f.id === 'all-caps-no-tracking');
    expect(hit).toBeDefined();
    expect(hit.severity).toBe('P1');
  });

  it('does not flag an uppercase rule that is entirely inside a CSS comment', () => {
    // Regression: the scan ran against the raw <style> body, so a
    // commented-out rule like `/* .eyebrow { text-transform: uppercase; } */`
    // matched `upperRe` and fired a P1 even though the browser ignores it.
    // CSS comments are stripped before structural matching now.
    const html = `
      <style>
        /* .eyebrow { text-transform: uppercase; } */
        .eyebrow { font-size: 12px; }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('still flags an active uppercase rule when surrounded by comments', () => {
    // Comments are stripped only for structural matching; the live rule
    // outside the comment must still fire.
    const html = `
      <style>
        /* historical: removed in 2024 */
        .eyebrow { text-transform: uppercase; font-size: 12px; }
        /* trailing note */
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags inline style with text-transform: uppercase and no letter-spacing', () => {
    // Regression: the rule used to scan only <style> blocks, so an
    // artifact emitting `<span style="text-transform: uppercase">NEW</span>`
    // produced no finding even though the rendered output is the same
    // ALL CAPS the typography rule prohibits without tracking.
    const html = `<span style="text-transform: uppercase">NEW</span>`;
    const findings = lintArtifact(html);
    const hit = findings.find((f) => f.id === 'all-caps-no-tracking');
    expect(hit).toBeDefined();
    expect(hit.severity).toBe('P1');
  });

  it('flags inline style with text-transform: uppercase and too-small letter-spacing', () => {
    const html = `<span style="text-transform: uppercase; letter-spacing: 0.02em">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes inline style with text-transform: uppercase and adequate letter-spacing in em', () => {
    const html = `<span style="text-transform: uppercase; letter-spacing: 0.08em">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes inline style with text-transform: uppercase and adequate letter-spacing in px', () => {
    const html = `<span style="text-transform: uppercase; letter-spacing: 2px">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags inline style on a tag that already carries other attributes', () => {
    // Make sure the inline-style scan handles tags whose `style` is not
    // the first attribute. The leading-boundary anchor must not anchor
    // to start-of-string only.
    const html = `<span class="x" style="text-transform: uppercase">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('does not double-fire when both <style> block and inline style are offending', () => {
    // The inline-style scan should be skipped when the <style>-block
    // scan already produced this finding — single corrective signal.
    const html = `
      <style>.eyebrow { text-transform: uppercase; font-size: 12px; }</style>
      <span style="text-transform: uppercase">NEW</span>
    `;
    const findings = lintArtifact(html);
    const hits = findings.filter((f) => f.id === 'all-caps-no-tracking');
    expect(hits.length).toBe(1);
  });

  it('passes a 12px label with 1px tracking (resolves 0.06em via same-rule font-size)', () => {
    // Regression: the previous absolute-fallback floor of >=1.5px was
    // stricter than the craft rule. `font-size: 12px; letter-spacing: 1px`
    // is `1 / 12 = 0.083em` — well above the 0.06em rule — and must pass.
    const html = `
      <style>
        .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes a 14px label with 1px tracking (resolves 0.06em via same-rule font-size)', () => {
    // 14px * 0.06 = 0.84px floor, so 1px tracking satisfies the rule.
    const html = `
      <style>
        .badge { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags a 14px label with 0.5px tracking (below same-rule 0.06em floor)', () => {
    // 14px * 0.06 = 0.84px floor; 0.5px is below the rule and must flag.
    const html = `
      <style>
        .badge { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes inline 12px label with 1px tracking', () => {
    // Same regression as the <style>-block case but in the inline branch.
    const html = `<span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes inline 14px label with 1px tracking', () => {
    const html = `<span style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags inline 14px label with 0.5px tracking', () => {
    const html = `<span style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes inline 1px tracking even without a font-size (16px default fallback)', () => {
    // When the same rule does not declare font-size, the conservative
    // absolute fallback of >=1px keeps default-16px-body labels passing
    // (1 / 16 ≈ 0.0625em, just over the 0.06em rule).
    const html = `<span style="text-transform: uppercase; letter-spacing: 1px">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags a 48px heading with 0.06rem tracking (rem ignores element font-size)', () => {
    // Regression: `rem` was previously folded into the same branch as
    // `em` and accepted at the 0.06 threshold. But `rem` is relative
    // to the root font-size (16px default), not the element's own
    // font-size, so on a 48px heading `0.06rem` resolves to 0.96px —
    // about 0.02em of the element, well below the 0.06em rule.
    const html = `
      <style>
        .display { font-size: 48px; text-transform: uppercase; letter-spacing: 0.06rem; }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes a 16px label with 0.06rem tracking (rem ≈ 1px ≈ 0.06em on 16px)', () => {
    // 0.06rem * 16px/rem = 0.96px; on a 16px element that is 0.06em —
    // exactly at the floor. The rem branch must accept it.
    const html = `
      <style>
        .eyebrow { font-size: 16px; text-transform: uppercase; letter-spacing: 0.06rem; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes a 48px heading with 0.18rem tracking (rem converted, meets element 0.06em)', () => {
    // 0.18rem * 16px/rem = 2.88px; 48px * 0.06 = 2.88px floor — the
    // converted rem matches the per-element em floor exactly.
    const html = `
      <style>
        .display { font-size: 48px; text-transform: uppercase; letter-spacing: 0.18rem; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags inline 48px heading with 0.06rem tracking', () => {
    const html = `<h1 style="font-size: 48px; text-transform: uppercase; letter-spacing: 0.06rem">Headline</h1>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes inline 16px label with 0.06rem tracking (rem ≈ 0.06em on 16px)', () => {
    const html = `<span style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.06rem">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes uppercase rule whose letter-spacing dereferences a compliant :root token', () => {
    // Regression: the tracking helper used to recognise only literal
    // numeric values, so a tokenized rule — exactly the pattern the
    // craft prompt steers artifacts toward — was wrongly reported as
    // `all-caps-no-tracking`. The helper now resolves `var(--name)` to
    // its `:root` definition and judges the literal value against the
    // 0.06em floor.
    const html = `
      <style>
        :root { --caps-tracking: 0.08em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags uppercase rule whose letter-spacing dereferences a noncompliant :root token', () => {
    // The token-resolution path must not blanket-pass `var()` refs:
    // a token defined below the 0.06em floor still trips the lint.
    const html = `
      <style>
        :root { --caps-tracking: 0.02em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags uppercase rule whose letter-spacing var() has no matching :root definition', () => {
    // Unresolved references stay in place; the existing "no numeric
    // letter-spacing" path then reports the rule as missing tracking.
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes uppercase rule whose letter-spacing var() has a compliant fallback', () => {
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking, 0.08em); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes inline uppercase whose letter-spacing dereferences a compliant :root token', () => {
    const html = `
      <style>:root { --caps-tracking: 0.08em; }</style>
      <span style="text-transform: uppercase; letter-spacing: var(--caps-tracking)">NEW</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags a 3rem heading with 1px tracking (rem font-size resolves to 48px, 0.06em floor = 2.88px)', () => {
    // Regression: the px-vs-element-font-size resolution previously
    // matched only `font-size: <n>px`, so a `font-size: 3rem` heading
    // fell through to the lenient `>= 1px` fallback and accepted 1px
    // tracking — even though the rendered ~48px display has a 2.88px
    // floor and 1px is well below the 0.06em rule. The helper now
    // resolves `rem` font-size via the same root assumption used for
    // tracking and applies the strict per-element floor.
    const html = `
      <style>
        .display { font-size: 3rem; text-transform: uppercase; letter-spacing: 1px; }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes a 3rem heading with 0.06em tracking (em path is unaffected by font-size unit)', () => {
    // Sanity check: the rem font-size fix must not regress the em
    // letter-spacing branch. `0.06em` is the rule, regardless of how
    // font-size is expressed.
    const html = `
      <style>
        .display { font-size: 3rem; text-transform: uppercase; letter-spacing: 0.06em; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes a 3rem heading with 3px tracking (3 ≥ 48 * 0.06 = 2.88)', () => {
    const html = `
      <style>
        .display { font-size: 3rem; text-transform: uppercase; letter-spacing: 3px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags a tokenized display size with 1px tracking (var() resolves to 3rem, then to 48px)', () => {
    // Regression: same root cause via a CSS variable. The agent often
    // hides the size behind a token (`--display-size: 3rem`); after
    // `resolveCssVars` the body reads `font-size: 3rem;` and must take
    // the same strict-floor branch. Without the fix, the rule slipped
    // past via the lenient fallback.
    const html = `
      <style>
        :root { --display-size: 3rem; }
        .display { font-size: var(--display-size); text-transform: uppercase; letter-spacing: 1px; }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags a tokenized px display size with 1px tracking', () => {
    // The token-resolution path must also catch a px-valued token —
    // `font-size: var(--display-size)` with `--display-size: 48px`
    // resolves the same way and the 2.88px floor still applies.
    const html = `
      <style>
        :root { --display-size: 48px; }
        .display { font-size: var(--display-size); text-transform: uppercase; letter-spacing: 1px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags a heading with 1em font-size (unresolvable unit) and 1px tracking', () => {
    // When the rule explicitly declares font-size in a unit we cannot
    // resolve (`em`, `%`, `calc(...)`, unresolved var), the helper
    // refuses the lenient body-text fallback — the element might be
    // arbitrarily large. The rule must use `em` letter-spacing or an
    // explicit px/rem font-size to be verifiable.
    const html = `
      <style>
        .display { font-size: 2em; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes a heading with 1em font-size and 0.06em tracking (em path is verifiable)', () => {
    // The conservative refusal applies only when the caller leans on
    // the px fallback. Em letter-spacing is per-element by definition,
    // so an em font-size declaration is irrelevant to the check.
    const html = `
      <style>
        .display { font-size: 2em; text-transform: uppercase; letter-spacing: 0.08em; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags inline 3rem heading with 1px tracking', () => {
    // Same regression reproduced through the inline-style branch.
    const html = `<h1 style="font-size: 3rem; text-transform: uppercase; letter-spacing: 1px">Headline</h1>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags an uppercase rule whose only `letter-spacing` is a custom-property declaration', () => {
    // Regression: the previous substring regex matched
    // `--letter-spacing: 0.08em` because it scanned the whole rule body
    // for `letter-spacing\s*:`. Token-name declarations have no rendered
    // effect, so the rule renders ALL CAPS without tracking and must
    // still trip the P1 lint.
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; --letter-spacing: 0.08em; }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags a 48px heading whose only `font-size` is a custom-property declaration and tracking is below the floor', () => {
    // Regression: `--display-font-size: 48px` previously satisfied the
    // bail-out branch that detected an unresolvable font-size, masking
    // the fact that no real font-size is declared. With token names
    // ignored, the rule falls back to the conservative >=1px floor and
    // 0.5px tracking is correctly flagged.
    const html = `
      <style>
        .display { text-transform: uppercase; --display-font-size: 48px; letter-spacing: 0.5px; }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags inline uppercase whose only `letter-spacing` is a custom-property declaration', () => {
    const html = `<span style="text-transform: uppercase; --letter-spacing: 0.08em">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags an uppercase rule whose compliant letter-spacing is overridden by a later noncompliant one', () => {
    // Regression: the helper used to pick the FIRST matching
    // letter-spacing declaration in the rule, but CSS applies the LAST
    // effective declaration in source order. So
    // `.eyebrow { letter-spacing: 0.08em; letter-spacing: 0.02em }`
    // renders the noncompliant 0.02em — the lint must judge against the
    // last declaration, not the first.
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; letter-spacing: 0.02em; }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags an inline uppercase whose compliant letter-spacing is overridden by a later noncompliant one', () => {
    const html = `<span style="text-transform: uppercase; letter-spacing: 0.08em; letter-spacing: 0.02em">NEW</span>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags a 14px label whose 1px tracking would pass but a later font-size: 100px shifts the floor', () => {
    // Regression: `resolveFontSizePx` used to pick the FIRST matching
    // font-size declaration; the cascade resolves to the LAST. With
    // `font-size: 14px; font-size: 100px`, the rendered floor is
    // `100 * 0.06 = 6px`, so 1px tracking is well below the rule and
    // must flag — even though the stale 14px would have accepted it
    // (14 * 0.06 = 0.84px floor).
    const html = `
      <style>
        .badge { font-size: 14px; font-size: 100px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes when the compliant letter-spacing is the LAST declaration (override of an earlier noncompliant one)', () => {
    // Sanity check: the cascade fix must not regress the inverse case.
    // An author intentionally restoring the floor with a later override
    // — `letter-spacing: 0.02em; letter-spacing: 0.08em` — renders 0.08em
    // and must not fire the lint.
    const html = `
      <style>
        .eyebrow { text-transform: uppercase; letter-spacing: 0.02em; letter-spacing: 0.08em; }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags an uppercase rule when conflicting :root and [data-theme] tokens disagree on the floor', () => {
    // Regression: `extractCssTokens` used to flatten all global theme-
    // scope tokens to one map with last-write-wins, regardless of the
    // selector that scoped each value. A scoped override that lifted
    // the token above the floor could rescue a default-theme value
    // that rendered below it, just because the second declaration
    // happened to be parsed last. The helper now enumerates every
    // applicable value and only passes if all resolutions satisfy the
    // 0.06em floor — so the default-theme 0.02em still trips the lint.
    const html = `
      <style>
        :root { --caps-tracking: 0.02em; }
        [data-theme="dark"] { --caps-tracking: 0.08em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags an uppercase rule even when the conflicting :root override comes second', () => {
    // Same regression but with declaration order swapped — the previous
    // last-write-wins behaviour was order-dependent, so both orderings
    // must fail when ANY resolution is below the floor.
    const html = `
      <style>
        [data-theme="dark"] { --caps-tracking: 0.08em; }
        :root { --caps-tracking: 0.02em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes when every conflicting scoped token value clears the floor', () => {
    // The conservative cascade must not over-fire: when ALL theme
    // variants of a token satisfy the 0.06em rule, the artifact is
    // compliant under every applicable theme and the lint must not
    // fire.
    const html = `
      <style>
        :root { --caps-tracking: 0.08em; }
        [data-theme="dark"] { --caps-tracking: 0.10em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('passes when a single :root block redeclares the token with a compliant value last', () => {
    // Regression: `extractCssTokens` used to record every distinct
    // value seen for a custom property, even when the duplicates lived
    // in the SAME cascade scope. CSS source-order cascade collapses
    // `:root { --caps-tracking: 0.02em; --caps-tracking: 0.08em; }`
    // to the second declaration — the first is dead weight, never
    // reaches any element. Treating both as theme alternatives fed the
    // stale 0.02em into `hasAdequateUppercaseTracking` and emitted a
    // spurious P1 on what is normal CSS overriding. The fix collapses
    // duplicate declarations within a single rule body to the last
    // value before merging into the cross-scope token map.
    const html = `
      <style>
        :root { --caps-tracking: 0.02em; --caps-tracking: 0.08em; }
        .eyebrow { text-transform: uppercase; letter-spacing: var(--caps-tracking); }
      </style>
      <span class="eyebrow">New</span>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags a 48px heading with 1px tracking nested inside @media (innermost-rule scan)', () => {
    // Regression: `upperRe` used `[^}]*` for the rule body, so an
    // outer `@media (...) { .display { font-size: 48px; text-transform:
    // uppercase; letter-spacing: 1px; } }` matched as one rule whose
    // selector was `@media (...)` and whose body began with
    // `.display { font-size: 48px`. `parseDeclarations` then read the
    // first property as `.display { font-size`, lost the same-rule
    // font-size, and `hasAdequateUppercaseTracking` fell back to the
    // lenient inherited-size path that accepts 1px on a 48px heading.
    // Restricting the body alternation to `[^{}]*` makes the regex
    // skip the `@media` wrapper and match the inner rule directly,
    // restoring the strict per-element 0.06em floor (48 * 0.06 =
    // 2.88px), so 1px tracking is correctly flagged.
    const html = `
      <style>
        @media (min-width: 768px) {
          .display { font-size: 48px; text-transform: uppercase; letter-spacing: 1px; }
        }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('flags a 48px heading with 1px tracking nested inside @supports', () => {
    // Same regression reproduced through @supports, the other
    // common at-rule wrapper that previously hid noncompliant
    // tracking from the lint.
    const html = `
      <style>
        @supports (color: oklch(0 0 0)) {
          .display { font-size: 48px; text-transform: uppercase; letter-spacing: 1px; }
        }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });

  it('passes paired light/dark token values that are each compliant in their own scope', () => {
    // Regression: `extractCssTokens` merged token values by name across
    // scopes (`--caps-tracking = [1px, 3px]`, `--display-size = [16px,
    // 48px]`), and the tracking helper then took an independent
    // per-token cartesian product. The impossible cross-theme pairing
    // `(--display-size: 48px, --caps-tracking: 1px)` failed the
    // 0.06em floor (48 * 0.06 = 2.88px > 1px) and emitted a false
    // `all-caps-no-tracking` even though the artifact is compliant
    // under both real themes:
    //   default: 16px size + 1px tracking — 1 / 16 ≈ 0.0625em ≥ 0.06em
    //   dark:    48px size + 3px tracking — 3 / 48 ≈ 0.0625em ≥ 0.06em
    // The fix preserves per-scope token maps and evaluates per-theme
    // effective maps so paired declarations stay paired.
    const html = `
      <style>
        :root { --caps-tracking: 1px; --display-size: 16px; }
        [data-theme="dark"] { --caps-tracking: 3px; --display-size: 48px; }
        .display {
          font-size: var(--display-size);
          text-transform: uppercase;
          letter-spacing: var(--caps-tracking);
        }
      </style>
      <h1 class="display">Headline</h1>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeUndefined();
  });

  it('flags paired theme tokens when one scope is internally noncompliant', () => {
    // The per-theme evaluation must not silently rescue a scope whose
    // own paired values fall below the floor. Default theme here is
    // 48px size + 1px tracking — 1 / 48 ≈ 0.021em, well below the
    // 0.06em rule — and must flag, even though the dark scope is
    // internally compliant.
    const html = `
      <style>
        :root { --caps-tracking: 1px; --display-size: 48px; }
        [data-theme="dark"] { --caps-tracking: 3px; --display-size: 48px; }
        .display {
          font-size: var(--display-size);
          text-transform: uppercase;
          letter-spacing: var(--caps-tracking);
        }
      </style>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'all-caps-no-tracking')).toBeDefined();
  });
});

describe('trust-gradient', () => {
  it('flags a blue→cyan two-stop gradient with hex stops', () => {
    // Regression: `craft/anti-ai-slop.md` documents blue→cyan as a
    // P0 cardinal-sin trust gradient, but the existing purple-gradient
    // rule only matches violet/indigo hex stops or the literal
    // `purple`/`violet` keywords. A pure blue→cyan gradient slipped
    // past unflagged. The new `trust-gradient` rule closes that gap.
    const html = `<div style="background: linear-gradient(90deg, #3b82f6, #06b6d4)">Hi</div>`;
    const findings = lintArtifact(html);
    const hit = findings.find((f) => f.id === 'trust-gradient');
    expect(hit).toBeDefined();
    expect(hit.severity).toBe('P0');
  });

  it('flags a blue→cyan two-stop gradient with keyword stops', () => {
    const html = `<div style="background: linear-gradient(90deg, blue, cyan)">Hi</div>`;
    const findings = lintArtifact(html);
    const hit = findings.find((f) => f.id === 'trust-gradient');
    expect(hit).toBeDefined();
    expect(hit.severity).toBe('P0');
  });

  it('flags a sky→cyan gradient (sky shares the blue ramp under another name)', () => {
    const html = `<div style="background: linear-gradient(135deg, #0ea5e9, #22d3ee)">Hi</div>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'trust-gradient')).toBeDefined();
  });

  it('does not double-fire when purple-gradient already caught a purple→blue/cyan stop list', () => {
    // A gradient that mixes purple/indigo with blue/cyan triggers
    // purple-gradient first. The trust-gradient rule must skip in that
    // case so the agent gets a single corrective signal.
    const html = `<div style="background: linear-gradient(90deg, #6366f1, #06b6d4)">Hi</div>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'purple-gradient')).toBeDefined();
    expect(findings.find((f) => f.id === 'trust-gradient')).toBeUndefined();
  });

  it('does not flag a blue-only gradient (no cyan stop)', () => {
    // A single-color gradient (blue→darker-blue) is a different
    // pattern; only the documented two-color blue→cyan trust ramp
    // is the AI tell.
    const html = `<div style="background: linear-gradient(90deg, #3b82f6, #1e40af)">Hi</div>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'trust-gradient')).toBeUndefined();
  });

  it('does not flag a gradient with only cyan stops', () => {
    const html = `<div style="background: linear-gradient(90deg, #06b6d4, #0891b2)">Hi</div>`;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'trust-gradient')).toBeUndefined();
  });

  it('flags a blue→cyan gradient declared inside a <style> block', () => {
    const html = `
      <style>
        .hero { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
      </style>
      <div class="hero">Welcome</div>
    `;
    const findings = lintArtifact(html);
    expect(findings.find((f) => f.id === 'trust-gradient')).toBeDefined();
  });
});
