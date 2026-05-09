# Test strategy

```
pnpm test              # default suite — 139 unit + integration, no network
pnpm test:coverage     # same + v8 coverage report
pnpm test:e2e          # 12 live tests against mcp.danielsuchan.dev
pnpm test:all          # everything + coverage (network + Neuron budget)
```

## Test pyramid

| Layer | Files | Count | What they prove |
|---|---|---:|---|
| **Unit — pure** | `ai/__tests__/budget.test.ts`, `ai/__tests__/client.test.ts` | 35 | KV-budget arithmetic, JSON-parse fallback, response shape extraction. No SDK, no Hono. |
| **Unit — tool registration** | `ai/__tests__/tools.test.ts`, `__tests__/data-tools.test.ts`, `__tests__/resources.test.ts` | 78 | Each tool / resource: input validation, success path, error path, structured content shape, sanitization. |
| **Integration — protocol** | `__tests__/integration.test.ts` | 13 | Full Hono → MCP SDK → Streamable-HTTP roundtrip via `app.fetch`. CORS preflight. Budget gate. |
| **Integration — server smoke** | `__tests__/server.test.ts` | 11 | Tool/resource manifest, health endpoint, ANSWER_BANK invariants, profile data canonicality. |
| **E2E — live prod** (gated) | `__tests__/e2e-live.test.ts` | 12 | Real Workers AI binding, real KV-backed budget, real public TLS, security posture. |

Total: **139 default + 12 live = 151 tests**, all green.

## Coverage targets

Configured in `vitest.config.ts`:

- **lines / statements / functions: 100%**
- **branches: ≥95%**

Remaining un-covered branches are defensive `instanceof Error` ternaries in
catch handlers — exercising them would require throwing non-Error values
from the SDK, which doesn't happen in practice.

## Patterns + invariants

### `__tests__/helpers.ts`
Single source of truth for the (necessarily fragile) casts that reach into
the MCP SDK's private state (`_registeredTools`, `_registeredResources`).
If the SDK renames those fields, fix it once here, not in every test.

### Mock isolation
Each test creates its own `McpServer` + `vi.fn()` instances. Vitest's
default mock isolation handles cleanup; we don't rely on shared state.

### Sanitization assertions
Every tool that catches a Workers AI error also has a test that:
1. Mocks `ai.run` to reject with a sentinel like `"AccountId=xyz"`.
2. Asserts `isError === true`.
3. Asserts the response **does not contain** the sentinel.
4. Asserts the response **does** contain the generic "AI call failed" message.

This is the load-bearing security guarantee — that internal trace IDs and
account state never reach the public MCP response.

### Data-integrity invariants
`__tests__/data-tools.test.ts` enforces:

- `CHANGELOG` and `BUG_FIXES` sorted newest-first
- No leak markers (`OLAOLA`, `@blaze-it`, `inside.blaze`) in any payload
- No leftover `(#NNNN)` PR-ref suffixes in bullets/titles
- No banned `@blaze.codes` email domain in profile output
- Every `BugFix` has a non-empty `project` + `title >5 chars`

If a future backfill or content edit re-introduces leaks, the build fails.

### Live E2E gating
`e2e-live.test.ts` is gated behind `RUN_LIVE_E2E=1`. The default `pnpm test`
skips it because:

- It hits the public network — flaky CI risk
- It consumes Workers AI Neurons — eats budget
- The same shape is covered offline by integration tests

Run it manually after a deploy to verify the live binding actually works.

## What's not tested (and why)

- **Wrangler config** — `wrangler.toml` parsing/validation isn't a unit
  concern; deploy-time wrangler validates it.
- **Actual model output quality** — testing whether the LLM returns "good"
  summaries requires evals, not unit tests. Out of scope for CI gating.
- **CDN / Cloudflare edge behavior** — testing CDN cache headers, TLS
  termination, etc. belongs in monitoring, not vitest.
