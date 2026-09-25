# Agent instructions

- Read `docs/system-requirements.md` and `CONTRIBUTING.md` before changing product behavior.
- Implement only the requirement the user selected. Do not build the full tracking system from its specifications in one pass.
- Keep this scaffold placeholder-only: no location capture, authentication, device enrollment, map, or product database schema unless a later selected OpenSpec change calls for it.
- Follow the canonical SQL-file rules in `database/README.md`; do not add a separate migration history or commit secrets from `.env`.
- Run component checks from `/workspace` in the development container:
  - `cd /workspace/api && go test ./...`
  - `cd /workspace/android && ./gradlew assembleDebug testDebugUnitTest`
  - `cd /workspace/web && pnpm install --frozen-lockfile && pnpm build`
- Use `openspec validate <change-id> --strict` for OpenSpec changes.

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
