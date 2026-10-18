# Scrapbook calendar on the profile page

Goal: photo days look like small torn, aged snapshots glued into a scrapbook, the red "log density" color stays clearly visible on every logged day, and the whole calendar gets a playful scrapbook feel.

## Photo days — torn vintage snapshot
- Each photo sits on a cream paper backing with a **torn, uneven edge** (jagged outline, like the reference), not a rounded rectangle.
- Light **aged look**: slight sepia/warm tone and a faint paper texture over the image; full color comes back when you hover or tap.
- Small random tilt per day and a tiny strip of washi tape or photo corner on some cells, so no two look identical.
- Photo is smaller than the cell so a clear **ring of the red wash shows around it** — the density color is always readable.

## Background color always visible
- The red wash fills the full cell behind the photo (not just a strip), at the same three strengths as today (light / medium / strong).
- Wash drawn as a slightly uneven marker swipe rather than a flat block, so it reads as hand-colored.

## Scrapbook touches on the calendar itself
- Calendar sheet looks like a page pasted into a notebook: torn top edge, two tape strips at the corners, faint lined/grid paper behind the days.
- Month title written on a little paper label that's taped on, with small hand-drawn arrows for previous/next month.
- Today's date circled in red marker.
- Legend becomes small torn paper swatches with a handwritten "less → more".
- A couple of tiny doodles (star, paperclip) in the margins, kept subtle.
- Days with no logs stay faded and not clickable (unchanged).

## Motion
- When the month changes, photos "drop and settle" into place one after another (gentle, quick); respects reduced-motion settings.

## Technical details
- Changes limited to `src/app/profile/ActivityCalendar.tsx` and a few reusable utilities in `src/app/globals.css` (torn-edge `clip-path` polygon utility, sepia filter, paper noise via SVG data URI).
- Torn edge: a few precomputed jagged `clip-path` polygons picked deterministically by date, so server and browser render the same.
- Wash: absolute `inset-0` layer with the existing marker opacity classes plus an irregular border radius.
- Framer Motion stagger for photo entrance; uses existing tokens only (paper, pencil, marker, postit, ink), hard offset shadows, no blur.
