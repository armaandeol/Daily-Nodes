# Explore page: carry the Roz scrapbook-newspaper style

The Explore page keeps its newspaper structure (masthead, lead story, pull quote, circle, pivot) and works exactly as it does now. Only the look changes, to match Home, Profile and the group book.

## What changes

- **Background and masthead:** warm paper with the dot grain, "Roz." masthead in the serif with double rules, the edition line ("Evening Edition · Sunday, 18 October") in small mono, and the streak shown as a red marker circle with a tiny star doodle.
- **Edition navigation:** "← older / latest / newer →" become small wobbly paper buttons with hard shadows; disabled ones look faded and erased. Profile photo stays top-right as a tilted taped polaroid, like Home.
- **Stats strip:** the four boxes become ticket stubs / torn paper slips, slightly tilted, with handwritten labels and big serif numbers.
- **Lead story:** section label as a red rubber-stamp imprint (same stamp look as categories), headline in big serif with a red scribble underline, story text in Patrick Hand. The photo becomes a taped polaroid with the caption handwritten in its bottom margin (no text over the photo), warm faded look that returns to colour on hover.
- **Pull quote:** instead of the black block, a large yellow post-it pinned with a red tack, quote in Kalam handwriting with hand-drawn quote marks.
- **Circle section:** same polaroid + stamp treatment. The "Wanted: A Circle" classified becomes a taped clipping with a dashed wobbly border and a small hand-drawn arrow.
- **Pivot ("For Tomorrow"):** a lined index card with a red margin line and an ink-blue handwritten note.
- **Empty / missing edition:** a sketched note card with a doodle arrow pointing back to Home.
- **Motion:** sections drop and settle one after another on load; switching editions slides the paper left/right depending on older/newer. Respects reduce motion. Loading keeps the existing ghost page.

## Not changing

Data fetching, the edition history rules (only real generated editions, no invented dates), links, and page metadata.

## Technical details

- Edit only `src/app/explore/page.tsx`; replace hardcoded `neutral-*`, `red-600`, `#faf8f5` colours with the existing tokens (paper, pencil, marker, ink, postit, erased) and `wobbly`, `shadow-hard`, `paper-grain`, `vintage-photo` utilities.
- Small client component `src/app/explore/EditionMotion.tsx` for the staggered entrance and edition slide (page stays a server component).
- Reuse `Tape`, `Tack`, `Scribble`, `ScribbleArrow` from the sketch module and the category stamp style from `NodeCards`/`LogPaper`.
- Existing `edition-history` test keeps passing.
