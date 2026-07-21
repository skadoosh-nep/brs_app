---
name: NirmanFlow
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#0b1426'
  on-tertiary: '#ffffff'
  tertiary-container: '#20283c'
  on-tertiary-container: '#888fa7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  sidebar-width: 260px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style
The design system is engineered for high-stakes construction management and financial oversight. The brand personality is **authoritative, precise, and systematic**, aiming to instill a sense of absolute control over complex data.

The visual style follows a **Modern Corporate** aesthetic with a heavy emphasis on **Information Density**. It prioritizes legibility and functional hierarchy over decorative elements. By utilizing a "Data-First" philosophy, the UI remains clean through strict alignment and purposeful whitespace, ensuring that financial figures and project statuses are immediately actionable. The emotional response should be one of professional confidence and unwavering reliability.

## Colors
This design system utilizes a sophisticated palette centered on **Deep Slate Blue** for core structural elements and primary actions, conveying stability and professional depth. 

**Construction Amber** serves as the critical accent color, used exclusively for high-priority statuses, interactive highlights, and cautionary alerts, mimicking its role in real-world construction environments. 

The background system relies on a tiered scale of **Neutral Grays** (Slate family) to create logical separation between navigation, workspace, and utility panels without the need for heavy borders. Success, error, and info states utilize standard semantic colors but are slightly desaturated to maintain the professional tone.

## Typography
**Inter** is the foundational typeface for this design system, chosen for its exceptional legibility in data-heavy environments and its neutral, modern character. 

To enhance financial clarity, **JetBrains Mono** is introduced specifically for numerical data, currency values, and technical IDs within tables and reports. This ensures that columns of numbers align perfectly (tabular figures) and are distinct from descriptive text.

Typography scales are tightly controlled. We use a "tight" line-height for data tables and a "relaxed" line-height for long-form reports. Headers utilize a slight negative letter-spacing to maintain a compact, "engineered" appearance.

## Layout & Spacing
The layout employs a **12-column Fixed Grid** for large displays to ensure data visualization remains centered and readable, transitioning to a **Fluid Grid** for mobile and tablet views. 

A **4px baseline grid** governs all spacing, ensuring mathematical consistency across all components. 
- **Desktop:** 260px persistent sidebar on the left. Main content area uses 24px margins and 20px gutters.
- **Tablet:** Sidebar collapses into a mini-rail (64px). Margins reduce to 16px.
- **Mobile:** Sidebar moves to a bottom-nav or hamburger drawer. Margins are 12px. Content is primarily single-column with horizontal swiping allowed for data tables and Kanban boards.

## Elevation & Depth
This design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines** rather than heavy shadows to maintain a clean, "flat-plus" look.

- **Level 0 (Background):** Slate-50 (#F8FAFC). The canvas.
- **Level 1 (Cards/Sidebar):** Pure White (#FFFFFF) with a 1px border of Slate-200. This is the primary work surface.
- **Level 2 (Dropdowns/Modals):** Pure White with a subtle, diffused ambient shadow (0px 4px 20px rgba(30, 41, 59, 0.08)) to indicate temporary interaction.
- **Level 3 (Active Overlays):** Deep Slate Blue backgrounds for tooltips or high-priority floating actions.

Depth is primarily communicated through color shifts (e.g., a darker gray for a "pressed" state) rather than physical extrusion.

## Shapes
The shape language is **Soft (0.25rem)**, leaning towards a technical and structured appearance. 

Sharp corners (0px) are used only for the primary sidebar and internal table borders to maximize screen real estate. Standard UI components like buttons, input fields, and cards use the 4px (0.25rem) radius. Large containers like modals or dashboards cards can scale up to 8px (0.5rem) to provide a subtle visual break from the rigid grid. 

Status chips and badges use a **Pill** shape to differentiate them immediately from interactive buttons.

## Components
- **Buttons:** Primary buttons are Solid Deep Slate Blue. Secondary buttons are outlined with 1px Slate-300. Destructive actions use a subtle red ghost style.
- **Data Tables:** High-density with 1px horizontal borders only. Header cells use `label-caps` typography with a Slate-100 background. 
- **Kanban Boards:** Cards are Level 1 elevation (white with border). Use vertical Amber stripes on the left edge of cards to indicate "Urgent" or "Delayed" tasks.
- **Input Fields:** 1px Slate-300 border, turns Deep Slate Blue on focus. Labels use `body-sm` with 500 weight.
- **Financial Tabs:** Underlined style rather than boxed tabs. The active state uses a 2px Amber bottom border.
- **Status Chips:** Small, pill-shaped markers. Use light background tints of the status color with high-contrast text (e.g., Light Amber background with Dark Amber text).
- **Persistent Sidebar:** Dark-themed using Tertiary color (#0F172A). Active links use an Amber vertical indicator on the far left.