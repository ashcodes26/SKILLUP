---
name: Dark Void
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1E1E24'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#cbc3d8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#948ea1'
  outline-variant: '#494455'
  surface-tint: '#cdbdff'
  primary: '#cdbdff'
  on-primary: '#370095'
  primary-container: '#8052ff'
  on-primary-container: '#fffdff'
  inverse-primary: '#6835e7'
  secondary: '#ffba35'
  on-secondary: '#422c00'
  secondary-container: '#e19f00'
  on-secondary-container: '#563a00'
  tertiary: '#78d8be'
  on-tertiary: '#00382d'
  tertiary-container: '#15846e'
  on-tertiary-container: '#f9fffb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#5001cf'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba35'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#5f4100'
  tertiary-fixed: '#94f4da'
  tertiary-fixed-dim: '#78d8be'
  on-tertiary-fixed: '#002019'
  on-tertiary-fixed-variant: '#005142'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  canvas: '#000000'
  surface-elevated: '#0D0D0F'
  surface-higher: '#16161A'
  border-subtle: '#202023'
  border-strong: '#363639'
  text-primary: '#FFFFFF'
  text-body: '#BDBDBD'
  text-muted: '#9A9A9A'
  text-disabled: '#606066'
  semantic-error: '#EB5757'
  semantic-info: '#3B82F6'
  highlight-replacement: '#FFFF00'
  status-highlight-green: '#55C98B'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 78px
    fontWeight: '600'
    lineHeight: 86px
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 42px
    fontWeight: '600'
    lineHeight: 46px
  page-title:
    fontFamily: Inter
    fontSize: 42px
    fontWeight: '600'
    lineHeight: 50px
  page-title-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  stage-heading:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '600'
    lineHeight: 40px
  headline-h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
  headline-h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-h4:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  metric-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 54px
  metric-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
  body-default:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-compact:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-default:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption-muted:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
  eyebrow-kicker:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 2px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 1.5rem
  margin-top: 2.25rem
  margin-bottom: 3rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

### Brand Personality & Core Philosophy
The design system embodies a focused, technical, and audit-ready environment built for student career readiness and faculty placement operations. Grounded in a high-contrast terminal aesthetic, it prioritizes clarity, informational density, and cognitive calmness over decorative distraction. The visual tone is deliberate, objective, and authoritative—instilling confidence in high-stakes milestones such as transcript verification, AI-assisted resume revisions, cohort placements, and institutional compliance.

### Target Audience & Emotional Intent
- **Students:** Seeking clear, unbiased validation of career readiness, transparent skill-gap insights, and actionable next steps without condescending gamification.
- **Faculty & Administrators:** Managing cohort compliance, placement pipelines, and institutional outcomes requiring high-density legibility, deterministic data structures, and immediate error visibility.
- **Emotional Response:** Controlled competence, total transparency, technical rigor, and zero sensory fatigue during prolonged sessions.

### Design Style: Technical Precision & Tonal Layering
The interface operates under a strict dark-mode-first paradigm known as "Dark Void." It avoids skeuomorphic gradients and drop shadows entirely, constructing depth purely through pitch-black (`#000000`) canvas foundations, tiered dark-charcoal elevated surfaces, and razor-sharp 1px structural hairline borders. Vibrant synthetic accents (electric violet, warning amber, and emerald verification) punctuate the void strictly to indicate user agency, system states, and data provenance.

## Colors

The design system operates on an absolute dark palette where color is applied strictly for hierarchy, interactive agency, and deterministic feedback. 

### Structural & Surface Roles
- **Canvas (`#000000`):** The default viewport base and foundational substrate.
- **Surface Elevated (`#0D0D0F`):** Standard container background for cards, tables, panels, and lists.
- **Surface Higher (`#16161A`):** Interactive surface tier used for secondary action states, card headers, and nested components.
- **Surface Container (`#1E1E24`):** Highest local elevation for popovers, elevated menus, and active hover tiers.
- **Borders (`#202023` & `#363639`):** 1px structural hairlines that define boundaries without introducing shadow blur.

### Typography & Content Hierarchy
- **Primary Text (`#FFFFFF`):** Reserved for headers, key values, active control labels, and high-emphasis readouts.
- **Body Text (`#BDBDBD`):** Standard readable neutral for continuous reading, item descriptions, and primary data cells.
- **Muted Text (`#9A9A9A`):** Metadata, timestamps, captions, breadcrumbs, and inactive table headers.
- **Disabled Text (`#606066`):** Inactive controls, locked features, and empty inputs.

### Semantic & Accents
- **Primary Accent (`#8052FF`):** Violet signaling interactive focus, active tab navigation, selection indicators, and primary call-to-action commits.
- **Secondary Accent / Highlight (`#FFB829`):** Amber for warning indicators, non-blocking compliance notices, skill gaps, and pending recommendations.
- **Success (`#15846E`):** Emerald signaling verified milestones, confirmed student eligibility, and approved assets.
- **Destructive / Error (`#EB5757`):** Direct red signaling validation failures, hard blockages, and destructive account or student record operations.

### Local Color Exceptions
- **Staged Resume Replacement (`#FFFF00`):** Pure yellow fill paired strictly with `#000000` text to mark staged AI text edits in diff inspection views (must never appear in final exports).
- **Status Label Light (`#55C98B`):** High-contrast text companion to the `#15846E` success token, used when badge fills require higher legibility against dark surfaces.

## Typography

The typography is built entirely on `Inter` (with native system-ui fallbacks), relying on precise weight shifts and tabular clarity to navigate complex information architectures.

### Hierarchy & Guidelines
- **Eyebrow / Kicker (`eyebrow-kicker`):** Formatted in uppercase with `2px` letter spacing. Used strictly above page titles or container modules to label context (e.g., `FACULTY DIRECTORY`, `PIPELINE STAGE 02`, `AI AUDIT`).
- **Display & Page Titles:** Hero sizes scale dynamically from mobile (`42px`) to desktop (`78px`). Page headers retain tight, controlled line heights to maximize vertical dashboard real estate.
- **Metrics & KPIs:** Designed for immediate at-a-glance scanning. Always pair `metric-lg` and `metric-md` readouts with explicit textual denominators (e.g., `4.8 / 5.0` or `142 / 200 Eligible`) in `caption-muted` to prevent ambiguity.
- **Readability Rules:** Tabular numbers (`tnum`) should be enabled for all data tables, metric displays, and progress readouts to prevent horizontal jitter during real-time filtering and status recalculation.

## Layout & Spacing

### Layout Philosophy
The design system employs a fixed-container fluid-grid hybrid. While components expand cleanly within designated columns, maximum horizontal content caps protect reading lines and prevent visual fragmentation across ultra-wide monitors.

### Layout Containers & Width Envelopes
Layouts are bound to dedicated container limits depending on task density:
- **Authentication Forms (`max-w: 420px`):** Single-column centered form envelope.
- **Resume Workspace (`max-w: 800px`):** Aligns with standard printable document proportions.
- **Admin & Cohort Import (`max-w: 880px`):** Constrained focus for batch CSV staging.
- **Career Plan Stage View (`max-w: 960px`):** Optimized reading envelope for multi-stage roadmap tracking.
- **Job Match & Opportunities (`max-w: 1200px`):** Split-view search, filter, and candidate drawer envelope.
- **Placement Hub & Faculty Consoles (`max-w: 1280px`):** Maximum density layout for high-volume tabular rosters and cohort metrics.

### Grid Rhythms & Breakpoints
- **Desktop ($\ge 900\text{px}$):** 12-column structure with `24px` gutters (`gutter`), standard horizontal outer margin of `24px` (`margin`), top padding of `36px` (`margin-top`), and bottom shelf margin of `48px` (`margin-bottom`).
- **Tablet ($768\text{px} - 899\text{px}$):** 8-column layout. Navigation transitions into compact contextual drawers; login panels collapse into unified vertical stacks.
- **Mobile ($320\text{px} - 767\text{px}$):** 4-column layout with `16px` gutters (`gutter-sm`) and `16px` margins. Side-by-side metric tiles collapse into full-width stacked rows.

## Elevation & Depth

### Flat Tonal Contrast
The system completely rejects diffuse drop shadows, blur radii, and faux physical extrusions. Depth is established exclusively through surface tone transitions and rigid, high-contrast borders.

### Surface Tiers
1. **Level 0 (Base Canvas):** `#000000` — Empty canvas, screen backdrop, and unallocated gutters.
2. **Level 1 (Card & Module Foundation):** `#0D0D0F` enclosed in a 1px solid `#202023` border. All standard cards, data list rows, and dashboard modules inhabit this level.
3. **Level 2 (Higher Nested Surfaces):** `#16161A` with a 1px solid `#363639` border. Used for nested sub-cards, active list selection rows, table headers, and secondary button fills.
4. **Level 3 (Overlays & Dialogs):** `#1E1E24` with a 1px solid `#363639` border. Reserved for modals, floating dropdowns, and contextual action menus.

### Focus & Active Signaling
Physical elevation is replaced with interactive radiance: focused inputs, active chips, and selected cards receive a non-destructive outer focus border: `2px solid #8052FF` with a `4px` offset against the `#000000` canvas (`focus-visible`).

## Shapes

The design system uses a deliberate duality in its geometry: functional data containers utilize compact, disciplined corners to maximize space and convey technical precision, while primary human interactive points adopt soft pills.

### Geometry Rules
- **Standard Controls & Containers (`0.25rem` - `0.5rem` / 4px - 8px):** Text inputs, dropdown selectors, navigation tabs, filter chips, and standard data cards use soft corners. Form controls standardly sit at `6px` radius.
- **Major Panels & Modals (`0.75rem` - `1rem` / 12px - 16px):** Primary view panels and modal dialogs use larger corner definitions (`rounded-xl` to 16px) to maintain visual hierarchy.
- **Primary Pill Components (`24px` radius):** Primary interactive CTA buttons with a minimum touch height of `48px` and compact controls at `44px` height utilize full pill caps. Status badge pills also inherit full pill caps to distinguish descriptive metadata from rectangular form inputs.

## Components

### Buttons
- **Primary Action (Pill):** Minimum height `48px` (desktop) / `44px` (touch compact). Background `#8052FF`, text `#FFFFFF`, border-radius `24px`, padding `0 24px`. Hover: lightness increase (+8%). Active: `#6C3EE8`. Focus: `2px solid #8052FF` with `4px` offset.
- **Secondary Action:** Minimum height `44px`. Background `#16161A`, border `1px solid #363639`, text `#FFFFFF`, border-radius `8px` or `22px` for demo pill variants.
- **Destructive Action:** Solid variant uses `#EB5757` background with `#FFFFFF` text. Ghost variant uses transparent background with `#EB5757` border and text.
- **Ghost Action:** Background transparent, text `#BDBDBD`, border none. Hover: background `#16161A`, text `#FFFFFF`.

### Form Inputs & Selectors
- **Text & Multiline Fields:** Background `#000000`, border `1px solid #202023`, border-radius `6px`, padding `10px 14px`, text `#FFFFFF`. Placeholder text `#606066`.
- **States:** Hover border `#363639`; Focused border `#8052FF` with explicit offset outline; Error state border `#EB5757` accompanied by inline helper text.
- **Checkboxes & Radios:** Custom `#0D0D0F` boxes with `1px solid #363639` border. Checked state: `#8052FF` fill with crisp white glyph. Radios maintain 50% border radius.

### Badges, Chips & Status Indicators
- **Status Badges (Pills):** Height `24px`, padding `2px 10px`, radius `12px`, font size `11px` weight `600`.
  - *Eligible / Approved:* `#15846E` background with `#FFFFFF` or `#55C98B` text.
  - *In Progress / Review:* `#16161A` background with `#FFB829` text and subtle amber border.
  - *Change Requested / Action Required:* `#EB5757` subtle tint with `#EB5757` text.
- **Provenance Chips:** Distinctive badges displaying source credibility (e.g., `Retrieved SerpApi`, `Gemini Grounded`, `Synthetic Demo`). Enclosed in `#16161A` with `#9A9A9A` text and `#363639` 1px border.

### Cards & Panels
- **Standard Card:** Background `#0D0D0F`, border `1px solid #202023`, border-radius `12px`, internal padding `24px`.
- **Interactive Card:** Transitions border color to `#363639` and surface to `#16161A` on hover. Never shifts spatial coordinates or uses drop shadows.
- **Comparison Panels:** Split layout showing current vs. proposed student assets (e.g., resume bullets). Staged additions feature `#FFFF00` highlight markers with `#000000` text in preview panes.

### Data Tables & Rosters
- **Layout:** Edge-to-edge `#0D0D0F` surface with `1px solid #202023` dividing borders. Table header text uses `label-default` in `#9A9A9A` uppercase.
- **Row Styling:** Row height `48px` default (`36px` compact mode). Alternating rows remain unshaded; hover rows trigger `#16161A` highlight.
- **Accessibility Fallback:** Every graphical chart (e.g., radar skills charts) must be immediately accompanied by an accessible plain-text data table rendering exact numerical fractions.

### Privacy, Permissions & Consent Blocks
- Mandatory disclosure banners for AI processing and external integrations.
- Styled as dedicated panels: Background `#0D0D0F`, border `1px solid #363639`, left accent line `3px solid #8052FF`. Includes strict notices that AI suggestions do not constitute automated employment screening or guaranteed hiring outcomes.