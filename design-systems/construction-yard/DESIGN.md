# Vidyard Construction Yard

> Category: Product & SaaS (house default)
> Vidyard's internal design system. Clean, business-oriented, data-dense.
> Indigo brand accent, Vidyard green, deep grey scale. Use for any
> Vidyard-adjacent surface: dashboards, analytics, player chrome,
> operator tooling. Output HTML is tagged with `data-cy-component` so a
> later handoff can port it to real `@vidyard/construction-yard` Vue
> components.

## 1. Visual Theme & Atmosphere

Construction Yard (CY) is Vidyard's shared component and design-token
library. Its aesthetic is clarity-first enterprise UI: restrained
surfaces, hairline borders, a brand indigo used sparingly, and a deep
grey scale tuned for long-form data. Nothing ornamental, nothing
fashion-forward — the product does the talking.

The typography is a single face — **LL Circular** — with a well-defined
seven-step scale (`label-sm` through `headline-display`). There is no
serif pairing and no custom OpenType trickery; the identity comes from
consistent weight, tight vertical rhythm, and a 14px body baseline that
lets dense tables and analytics breathe without feeling sparse.

Colour usage is achromatic by default with a single brand punch:
Indigo-400 (`#5e5cfa`) for primary actions, links, and key interactive
surfaces, and Vidyard Green (`#2c9864`) for success states and the
brand mark. Everything else is a grade of the cool grey family. The
border story is quiet too — `c_grey_200` (`#dde1f0`) hairlines separate
surfaces without shouting.

Elevation is a numbered depth scale (`0, 1, 2, 4, 8, 12, 24`). There
are no free-form `box-shadow` values; every shadow resolves to a token.
Corners are uniformly small: 4px on buttons and inputs, 5px on cards,
circular for avatars. This shape discipline is deliberate and is a key
part of CY's "business-oriented" feel.

**Key Characteristics:**
- Light-first, white surfaces (`#ffffff`), page-muted (`#fafbff`).
- Single brand accent: Indigo-400 (`#5e5cfa`) with Indigo-500 for hover.
- Secondary brand: Vidyard Green (`#2c9864`) for success and brand
  mark only — not a second accent.
- LL Circular at 14px base; seven-step scale, no serif.
- 4px spacing grid (4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 56 / 64 / 72 / 80).
- Radii: 4px default, 5px card, circle for avatars/pills — and only
  those three.
- Depth via the `@depth($n)` mixin; seven rungs (`0, 1, 2, 4, 8, 12, 24`).
- Hairline borders (`#dde1f0` / `c_grey_200`) as the primary division.
- 12px uppercase eyebrows with `+1.5px letter-spacing` — the single
  typographic flourish.

## 2. Color Palette & Roles

### Page & Surface
- **Surface page** (`#ffffff`): Default surface for cards, dialogs, tables.
- **Surface muted** (`#fafbff` / `c_grey_50`): Page background, shell.
- **Surface subtle** (`#f3f5fa` / `c_grey_100`): Hover rows, subtle fills.

### Text (semantic)
- **Primary text** (`#374054` / `font_c_primary` / `c_grey_550`): Default body.
- **Secondary text** (`#5b627d` / `font_c_secondary` / `c_grey_450`): Metadata, captions, descriptions.
- **Disabled text** (`#a9b0c9` / `font_c_disabled` / `c_grey_300`): Disabled states only.
- **Link text** (`#5e5cfa` / `font_c_link` / `c_indigo_400`): Links — same hex as the brand accent.
- **Success text** (`#1d6542` / `font_c_success` / `c_green_600`): Positive confirmations.
- **Error text** (`#bb4346` / `font_c_error` / `c_red_500`): Validation failures, destructive copy.
- **On-dark text** (`#ffffff`): Label on primary buttons and dark surfaces.

### Brand & Accent
- **Brand Indigo** (`#5e5cfa` / `c_indigo_400`): Primary button fill, links, active states, focus-ring companion. Same value as `font_c_link`.
- **Indigo hover** (`#4645bb` / `c_indigo_500`): Hover / pressed for primary buttons and interactive indigo elements.
- **Indigo focus ring** (`#afaefd` / `c_indigo_200`): 3px focus outline for keyboard accessibility. Not an action colour.
- **Indigo surface** (`#d7d7fe` / `c_indigo_100`): Selected-row tints and subtle brand washes. Never a button fill.

### Vidyard Green (secondary brand)
- **Green 500** (`#2c9864`): Vidyard brand mark, success dots.
- **Green 600** (`#1d6542`): Success text (`font_c_success`).
- Green 100–400 (`#cff2e1`, `#9de5c2`, `#6cd8a4`, `#3bcb85`): Analytics fills, success backgrounds.
- Green 700 (`#0f3221`): Reserved — very deep, rare.

### Grey Scale (text & surfaces)
Thirteen grades with extra half-steps for text tuning:
`grey-50` `#fafbff`, `grey-100` `#f3f5fa`, `grey-150` `#ebedf7`,
`grey-200` `#dde1f0`, `grey-250` `#c8cee3`, `grey-300` `#a9b0c9`,
`grey-350` `#848cab`, `grey-400` `#6f7794`, `grey-450` `#5b627d`,
`grey-500` `#475066`, `grey-550` `#374054`, `grey-600` `#2d3445`,
`grey-650` `#232938`, `grey-700` `#1a1b22`.

### Borders & Focus
- **Default border** (`#dde1f0` / `c_grey_200`): Hairline separator. The default for every card, input, and table rule.
- **Focus ring** (`#afaefd` / `c_indigo_200`): 3px outline on keyboard focus, drawn as `box-shadow: 0 0 0 3px`.

### Status & Semantic (beyond green)
- **Red 500** (`#bb4346`): Error text, destructive confirm.
- **Red 400** (`#f95a5e`): Error badge fills, destructive button.
- **Yellow 400** (`#ffc565`): Warning badge, caution dots.
- **Red / Yellow 100** (`#fed6d7`, `#fff1d9`): Status banner tints.

### Analytics Palette (chart colours only)
For data visualisation only; not for chrome. Families of seven grades:
- Blue (`#c1e3ff` → `#002370`).
- Orange (`#ffdfd4` → `#3f1f14`).
- Magenta (`#ffdbec` → `#660033`).
- Teal (`#d9f2f6` → `#193236`).
- Turquoise (`#dafeff` → `#00425c`).
- Purple (`#ecdbff` → `#2c006b`).

Analytics fills are the only legitimate place to reach outside the
brand + grey palette. Never use analytics colours for UI chrome.

## 3. Typography Rules

### Font Family
- **Primary**: `LL Circular`, with fallbacks `Helvetica, Arial, sans-serif`.
- **Monospace**: not defined in CY tokens; use `ui-monospace, SF Mono, Menlo` when code blocks are required.
- **No serif**. CY is single-face by design. Don't opt into a serif pair; it's not the aesthetic.

### Weights
- `300` light — de-emphasised body, rarely used.
- `400` regular / book — default body.
- `500` semi-bold / medium — `headline-lg`, `headline-display`.
- `600` bold — section and page headings, eyebrows.
- `800` black — reserved; rarely appears in UI.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|------|--------|-------------|----------------|-----|
| `headline-display` | LL Circular | 24px (1.50rem) | 500 | 30px / 1.25 | normal | Hero / display; page-defining headline |
| `headline-lg` | LL Circular | 20px (1.25rem) | 500 | 28px / 1.4 | normal | Page heading |
| `headline-md` | LL Circular | 18px (1.125rem) | 600 | 26px / 1.44 | normal | Section heading, card header |
| `body-lg` | LL Circular | 16px (1rem) | 400 | 24px / 1.5 | normal | Long-form copy, empty-state text |
| `body-md` | LL Circular | 14px (0.875rem) | 400 | 20px / 1.43 | normal | Default body — the CY baseline |
| `label-md` | LL Circular | 12px (0.75rem) | 600 | 18px / 1.5 | +1.5px | UPPERCASE eyebrow, section label, table column header |
| `label-sm` | LL Circular | 12px (0.75rem) | 400 | 18px / 1.5 | normal | Caption, metadata, timestamp |

### Principles
- **14px is the baseline**, not 16px. CY is a data-density product; body copy sits at 14px. Use `body-lg` (16px) only for long-form reading passages.
- **Headings stop at 24px**. There is no 32px / 48px / 72px heading in CY. A "hero" headline is 24px `headline-display` — the scale is compressed intentionally for dense operator surfaces.
- **Eyebrows are the one flourish**. `label-md` is 12px / 600 / **UPPERCASE** with `+1.5px letter-spacing`. Use for section labels and table columns; this is the signature CY typographic move.
- **Two weights max per screen.** Typically 400 (body) + 600 (headings/eyebrows). Don't mix 300 / 500 / 600 on the same view.
- **Numeric sizes only.** Valid font sizes are `12 / 14 / 16 / 18 / 20 / 24`. No in-between values, no fluid scales.

## 4. Component Stylings

### Buttons

**Primary (VyButton variant="primary")**
- Background: `#5e5cfa` (Indigo-400)
- Text: `#ffffff`
- Padding: 8px 14px (`button_padding_y` / `button_padding_x`)
- Radius: 4px
- Font: 14px weight 500, no tracking
- Hover: background `#4645bb` (Indigo-500)
- Disabled: background `#a9b0c9`, text `#ffffff`
- Focus: 3px `#afaefd` outline (`box-shadow: 0 0 0 3px #afaefd`)

**Secondary (VyButton variant="secondary")**
- Background: `#ffffff`
- Text: `#5e5cfa`
- Border: `1px solid #dde1f0`
- Padding: 8px 14px
- Radius: 4px
- Hover: border `#5e5cfa`, text `#4645bb`
- Use: Side-by-side with primary for "Cancel" / "Back" / non-committing actions.

**Tertiary (ghost, VyButton variant="tertiary")**
- Background: transparent
- Text: `#5e5cfa`
- Padding: 8px 14px
- Radius: 4px
- Hover: background `#ebedf7` (`c_grey_150`)
- Use: Toolbar actions, inline in cards.

**Destructive (VyButton variant="destructive")**
- Background: `#bb4346`
- Text: `#ffffff`
- Radius: 4px
- Use: Delete, remove, irreversible actions.

### Cards

**Default card (VyCard)**
- Background: `#ffffff`
- Border: `1px solid #dde1f0`
- Radius: 5px (`rounded.md`)
- Shadow: `card_shadow` — `0 0 1px 1px rgba(45,52,69,0.05), 0 1px 3px 0 rgba(45,52,69,0.15)`
- Internal padding: 24px
- Header: `headline-md` (18px / 600), bottom-padded 12px from body.
- Use: Grouped content, dashboard tiles, settings sections.

Cards never get a coloured left-border accent — that's an AI-tile
shape and CY doesn't do it.

### Inputs & Forms

**Text input (VyInput)**
- Background: `#ffffff`
- Border: `1px solid #dde1f0`
- Radius: 4px
- Padding: 8px 12px
- Font: 14px / 400
- Text: `#374054`
- Placeholder: `#a9b0c9`
- Focus: border `#5e5cfa` + 3px `#afaefd` outer outline
- Invalid: border `#bb4346`; error text `label-sm` (`#bb4346`) below

**Text area (VyTextArea)**
- Same as input; min-height 80px; vertical resize only.

**Checkbox / Radio / Switch (VyCheckbox / VyRadio / VySwitch)**
- 16×16 box, 4px radius (checkbox), circle (radio).
- Unchecked: border `#dde1f0`, background `#ffffff`.
- Checked: background `#5e5cfa`, no border; checkmark `#ffffff`.
- Disabled: background `#f3f5fa`, border `#dde1f0`.

### Navigation

- Top bar on `#ffffff` with `1px solid #dde1f0` bottom border.
- Brand mark left; nav links `body-md` (14px / 500) in `#374054`; active link in `#5e5cfa` with a 2px indigo underline.
- Right cluster: avatar (circle), alerts, primary action button.
- Side nav on `#fafbff` with `1px solid #dde1f0` right border; items 40px tall, 16px horizontal padding, 4px radius on hover (`#ebedf7`), active state indigo-100 (`#d7d7fe`) tint.

### Status / Badges / Tags

**Badge (VyBadge — counts, states)**
- Radius: circle (`rounded.full`).
- 16–20px diameter.
- Fill per state: indigo-400 (default), green-500 (success), red-400 (error), yellow-400 (warn), grey-400 (neutral).
- Text: 11–12px / 600 / `#ffffff` on dark fills.

**Tag (VyTag — labels, filters)**
- Radius: 4px.
- Background: `#ebedf7` (`c_grey_150`).
- Border: none.
- Padding: 2px 8px.
- Font: 12px / 500 / `#374054`.
- Dismiss × on right, `#848cab`, hover `#374054`.

### Dialogs (VyDialog)
- Backdrop: `rgba(23, 23, 62, 0.45)`.
- Surface: `#ffffff`, 5px radius, `depth-24` shadow.
- Max width 560px default; 760px for wide forms.
- Header: `headline-md` (18px / 600), close × right-aligned.
- Footer action row: secondary on left, primary on right, 12px gap.

### Alerts & Banners

**Alert (VyAlert — inline)**
- 4px radius, 1px border in the status colour, 12px 16px padding.
- Tinted background (status-100 grade).
- Icon 16px left, text `body-md`.

**Banner (VyBanner — page-top)**
- Full-width, 12px 24px padding.
- Backgrounds: indigo-100 (info), green-100 (success), yellow-100 (warn), red-100 (error).
- Text `body-md`; optional inline link in `#5e5cfa`.

### Tables (VyTable)
- Row height: 40px (comfortable) or 32px (compact).
- Header: `label-md` (12px / 600 UPPERCASE / +1.5px tracking), background `#fafbff`, bottom border `1px solid #dde1f0`.
- Body cells: `body-md` (14px / 400), `1px solid #dde1f0` row separators.
- Hover row: `#f3f5fa` (`c_grey_100`).
- Selected row: `#ebedf7` (`c_grey_150`) with a 2px left indigo-400 bar.

### Tooltips (VyTooltip)
- Surface: `#232938` (`c_grey_650`).
- Text: `#ffffff`, `label-sm` (12px / 400).
- Radius: 4px.
- Padding: 6px 8px.
- Shadow: `depth-2`.
- 8px offset from anchor.

## 5. Layout Principles

### Spacing System
- Base unit: **4px**.
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80 px.
- Button padding: 8px vertical, 14px horizontal.
- Card gap: 40px. Related-card gap: 20px.
- Do not invent values between the scale (no 10px, no 18px). Snap to the grid.

### Grid & Container
- Page max-width: 1200px; centered with 24px gutters.
- Shell uses a three-pane pattern: side nav (240–280px) + main content + optional side panel (320–400px).
- Dashboard grids default to 3 columns on desktop, collapsing to 2 at `lg` and 1 at `md`.

### Breakpoints (`src/tokens/breakpoints.yml`)

| Name | Width | Behavior |
|------|-------|----------|
| sm | 576px | Mobile — single column |
| md | 768px | Tablet — 2-column grids |
| lg | 992px | Small desktop — 2–3 columns |
| xl | 1200px | Desktop — full layout |
| xxl | 1400px | Wide — more side-panel headroom |

### Whitespace Philosophy
- **Data density is a feature**. CY screens are operator tools. Tight vertical rhythm, 14px body, 40px gap between distinct cards.
- **Chrome recedes**. Hairline borders and white surfaces do the structural work; shadows and colour do not.
- **One brand moment per screen**. A primary button, a banner, a selected row — pick one focal indigo element. Don't carpet the page.

### Border Radius Scale
- `rounded.sm` = **4px**: buttons, inputs, tags, tooltips, alerts.
- `rounded.md` = **5px**: cards, dialogs, side panels.
- `rounded.full` = **9999px**: avatars, circular badges, status pills.

That's the entire radius vocabulary. No 6px, no 8px, no 12px.

## 6. Depth & Elevation

CY models elevation as a numbered depth scale exposed via the
`@depth($n)` SCSS mixin in `src/styles/_depth.scss`. The mixin sets
both `z-index` and `box-shadow` from one token — every shadow in a
CY artifact must resolve to one of these seven rungs.

| Depth | Token | Shadow | Use |
|-------|-------|--------|-----|
| 0 | `box_shadow_0` | `none` | Flat surface — page, default row |
| 1 | `box_shadow_1` | `0 0 0 1px #dde1f0` | Subtle outline — outlined card |
| 2 | `box_shadow_2` | `0 0 2px 0 rgba(15,31,41,0.2), 0 2px 2px 0 rgba(15,31,41,0.2)` | Default raised card |
| 4 | `box_shadow_4` | `0 0 4px 0 rgba(15,31,41,0.2), 0 4px 4px 0 rgba(15,31,41,0.2)` | Hover / pressed card |
| 8 | `box_shadow_8` | `0 0 8px 0 rgba(15,31,41,0.2), 0 8px 8px 0 rgba(15,31,41,0.2)` | Popovers, dropdowns |
| 12 | `box_shadow_12` | `0 0 12px 0 rgba(15,31,41,0.2), 0 12px 12px 0 rgba(15,31,41,0.2)` | Sticky toolbars, action sheets |
| 24 | `box_shadow_24` | `0 0 24px 0 rgba(15,31,41,0.2), 0 24px 24px 0 rgba(15,31,41,0.2)` | Dialogs, modals |

Special-purpose shadows:
- `card_shadow` — `0 0 1px 1px rgba(45,52,69,0.05), 0 1px 3px 0 rgba(45,52,69,0.15)`. Soft, used by the default VyCard surface.
- `focus_shadow` — `0 0 0 3px #afaefd`. 3px indigo-200 outline for keyboard focus.

**Shadow philosophy**: light UI, small radii, hairline borders. Depth
communicates interaction hierarchy, not decoration. If a card needs a
drop shadow to look like a card, the layout is wrong — lean on
hairline borders and whitespace first.

## 7. Do's and Don'ts

### Do
- Use Indigo-400 (`#5e5cfa`) for the **one** primary action per screen — the eye should know where to click.
- Use Indigo-500 (`#4645bb`) for hover/pressed on primary elements.
- Use `label-md` (12px / 600 / UPPERCASE / +1.5px tracking) for eyebrows and table column headers — this is CY's signature.
- Keep body copy at 14px (`body-md`). Reserve 16px (`body-lg`) for long-form reading.
- Snap every padding/margin/gap to the 4px grid.
- Use hairline borders (`#dde1f0`) as the primary separator — card edges, row dividers, side-panel boundaries.
- Apply `@depth($n)` mixin values for elevation — depths 0, 1, 2, 4, 8, 12, 24.
- Keep radii at 4 / 5 / circle. That's the vocabulary.
- Use analytics palette families only for charts; keep chrome in greys + indigo.
- Tag every proxy element with `data-cy-component` and class-convention hints (see §10) so the Vue port is deterministic.

### Don't
- Don't put indigo everywhere. Cap visible indigo uses at **2 per screen** (typically one CTA + one accent) — the rest should be indigo-as-link or grey.
- Don't introduce a serif. CY is single-face (LL Circular).
- Don't use heading sizes above 24px. There is no 32px / 48px / 72px in CY.
- Don't invent radius values. 4, 5, or circle — nothing else.
- Don't reach for free-form `box-shadow`. Use the depth scale.
- Don't use analytics colours (orange, magenta, blue, teal) for buttons, links, or chrome. They're for charts.
- Don't put a coloured left-border accent on a card — that's the canonical AI-slop tile. Use a hairline border all around or nothing.
- Don't tint bodies with surface-subtle (`#f3f5fa`) as a decorative background. Keep to white surfaces.
- Don't hand-author spacing values outside the 4px grid. No 10px, no 18px, no 36px.
- Don't emit `.vue` files from a skill run — always emit HTML with proxy classes. The Vue port happens later in a Vue consumer repo.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| sm | <576px | Single column; side nav collapses to hamburger; tables become card-lists |
| md | 576–768px | 2-column grids; side panel becomes a drawer |
| lg | 768–992px | 2–3 column grids; side nav persistent |
| xl | 992–1200px | Full layout, 3-column dashboards |
| xxl | >1200px | Extra headroom for side panels, wider container |

### Collapsing Strategy
- Dashboard 3-col → 2-col at `lg` → 1-col at `md`.
- Tables: >3 columns → card list on `sm`.
- Dialogs: centered → full-screen sheet on `sm`, respecting safe-area.
- Side panel: right-docked → bottom-sheet drawer on `md` and below.
- Primary + secondary buttons: side-by-side → stacked full-width on `sm`, primary on top.

### Touch Targets
- Buttons: 36px min height on desktop, 44px on touch.
- Icon buttons: 32×32 on desktop, 44×44 on touch.
- Table rows in compact mode (32px) upgrade to 40px on touch.

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: Indigo-400 (`#5e5cfa`)
- Primary CTA hover: Indigo-500 (`#4645bb`)
- Brand mark / success: Green-500 (`#2c9864`)
- Success text: Green-600 (`#1d6542`)
- Error: Red-500 (`#bb4346`)
- Page background: `#fafbff`
- Surface: `#ffffff`
- Primary text: `#374054` (`c_grey_550`)
- Secondary text: `#5b627d` (`c_grey_450`)
- Disabled text: `#a9b0c9` (`c_grey_300`)
- Border: `#dde1f0` (`c_grey_200`)
- Focus ring: `#afaefd` (`c_indigo_200`) at 3px
- Hover row: `#f3f5fa` (`c_grey_100`)
- Selected row: `#d7d7fe` (`c_indigo_100`)

### Example Component Prompts

- "Primary button: `<button class="cy-button cy-button--primary" data-cy-component="VyButton" data-variant="primary">Save</button>`. Styles: background `#5e5cfa`, color `#ffffff`, padding 8px 14px, border-radius 4px, font 14px/500 LL Circular, no tracking. Hover: background `#4645bb`. Focus: 3px `#afaefd` outer shadow."

- "Data card: `<section class="cy-card" data-cy-component="VyCard">` with `#ffffff` bg, `1px solid #dde1f0` border, 5px radius, 24px padding, `card_shadow` (0 0 1px 1px rgba(45,52,69,0.05), 0 1px 3px 0 rgba(45,52,69,0.15)). Header inside uses `headline-md` at 18px/600, color `#374054`."

- "Table column header: `<th class="cy-table__th" data-cy-component="VyTable">REVENUE</th>` styled as label-md — 12px weight 600, UPPERCASE, letter-spacing 1.5px, color `#374054`, background `#fafbff`, bottom border `1px solid #dde1f0`."

- "Status banner (info): `<div class="cy-banner cy-banner--info" data-cy-component="VyBanner" data-variant="info">` with background `#d7d7fe`, text `#374054` at 14px/400, 12px 24px padding. No radius — banners are full-bleed."

- "Primary dialog: `<div class="cy-dialog" data-cy-component="VyDialog">` 560px max-width, `#ffffff` bg, 5px radius, `depth-24` shadow (0 0 24px 0 rgba(15,31,41,0.2), 0 24px 24px 0 rgba(15,31,41,0.2)). Backdrop rgba(23,23,62,0.45). Footer: secondary-button (`cy-button--secondary`) + primary-button, 12px gap, right-aligned."

### Iteration Guide
1. One brand moment per screen: exactly one indigo primary button, or one indigo-backed banner — pick one.
2. 14px is body, 24px is hero. If you're tempted to render a 32px+ headline, the answer is `headline-display` at 24px and more whitespace.
3. Snap every px to the 4px grid.
4. Three radii: 4 / 5 / circle. Nothing else.
5. Seven depths: 0 / 1 / 2 / 4 / 8 / 12 / 24 via the `@depth` mixin or matching raw shadow from §6.
6. Green is the brand mark and success state, not a second accent. Don't pair green + indigo buttons on one screen.
7. Tables use UPPERCASE `label-md` headers with 1.5px tracking. This is the CY fingerprint.
8. Tag every component-like element with `data-cy-component` per §10 — the whole point is to make the HTML → Vue port mechanical.

## 10. Component Map (HTML → Vue port contract)

CY ships as Vue components (`@vidyard/construction-yard`, 57 exports).
An open-design skill cannot emit Vue and still preview in the FileViewer,
so it emits HTML that **tags every component-shaped element with**
`data-cy-component="<VueName>"` **plus a CSS class convention**. A
later Claude Code pass in a Vue consumer repo swaps each tagged
element for the real `<Vy…>` SFC using the `data-variant` /
`data-size` / `data-state` attributes as prop values.

Rules:
- Always set `data-cy-component="<ExactVueExportName>"` on the proxy
  root element.
- Class convention: `cy-<component>` as the root class; variants as
  `cy-<component>--<variant>` modifier classes AND as
  `data-variant="<variant>"` attributes (the attribute is the source
  of truth for the port).
- Size attributes (`data-size="sm|md|lg"`) and state attributes
  (`data-state="default|hover|active|disabled"`) follow the same
  rule: duplicated into a modifier class AND the data attribute.
- Do not invent new CY components. If a pattern doesn't fit the
  inventory below or in the appendix (§11), use a plain styled
  `<div>` and omit the `data-cy-component` attribute — the port
  will then emit plain HTML too.

### MVP components (deep spec)

| VyComponent | HTML proxy | Variants (`data-variant`) | Notes |
|---|---|---|---|
| **VyButton** | `<button class="cy-button cy-button--{variant}" data-cy-component="VyButton" data-variant="{variant}" data-size="{sm\|md\|lg}">` | `primary`, `secondary`, `tertiary`, `destructive` | Primary only for the one CTA. Icons go in an inner `<span class="cy-button__icon" aria-hidden="true">`. Disabled: `data-state="disabled"` + `disabled` attr. |
| **VyLink** | `<a class="cy-link" data-cy-component="VyLink" href="...">` | `default`, `muted` | Color `#5e5cfa`; underline on hover. `muted` uses `#5b627d`. |
| **VyCard** | `<section class="cy-card" data-cy-component="VyCard">` | `default`, `raised` | `raised` adds `depth-2` (`box_shadow_2`); default is card_shadow. |
| **VyInput** | `<input class="cy-input" data-cy-component="VyInput" type="text">` | `default`, `invalid`, `disabled` | Wrap in `<label class="cy-field">` for the form row with label + help text. |
| **VyTextArea** | `<textarea class="cy-textarea" data-cy-component="VyTextArea" rows="4">` | `default`, `invalid`, `disabled` | Vertical resize only; min-height 80px. |
| **VyCheckbox** | `<label class="cy-checkbox" data-cy-component="VyCheckbox"><input type="checkbox"><span class="cy-checkbox__box"></span><span class="cy-checkbox__label">Name</span></label>` | `default`, `indeterminate`, `disabled` | Label is part of the hit target. |
| **VyRadio** | `<label class="cy-radio" data-cy-component="VyRadio"><input type="radio" name="{group}"><span class="cy-radio__dot"></span><span class="cy-radio__label">Option</span></label>` | `default`, `disabled` | Group radios with a shared `name`. |
| **VySwitch** | `<label class="cy-switch" data-cy-component="VySwitch"><input type="checkbox"><span class="cy-switch__track"><span class="cy-switch__thumb"></span></span></label>` | `default`, `disabled` | Prefer VySwitch over VyCheckbox for on/off settings. |
| **VyTabs** | `<div class="cy-tabs" data-cy-component="VyTabs" role="tablist">` with `<button class="cy-tabs__tab" data-cy-component="VyTab" role="tab" data-state="{active\|default}">` children | active state via `data-state="active"` | 2px indigo underline on active; hover row tint on others. |
| **VyBadge** | `<span class="cy-badge cy-badge--{variant}" data-cy-component="VyBadge" data-variant="{variant}">` | `default` (indigo), `success` (green), `warning` (yellow), `error` (red), `neutral` (grey) | Circular; 16–20px; for counts and state dots. |
| **VyTag** | `<span class="cy-tag" data-cy-component="VyTag">Label<button class="cy-tag__dismiss" aria-label="Remove">×</button></span>` | `default`, `removable` | 4px radius; `#ebedf7` background. |
| **VyDialog** | `<div class="cy-dialog" data-cy-component="VyDialog" role="dialog" aria-modal="true">` with `<header class="cy-dialog__header">`, `<div class="cy-dialog__body">`, `<footer class="cy-dialog__footer">` | size via `data-size="sm\|md\|lg"` (440 / 560 / 760px) | Backdrop rendered as sibling `<div class="cy-dialog__backdrop">`. |
| **VyAlert** | `<div class="cy-alert cy-alert--{variant}" data-cy-component="VyAlert" data-variant="{variant}" role="alert">` | `info`, `success`, `warning`, `error` | Inline; 4px radius; icon slot + message + optional action link. |
| **VyBanner** | `<div class="cy-banner cy-banner--{variant}" data-cy-component="VyBanner" data-variant="{variant}">` | `info`, `success`, `warning`, `error` | Page-top; full-bleed; no radius. |
| **VyHeading** | `<h{n} class="cy-heading cy-heading--{role}" data-cy-component="VyHeading" data-variant="{role}">` | `display`, `lg`, `md` (maps to headline-display / lg / md) | Use real `<h1>`–`<h3>` elements; variant attribute controls the token, not the tag. |
| **VyParagraph** | `<p class="cy-paragraph cy-paragraph--{role}" data-cy-component="VyParagraph" data-variant="{role}">` | `body-md` (default), `body-lg`, `label-sm`, `label-md` | `label-md` is UPPERCASE with 1.5px tracking; renderer should `text-transform: uppercase` on that variant. |
| **VyTable** | `<table class="cy-table" data-cy-component="VyTable">` with `<thead class="cy-table__head">`, `<th class="cy-table__th">`, `<tbody>`, `<tr class="cy-table__tr">`, `<td class="cy-table__td">` | size via `data-size="compact\|comfortable"` (32 / 40px rows) | Headers render as `label-md`. Selected row gets `data-state="selected"` + 2px indigo left bar. |
| **VyIcon** | `<span class="cy-icon" data-cy-component="VyIcon" data-icon="{name}" aria-hidden="true"><svg …/></span>` | size via `data-size="sm\|md\|lg"` (12 / 16 / 20px) | Use monoline SVG, 1.6–1.8px stroke, `currentColor`. Never emoji. |
| **VyTooltip** | `<span class="cy-tooltip" data-cy-component="VyTooltip" role="tooltip">` anchored absolutely to its trigger | `default`, `rich` | Trigger pattern: wrap anchor + tooltip in `<span class="cy-tooltip-wrapper">`. |
| **VySpinner** | `<span class="cy-spinner" data-cy-component="VySpinner" role="status" aria-live="polite">` | size via `data-size="sm\|md\|lg"` (16 / 24 / 32px) | Indigo-400 ring on transparent track; CSS keyframe rotation. |

## 11. Component Catalog Appendix

Components in CY not spec'd above. An agent may use any of these when
the brief genuinely calls for it — emit a proxy element with the right
`data-cy-component` value and a sensible `cy-<component>` class, even
without a full style spec here. The later Vue port maps the proxy to
the real SFC; fidelity comes from the tag, not from exhaustive local
styling. When in doubt, fall back to the MVP components above.

**Forms & Input**
- `VyAutocomplete` — text input with inline suggestion list.
- `VyDatePicker` — date-only picker, popover calendar.
- `VyDateTimePicker` — date + time.
- `VyCustomDatePicker` — range / preset-driven date picker.
- `VyInputNumber` — numeric input with stepper buttons.
- `VyInputV2` — next-gen input primitive (successor to VyInput).
- `VySlider` — horizontal range slider with indigo fill.
- `VyColorPicker` — swatch grid + hex input.

**Selection / Menus**
- `VyMenu` — generic dropdown menu of buttons.
- `VyMenuRadio` — single-select radio menu.
- `VyOverflowMenu` — "more actions" kebab button + menu.
- `VyRadioGroup`, `VyRadioButton` — grouped radio primitives.
- `VyPopover` — attached floating container (non-modal).
- `VyDropDown` — primitive for menus/popovers (internal).
- `VyMenuBehaviour` — keyboard / focus behaviour mixin (internal).
- `VyWindow` — positioning primitive (internal).

**Layout**
- `VyContainer` — max-width page container.
- `VyGrid` — CSS-grid layout helper.
- `VySidePanel` — right-docked off-canvas panel.
- `VyDialogContainer` — dialog portal mount.
- `VyCollapse` — accordion / disclosure.
- `VyDragAndDrop` — reorderable list primitive.
- `VyOverflowObserver` — detects children overflow (for responsive truncation).

**Tables**
- `VyPagination` — page nav controls.
- `VySortableTh` — sortable column header.

**Cards variants**
- `VyCardButton` — clickable card (whole-surface button semantics).
- `VyCTACard` — marketing-style promoted card.
- `VyNotificationCard` — notification-styled card with icon + dismiss.

**Media & Thumbnails**
- `VyThumbnail` — generic image thumb.
- `VyVideoThumbnail` — video still with play glyph overlay.
- `VyPlaylistThumbnail` — stacked playlist thumb.
- `VyAspectRatio` — lock aspect-ratio on content.

**Feedback / Status**
- `VyProgress` — linear progress bar.
- `VyStatus` — status dot + label.
- `VyTip` — inline helper text with icon.
- `VyTagBox` — grouped tags input.
- `VyToast` — transient message (bottom-right).
- `VyTruncate` — single-line truncation with tooltip.
- `VyTruncateList` — truncate a list to N + "…and M more".

**Navigation**
- `VyBreadcrumb`, `VyBreadcrumbItem` — breadcrumb trail.

If none of the above or the MVP list fits, don't invent a new
component name. Use an untagged styled `<div>` and rely on the §2–§6
tokens. A future CY contribution is the correct way to add a pattern,
not a freelance `VySomething` on the fly.
