---
name: Fluent Ascent
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4c5851'
  on-tertiary: '#ffffff'
  tertiary-container: '#647069'
  on-tertiary-container: '#e7f4eb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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
  stack-gap-sm: 8px
  stack-gap-md: 16px
  stack-gap-lg: 24px
  grid-columns-mobile: '4'
  grid-columns-desktop: '12'
  gutter: 16px
---

## Brand & Style

The brand personality is **encouraging, professional, and clear**. It is designed to lower the affective filter for English language learners, making the daunting task of speaking a new language feel structured and achievable. The target audience ranges from young professionals to adult learners seeking career advancement.

The design style is **Academic Modern**. It eschews the "gamified" clutter of casual apps in favor of a clean, organized, and lightweight interface. It leverages a Corporate Modern foundation with subtle influences of Minimalism to ensure focus. The UI should evoke a sense of steady progress, utilizing generous whitespace and a rhythmic vertical flow to guide the user through lessons without cognitive overload.

## Colors

The palette is rooted in **Success Blue**, a deep, vibrant blue that signals authority and clarity. This is the primary driver for actions and brand moments. 

- **Success Blue (#2563EB):** Used for primary buttons, active navigation states, and key focus areas.
- **Soft Mint (#10B981):** Reserved for positive reinforcement, progress bars, and successful completion states. 
- **Canvas White (#FFFFFF):** The bedrock of the interface, providing a sterile but warm background that emphasizes content.
- **Surface Tint (#F8FAFC):** A very light cool gray used for grouping content or secondary containers to maintain hierarchy without heavy lines.
- **Neutral Slate (#64748B):** Used for secondary text and icons to ensure high contrast while remaining softer than pure black.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels. Its soft, rounded terminals and wide apertures provide the friendly, approachable feel necessary for an educational context while maintaining a professional, geometric structure.

For English learners, readability is paramount. Body text uses a generous 1.5x line height to prevent "crowding" of words. Headlines are slightly tightened in letter-spacing to appear confident and modern. Emphasis is achieved through weight shifts (Medium to Bold) rather than italicization, which can sometimes be harder for non-native readers to parse.

## Layout & Spacing

The layout follows a **mobile-first fluid grid**. Since the primary use case is on-the-go learning, the system prioritizes a single-column stack on mobile with 20px side margins. On larger screens, the content centers within a fixed-width container (max 1200px) to prevent line lengths from becoming illegible.

Spacing follows a strict **4px baseline rhythm**. Most components are separated by `stack-gap-md` (16px), while related elements (like a label and its input) use `stack-gap-sm` (8px). This consistent vertical rhythm creates the "organized" feel of a digital textbook.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh borders in favor of soft shadows that lift the primary content cards off the Canvas White background.

- **Level 0 (Background):** Canvas White (#FFFFFF).
- **Level 1 (Cards/Containers):** Pure white with a 4px blur, 2% opacity black shadow. This level is used for the main lesson modules.
- **Level 2 (Interaction/Popovers):** A slightly more pronounced shadow (8px blur, 4% opacity) used when a user taps an element or a "Speak Now" tooltip appears.
- **Focus State:** Elements do not use heavy shadows for focus; instead, they utilize a 2px solid Success Blue ring to maintain the "Academic" precision.

## Shapes

The design system uses a **Rounded** shape language (0.5rem base radius). This strikes a balance between the clinical sharp edges of a traditional enterprise app and the overly bubbly aesthetic of a children's game.

- **Standard Buttons & Inputs:** 8px (0.5rem) corner radius.
- **Content Cards:** 16px (1rem) corner radius to create a soft, welcoming frame for lesson content.
- **Progress Bars:** Fully pill-shaped (rounded-full) to signify fluid, continuous movement.

## Components

### Buttons
Primary buttons use a solid Success Blue background with white text. Secondary buttons use a transparent background with a 1px Success Blue border. All buttons include a subtle hover/active state where the background darkens by 5%.

### Progress Indicators
The "Growth Track" component is a horizontal bar using Soft Mint for the filled portion. It should be lightweight (8px height) and placed at the top of every lesson screen to provide constant positive feedback.

### Lesson Cards
Lesson cards are white with a Level 1 shadow and 16px padding. They should feature a "Soft Mint" checkmark icon when completed and a "Success Blue" play icon when available.

### Input Fields (Speech & Text)
Inputs use a Soft Slate border (1px). When active, the border transitions to Success Blue. For speech input, a dedicated "Mic Button" should be a large, circular Level 2 elevated element with a Soft Mint pulse animation when recording.

### Chips
Used for vocabulary selection or category filtering. These should have a light Success Blue tint background (#EFF6FF) with dark blue text, using the `label-sm` typography style.