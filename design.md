---
name: Kinetic Ledger
colors:
surface: '#f8f9fa'
surface-dim: '#d9dadb'
surface-bright: '#f8f9fa'
surface-container-lowest: '#ffffff'
surface-container-low: '#f3f4f5'
surface-container: '#edeeef'
surface-container-high: '#e7e8e9'
surface-container-highest: '#e1e3e4'
on-surface: '#191c1d'
on-surface-variant: '#44474c'
inverse-surface: '#2e3132'
inverse-on-surface: '#f0f1f2'
outline: '#74777d'
outline-variant: '#c4c6cd'
surface-tint: '#4f6073'
primary: '#041627'
on-primary: '#ffffff'
primary-container: '#1a2b3c'
on-primary-container: '#8192a7'
inverse-primary: '#b7c8de'
secondary: '#1850d4'
on-secondary: '#ffffff'
secondary-container: '#3d6bee'
on-secondary-container: '#fffbff'
tertiary: '#211200'
on-tertiary: '#ffffff'
tertiary-container: '#38260b'
on-tertiary-container: '#a88c69'
error: '#F04452'
on-error: '#ffffff'
error-container: '#ffdad6'
on-error-container: '#93000a'
primary-fixed: '#d2e4fb'
primary-fixed-dim: '#b7c8de'
on-primary-fixed: '#0b1d2d'
on-primary-fixed-variant: '#38485a'
secondary-fixed: '#dce1ff'
secondary-fixed-dim: '#b5c4ff'
on-secondary-fixed: '#00164e'
on-secondary-fixed-variant: '#003bae'
tertiary-fixed: '#feddb5'
tertiary-fixed-dim: '#e1c29b'
on-tertiary-fixed: '#281802'
on-tertiary-fixed-variant: '#584326'
background: '#f8f9fa'
on-background: '#191c1d'
surface-variant: '#e1e3e4'
text-primary: '#191F28'
text-secondary: '#4E5968'
success: '#00D082'
border-subtle: '#E5E8EB'
typography:
display:
fontFamily: Inter
fontSize: 32px
fontWeight: '700'
lineHeight: 40px
letterSpacing: -0.02em
headline-lg:
fontFamily: Inter
fontSize: 24px
fontWeight: '700'
lineHeight: 32px
letterSpacing: -0.01em
headline-md:
fontFamily: Inter
fontSize: 20px
fontWeight: '600'
lineHeight: 28px
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
label-lg:
fontFamily: Inter
fontSize: 13px
fontWeight: '600'
lineHeight: 18px
letterSpacing: 0.02em
label-sm:
fontFamily: Inter
fontSize: 11px
fontWeight: '500'
lineHeight: 16px
letterSpacing: 0.03em
headline-lg-mobile:
fontFamily: Inter
fontSize: 22px
fontWeight: '700'
lineHeight: 28px
rounded:
sm: 0.25rem
DEFAULT: 0.5rem
md: 0.75rem
lg: 1rem
xl: 1.5rem
full: 9999px
spacing:
unit: 4px
container-padding: 20px
stack-gap: 12px
section-gap: 24px
gutter: 16px
Brand & Style
The design system is engineered for a high-end delivery settlement service, where financial precision meets logistics efficiency. The brand personality is authoritative, transparent, and utilitarian. It avoids the transient nature of modern "AI" trends in favor of a Corporate Modern aesthetic that emphasizes structural integrity and data clarity.
The visual direction draws from premium fintech interfaces: utilizing expansive whitespace, a restrained color palette, and high-quality typography. The goal is to evoke a sense of absolute reliability—ensuring that drivers and fleet managers feel a sense of security and professional calm when interacting with their financial data.
Colors
The palette is anchored by Deep Professional Blue (#1A2B3C), used for primary actions and core branding to establish trust. A vibrant Action Blue (#3060E3) is utilized for secondary interactive elements to provide clear visual cues without compromising the professional tone.
The surface strategy relies on a "Snow & Slate" approach: Pure White (#FFFFFF) for primary containers and Light Gray (#F8F9FA) for page backgrounds to provide subtle contrast and hierarchy. Functional colors for success (settlements completed) and error (discrepancies) are desaturated to maintain the high-end fintech aesthetic.
Typography
This design system utilizes Inter for its exceptional legibility in data-heavy environments. The hierarchy is strictly enforced through weight and scale rather than color.
Headlines: Use Semi-Bold (600) to Bold (700) weights with slightly tighter letter spacing for a structured, modern feel.
Body Text: Standardizes on a 14px and 16px grid. Line heights are generous (1.5x) to ensure readability during fast-paced logistics operations.
Labels: Small caps or medium-weight labels are used for metadata like "Transaction ID" or "Timestamp," ensuring they are distinct from primary data points.
Layout & Spacing
The layout follows a Fluid Grid model optimized for mobile-first consumption.
Safe Margins: A standard 20px horizontal margin is maintained across all mobile views to prevent content from crowding the screen edges.
Rhythm: An 8px-based spacing system (4px, 8px, 16px, 24px, 32px) ensures a consistent vertical cadence.
Density: While functional, the system avoids clutter. Large settlement amounts and primary CTAs are given significant breathing room (24px+ padding) to highlight their importance.
Mobile Reflow: For tablet views, the layout expands into a 2-column detail-view pattern, but the primary mobile experience remains a single-column stack for speed and focus.
Elevation & Depth
To maintain a clean and professional look, depth is communicated through Tonal Layers and Low-Contrast Outlines rather than heavy drop shadows.
Surface Levels: The background uses `#F8F9FA`. Foreground cards use `#FFFFFF`.
Borders: Containers are defined by a 1px solid border (`#E5E8EB`).
Active States: Subtle 1px inner strokes or a very soft, diffused shadow (0px 2px 8px rgba(0,0,0,0.04)) are used only when an element needs to appear "lifted" during interaction (e.g., a dragged list item).
Interactive Depth: Buttons use a solid fill; when pressed, they shift 10% darker in value rather than changing elevation.
Shapes
The shape language is Rounded, utilizing an 8px radius for standard components and a 12px radius for large cards. This softens the "industrial" nature of the service, making the app feel approachable while remaining firmly professional.
Buttons & Inputs: 8px (`rounded-md`).
Surface Cards: 12px (`rounded-lg`).
Status Badges: Fully pill-shaped for immediate distinction from interactive elements.
Components
Buttons: Primary buttons use the Deep Blue fill with white text. Secondary buttons use a subtle gray border (`#E5E8EB`) with Action Blue text.
Cards: Cards are the primary container for settlement data. They feature a white background, 1px border, and 12px rounded corners. Header areas within cards use a light gray bottom border to separate metadata from the primary amount.
Inputs: Form fields use an 8px radius with a `#E5E8EB` border. Focus states are indicated by a 1px Action Blue border and a very subtle light blue glow (no blur).
Status Chips: Small, pill-shaped indicators. "Settled" uses a light green background with dark green text; "Pending" uses a light amber.
Lists: Data lists utilize a 16px vertical gap between items. Each row is separated by a 1px hairline divider that stops 16px short of the container edges to create a "floating" effect.
Settlement Summary: A specialized large-scale component at the top of screens that displays the "Net Pay" in Display typography, providing an immediate snapshot of financial status.