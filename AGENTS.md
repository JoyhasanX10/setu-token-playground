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

- Keep dashboard motion primitives and easing in src/styles.css so section, balance, and modal animations stay consistent and honor reduced-motion preferences.
- Keep MetaMask provider discovery and connection lifecycle in browser-safe wallet modules, separate from locally stored demo balances; never restore wallet identity from demo storage.
