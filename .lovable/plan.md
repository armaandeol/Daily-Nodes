# Log entry + feed polish

## 1. Heading stays a heading
- Remove the "heading moves into the description when a photo is added" rule from the log form (and the little "moved your heading" note).
- Photo logs keep their own heading; the polaroid shows the heading in handwriting under the photo, description below it — still never over the image.
- Update the saved project rule and the old test to match.

## 2. Category colours
Each category gets its own paper tone, used as a small colored chip on cards, in the category picker and in the preview:
- Study: ink blue
- Custom: marker red
- Other: post-it yellow / pencil
- Any remaining categories get a distinct muted tone (green, orange) from the same palette.

## 3. Photo cards: category visible
- Move the category chip to sit on the polaroid's white frame, top-left above the photo edge (like a stamped label), with the tape shifted so nothing covers it.

## 4. Remove "note" / "photo" tags
- Delete the "◉ photo" and "✎ note" stamps on feed cards and in the composer preview.

## 5. Smaller Manage group box
- Shrink the group box to a slim single-line strip (icon, name, member count, small "manage" button) that only takes the width it needs instead of the full row, restyled in the sketch look (no grey/black default styling).

## 6. Log styles to choose from
A "style" picker in the log form with 4 options, shown live in the preview and applied to the card in the feed:
- **Post-it** — yellow sticky note with tack (current default)
- **Lined paper** — ruled notebook sheet with red margin
- **Index card** — white card with blue top rule and corner tape
- **Torn scrap** — kraft/cream scrap with torn edge and tilt
Photo logs use matching frame variants (polaroid, tape-only, etc.). The choice is held in the form as a `style` value and passed along with the log so you can wire it to the backend; cards fall back to Post-it when no style is stored.

## Technical details
- Files: `NodeComposer.tsx`, `NodeCards.tsx`, `feed-types.ts` (add `color` to `CATEGORIES`, add `LOG_STYLES` + `style?` on `NodeData`, drop `mergeHeadingIntoDescription` usage), `GroupManager.tsx` compact card, `__tests__/feed-types.test.ts`.
- `style` is appended to the existing create form data as `style`; backend ignores unknown fields until wired.
- Update memory rule about headings.
