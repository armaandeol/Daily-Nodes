# Ghost loading screens that match the real pages

## Goal
Every loading placeholder should look like a faded, "pencil-sketch" version of the page it stands in for: same header, same widths, same card shapes, same tilts. When real content arrives, nothing jumps or changes shape; it simply fills in.

## What's off today
- **Feed cards (Home):** placeholders are flat dashed boxes in a straight grid. Real logs are tilted polaroids (photo on top, words below) and tilted paper notes with a stamp in the corner, with more vertical spacing.
- **Home:** the group strip placeholder is a plain bar; the real one is a small wobbly pill. The add button placeholder is a pink circle with no shadow. The "today's page" divider with its count is missing, and the day switcher looks different.
- **Group area while loading:** shows a grey spinner with "Loading group..." in off-palette grey, not the Roz style.
- **Loading more logs:** a grey spinner instead of the sketch style.
- **Explore:** the profile photo placeholder is a plain square; the real one is a tilted, taped polaroid. Stats, lead story, pull quote and "For Tomorrow" sections don't match their real ticket stub / polaroid / sticky-note / index-card shapes.
- **Profile:** the avatar, calendar sheet and form placeholders don't match the scrapbook calendar (sticky-note month label, tape corners, grid paper) or the tilted taped avatar.

## What changes
1. **One shared "ghost" look.** Placeholders use faded paper colors, wobbly borders, and a soft hard-edged shadow at low strength. Instead of a flashing pulse, a gentle pencil-shading shimmer, which goes still when the device's "reduce motion" setting is on.
2. **Ghost feed cards.** Alternate ghost polaroids and ghost notes with the same tilts, padding, photo frame shape, stamp spot and reaction row as real cards, in the same two-column grid and spacing.
3. **Home ghost.** Exact masthead (explore link, "Roz.", avatar), greeting lines with a faint scribble, day-switcher shape, group pill, red add button with its shadow, "today's page" divider, then ghost cards.
4. **In-page loading.** The group area and "loading more" use small sketch placeholders (ghost pill, a faint ghost card) instead of grey spinners.
5. **Explore ghost.** Same nav (home link, three paper buttons, taped tilted avatar), masthead, four tilted ticket stubs, lead story with stamp + polaroid, a sticky note and an index card.
6. **Profile ghost.** Same masthead, tilted taped avatar polaroid, scrapbook calendar sheet (sticky-note month label, corner tape, 7-column grid paper), and form rows.
7. **Quick check:** take side-by-side screenshots of each ghost against the loaded page to confirm sizes line up. (Signed-in pages can only be compared if a session is available.)

## Technical details
- All ghosts stay in `src/components/sketch/PageMotion.tsx` (shared module, per project convention); add small building blocks (`GhostBlock`, `GhostPolaroid`, `GhostNote`, `GhostStub`, `GhostAvatar`) reusing `Tape`, the `TILTS` array, wobbly/shadow utilities and real card class names so sizes track the real components.
- Add a `ghost-shimmer` utility in `globals.css` under `motion-safe`.
- Replace the spinners in `GroupManager.tsx` and `NodeFeed.tsx` (load-more) with ghost pieces; no data logic changes.
- `home/loading.tsx`, `explore/loading.tsx`, and the Profile loading return keep pointing at the updated ghosts.
