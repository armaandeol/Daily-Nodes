<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Shared paper entrance animations and ghost placeholders live in the sketch UI module, so Home and Explore maintain consistent loading states and reduced-motion behavior.
- Explore navigation selects existing generated edition IDs from the backend history, rather than inventing digests for dates with no edition.
