# Home feed redesign: newspaper layout with hand-drawn touches

## Design direction
- Newspaper-style layout like Explore: a serif masthead ("daily nodes" plus today's date edition line), double rules, and red accents.
- Hand-drawn touches from the brief on top: warm paper background with a dot grain, wobbly card borders, hard offset shadows (no blur), small tilts, tape strips on photo logs, and dashed dividers.
- Fonts: the newspaper serif for headings, Kalam for handwritten notes and labels, Patrick Hand for log text. The mono font stays for small metadata.
- Colors: paper `#fdfbf7`, pencil `#2d2d2d`, red marker `#ff4d4d`, blue pen `#2d5da1`, post-it `#fff9c4`.

## Home page layout
```text
 ══════════════════════════════════
   DAILY NODES   · Sat, Oct 17 ·  explore  (avatar)
 ══════════════════════════════════
   "good evening, armaan."   (handwritten underline scribble)
   ‹ yesterday | TODAY | tomorrow ›
         ↘ hand-drawn arrow
      (  + log something  )   <- big centered wobbly button
   group strip (overlapping avatars, sticky-note label)
   ── ─ ─ feed ─ ─ ──
   [photo polaroid]   [text note card]
```
- The "add log" button becomes the centerpiece: large wobbly oval, red fill, hard shadow, a soft idle bounce, and a dashed arrow pointing to it. Pressing it flattens the button (shadow disappears).
- The empty day shows a sketched prompt ("nothing logged yet, start here") that points at the button.

## Clearer difference between photo logs and text logs
- **Photo log ("polaroid")**: a white frame with a thick bottom margin, a tape strip, and a slight tilt. The photo stays fully visible with no text on top of it. The heading and description sit in the bottom margin in handwriting.
- **Text log ("note")**: a post-it or lined-paper card with a large serif heading, a red margin line, and the description below. There is no image area.
- Small stamp labels on each card (`PHOTO` / `NOTE`) plus the log type icon make the two kinds easy to tell apart at a glance.

## New log form: keep the heading when a photo is added
- The heading box is no longer locked when an image is picked.
- If a heading is already written when an image is added, that text moves into the description box automatically (added in front of any existing description). A small note confirms: "moved your heading into the description."
- A live preview card in the form shows how the log will look: the polaroid when a photo is picked, the note when it isn't. It updates as the user types.
- Inputs get wobbly borders and a blue focus ring. The modal opens with a tilt-and-drop animation.

## Animations (Framer Motion)
- Masthead and greeting fade and slide in when the page loads.
- Feed cards enter one after another with a small spring and land at their tilt. On hover a card straightens and lifts (the shadow shrinks).
- When the day changes, the old cards slide out and the new day's cards slide in from the matching side.
- The add button has a gentle idle bounce and a spring press.
- The modal and live preview cross-fade between polaroid and note.
- Existing reaction animations stay. Everything respects the device's "reduce motion" setting.

## Technical details
- Add `framer-motion`. Load Kalam and Patrick Hand through `next/font/google` in `layout.tsx` as CSS variables.
- Add the design tokens (colors, `--radius-wobbly`, `--radius-wobbly-md`, the shadow values) and a `paper-grain` utility to `globals.css`.
- Create reusable pieces in `src/components/sketch/`: `WobblyButton`, `SketchCard` (decorations: tape or tack), `Tape`, `ScribbleArrow`, `StampLabel`.
- Split `NodeFeed.tsx` into `PolaroidNode`, `NoteNode`, `NodeComposer` (form plus live preview), and `DayNavigator`. Data loading, the server actions, reactions, and the solo/shared rules stay the same.
- In `NodeComposer`, an image change handler: if the title has text, prepend it to the description, clear the title, and show a note. When an image is attached, the title is saved as optional.
- Restyle `home/page.tsx` and `GroupManager` to match. Their logic stays the same.

## Reference images
- The reference images haven't arrived yet; only the brief was attached. When you send them, I'll adjust colors and details to match before building.
