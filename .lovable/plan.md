# Scrapbook group settings window

Goal: the "Manage" group window becomes a scrapbook notebook — Overview, Members and Settings are pages you flip between, all in the Roz scribble style. Nothing about what the window does changes (rename, bio, invite link/code, regenerate, remove member, leave group).

## The notebook frame
- Window looks like an open scrapbook on a dimmed desk: cream grid paper, wobbly pencil border, hard offset shadow, two tape strips on top corners, a faint spiral/binding edge on the left.
- Title "Group Settings" in Playfair with a red marker scribble underline; the close button is a red hand-drawn × in the top-right corner (same as the log form).
- Tabs become paper index tabs sticking out of the top edge (yellow post-it, blue ink, red marker colors). The active tab sits flush with the page and is slightly raised; others are tucked behind and tilted.

## Page flip animation
- Switching tabs flips the page like a book: the old page turns away around the binding edge and the new one settles in, with a soft paper shadow sweep. Direction follows tab order (forward/back).
- Quick (~0.45s); with reduced motion it simply cross-fades.

## Overview page
- Group name on a taped paper label; "edit" is a small handwritten pencil link. Editing uses wobbly inputs with Save (marker button) and Cancel (paper button).
- Bio on a lined post-it note, handwritten font; "+ add a bio" as a dashed scribble box for admins.
- Stats as two small polaroid-style ticket stubs: member count and "started" month, with stamped labels.
- Invite section as a torn ticket: link and code in mono type on a dashed cut-line, "copy" buttons that stamp "copied ✓", regenerate as a handwritten link with a little circular arrow doodle.

## Members page
- Each member is a mini polaroid/name tag in a loose tilted grid (tilt picked per member so it stays stable), initial in a hand-circled avatar.
- "ADMIN" as a red stamp; "(you)" written in blue ink with a small arrow.
- Remove button: small red × sticker on the card corner, asks for confirmation as before.
- Cards drop in one after another when the page opens.

## Settings page
- "Group info" as an index card with ruled lines (ID, created date, your role).
- Danger zone as a red-bordered warning note with diagonal caution stripes drawn in marker, explanatory text handwritten; "Leave group" as a red marker button.
- Error messages appear as a small red post-it at the top of the page.

## Technical details
- Only `src/app/home/GroupManager.tsx` (modal section) changes, plus maybe a `scrapbook-tab` / `page-flip` helper in `src/app/globals.css`. Data handlers and state untouched.
- Reuse `Tape`, `StampLabel`, `Scribble`, `WobblyButton` from the sketch module and existing tokens (paper, pencil, marker, ink, postit, erased); hard shadows only.
- Flip via Framer Motion `AnimatePresence` with `rotateY` around the left edge (`transformOrigin: left`, `perspective` on container) and direction state; `useReducedMotion` fallback to opacity.
- Modal open/close gets a small "slide up and settle" entrance, Escape closes.
