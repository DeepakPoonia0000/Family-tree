# Design System Specification: The Living Scrapbook

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Hearth"**

Most family-oriented websites fall into the trap of being either overly "childish" or boringly "functional." This design system rejects both. We are building a "Digital Hearth"—a space that feels as warm and tactile as a physical photo album, yet as sophisticated as a high-end editorial magazine. 

To achieve this, we move away from the rigid, boxed-in layouts of traditional web design. We embrace **intentional asymmetry**, where images may overlap text containers, and **tonal depth**, where hierarchy is defined by soft shifts in color rather than harsh lines. The goal is to create an interface that feels "home-grown" but expertly curated, emphasizing legibility, accessibility, and emotional resonance.

---

## 2. Colors & Surface Philosophy
The palette is grounded in organic, earthy tones: warm beiges (`surface`), sage greens (`primary`), and dusted blues (`secondary`).

### The "No-Line" Rule
To maintain a premium, seamless feel, **1px solid borders are prohibited for sectioning.** Structural boundaries must be created through background color shifts. For example:
- A main content area using `surface` might sit adjacent to a sidebar using `surface_container_low`.
- A footer should be defined by `surface_dim` rather than a top-border line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
1.  **Base Layer:** `background` or `surface` (#fffcf7).
2.  **Section Layer:** `surface_container_low` (#fcf9f3) to define distinct content zones.
3.  **Component Layer:** `surface_container_high` (#f0eee6) for cards or interactive elements.
4.  **Floating Layer:** `surface_container_lowest` (#ffffff) for elements that need to pop, such as modals or active selection states.

### The "Glass & Gradient" Rule
To add "soul" to the interface:
- **Glassmorphism:** Use `surface_container_lowest` at 70% opacity with a `backdrop-blur: 12px` for navigation bars and floating menus. This allows the warm background tones to bleed through, softening the UI.
- **Signature Gradients:** For primary CTAs or Hero backgrounds, use a subtle linear gradient transitioning from `primary` (#566a4d) to `primary_container` (#d2eac5) at a 135-degree angle.

---

## 3. Typography
Our typography is a conversation between the timeless authority of a serif and the modern clarity of a sans-serif.

*   **Display & Headlines (Newsreader):** This slightly playful serif brings a "literary" feel to the family story. Use `display-lg` (3.5rem) for hero moments. The character of the serif should feel warm and human, not cold and academic.
*   **Body & Titles (Plus Jakarta Sans):** A friendly, open-aperture sans-serif that ensures high legibility for all ages. It provides a clean, modern counterpoint to the Newsreader headings.
*   **Hierarchy Note:** Always maintain a high contrast between headings and body text. A `headline-lg` should feel significantly more "important" than the `body-lg` beneath it to guide the eye through the "scrapbook" layout.

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_highest` card on a `surface_container_low` background. The subtle 2-3% difference in hex value creates a natural, soft lift that mimics fine paper.
*   **Ambient Shadows:** If an element must "float" (like a FAB or a Tooltip), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(56, 56, 51, 0.06)`. Notice we use the `on_surface` color for the shadow, never pure black, to keep the glow organic.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` (#bbb9b2) at **15% opacity**. It should be felt more than seen.

---

## 5. Components

### Buttons
- **Primary:** Rounded `full` (9999px). Background is the signature `primary` to `primary_container` gradient. Text is `on_primary` (#ffffff).
- **Secondary:** `surface_container_highest` background with `on_secondary_container` text.
- **Interaction:** On hover, primary buttons should scale slightly (1.02x) rather than just changing color, emphasizing a tactile, "bouncy" feel.

### Cards & Lists
- **Rule:** Absolute prohibition of divider lines.
- **Structure:** Separate list items using the Spacing Scale (e.g., `8` or `2.75rem`).
- **Asymmetric Cards:** For "Memory Tiles" (photo cards), use varying roundedness. One corner might use `xl` (3rem) while the others use `lg` (2rem) to create a custom, hand-clipped look.

### Input Fields
- **Styling:** Use `surface_container_highest` for the input track.
- **Corners:** Use `md` (1.5rem) roundedness to keep them approachable.
- **Focus State:** Instead of a heavy border, use a soft outer glow using the `secondary_fixed_dim` color at 40% opacity.

### Navigation (The "Floating Tab")
- Instead of a full-width header, use a centered "Floating Tab" using Glassmorphism. This reduces the "corporate" feel and makes the website feel like an app or a personal tool.

---

## 6. Do's and Don'ts

### Do
*   **Use Intentional White Space:** Use the `20` (7rem) and `24` (8.5rem) spacing tokens to let sections breathe. A family home shouldn't feel cluttered.
*   **Overlap Elements:** Let a `headline-lg` slightly overlap a photo container to break the "web template" feel.
*   **Prioritize Legibility:** Always ensure `on_surface` text (#383833) sits on `surface` backgrounds for maximum contrast.

### Don't
*   **Don't use 100% Black:** Pure black is too harsh for this system. Use `on_surface` or `inverse_surface` for high-contrast needs.
*   **Don't use Sharp Corners:** Even the `sm` roundedness is 0.5rem. Everything should feel soft to the touch.
*   **Don't use Grid Borders:** Avoid using visible lines to separate content columns. Let the alignment and background tones do the work.

---

## 7. Spacing & Rhythm
The Spacing Scale is non-linear to encourage a dynamic "Editorial" rhythm. 
- Use **Small Gaps** (`1` to `3`) for internal component relationships (e.g., a label above an input).
- Use **Large Gaps** (`12` to `20`) for transitions between life chapters or major sections. This "macro-spacing" is what gives the system its high-end, premium feel.