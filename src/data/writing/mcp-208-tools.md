---
title: Building a 208-tool MCP server
slug: mcp-208-tools
date: 2026-05-09
status: drafting
topic: architecture
teaser: Notes from running one MCP server with 208 tools behind a multi-agent harness — tool taxonomy, subagent dispatch, the autonomous skill-from-failure loop, dual-review on high-stakes domains, and the cache layer that keeps the bill survivable.
---

# Building a 208-tool MCP server

Dzarvis is a multi-agent assistant on Claude. The tool surface is one MCP server with 208 tools at the time of writing. As far as I know that is the largest single MCP integration outside Anthropic itself. Public surface: [mcp.danielsuchan.dev](https://mcp.danielsuchan.dev), [github.com/mrSucik](https://github.com/mrSucik), and the architecture write-up at [/case-studies/dzarvis](/case-studies/dzarvis).

This post is about what 208 tools in one process actually costs, and the patterns that survived contact with real users.

## The constraint — why one MCP, not many

The reflex when you hit 208 tools is "split the server." That instinct is wrong for this codebase, and the reasons are worth writing down.

The shared MCP gives me one place to enforce three things:

- **One tool contract per action.** Same Zod schema, same error envelope, same auth boundary. A tool added by Tuesday's subagent looks identical to a tool from six months ago.
- **One audit log.** Every call goes through the same recorder. I can replay any session against any subagent without coordinating across processes.
- **One budget enforcer.** Per-agent monthly dollar caps live next to the tool registry. Caps applied in N processes will drift; caps applied in one cannot.

The cost is real. With 208 tools, listing the manifest in every planner context window is prohibitively expensive — both in tokens and in the planner's ability to reason about which tool to pick. I do not send all 208 to the planner. I send a domain-scoped manifest based on the routed intent, and the subagent receives only the tools it owns. The planner sees roughly `[NEEDS NUMBER]` tools per turn. The full registry is a deployment artifact, not a context-window artifact.

The lesson: tool count is a deployment concern. Tool *visibility per call* is the design concern.

## Tool taxonomy

Tools are organized by domain, not by feature. Domains map roughly to a coherent verb space — "things you can do with email," "things you can do with calendar," "things you can do with a knowledge base." A new tool gets filed under the domain that owns its side effects, not the workflow it was added for.

Each tool definition is one record:

```ts
type ToolDef<I, O> = {
  name: string;          // e.g. "calendar.events.list"
  domain: Domain;        // closed enum, ~20 values
  inputSchema: ZodType<I>;
  outputSchema: ZodType<O>;
  handler: (input: I, ctx: ToolCtx) => Promise<O>;
  budget: BudgetTag;     // which agent profile pays
  stakes: "low" | "medium" | "high";
};
```

The registry is a flat map keyed by `name`. The MCP server enumerates it at boot, computes the domain index, and exposes a `tools/list` filtered by domain when a subagent asks. Tools are never registered at runtime. New tools require a deploy. This is on purpose — it keeps the audit log honest about what the server could do at any timestamp.

The naming scheme matters more than I expected. Dot-separated `<domain>.<entity>.<verb>` is enforced by a unit test. Without that test the registry drifted toward two tools meaning the same thing within a month, because subagents that learn from failures (more on that below) tend to invent close-but-not-identical names.

## Subagent dispatch

The planner is one Claude instance with the planner system prompt and the domain-scoped manifest. Its only job is to choose:

1. Which subagent to dispatch.
2. What inputs to hand it.
3. Whether to spawn a fresh subagent or reuse a warm one.

Spawn vs. reuse is the unobvious decision. A warm subagent has its short conversational memory; a fresh one does not. For independent steps in a multi-step plan, fresh is correct — the planner's context is the only place the cross-step state lives, and a warm subagent can confuse its own previous plan with the current one. For tightly-coupled refinement loops ("rewrite this draft, now make it 30% shorter") warm is correct.

The default is fresh. Reuse is opt-in via a planner annotation on the dispatch:

```ts
type Dispatch = {
  subagent: SubagentName;
  input: unknown;
  reuse?: { sessionId: string };  // opt-in
};
```

I used to default to reuse. It produced a class of bugs I now recognize on sight: a subagent confidently citing a fact that came from a previous user's session, because the cache key was the subagent name and not the user. Default-fresh is one of those decisions where being wrong is much worse than being slow.

Independent dispatches run in parallel. The planner emits a list of dispatches per turn, the harness fans them out, and the planner waits on the join. Concretely, parallel dispatch is the difference between "block next Tuesday based on email + calendar + capacity" feeling instant vs. feeling like a sequential agent demo. I wrote this myself the first time and the bug was the obvious one: the join waited on the slowest, but the planner had already started its next turn against partial results. The fix is boring: explicit barrier semantics on the dispatch list, the planner cannot read a dispatch's output until the barrier resolves.

## Failure as a first-class feed

The most counterintuitive piece of the system: **failure is the input to the skill registry, not the exception path**.

When a subagent fails in a recoverable way — wrong tool argument, missing capability, output that fails verification — the harness writes a failure record:

```ts
type FailureRecord = {
  subagent: SubagentName;
  intent: string;          // what the user actually wanted
  attempt: ToolCallTrace;  // what the subagent tried
  failureMode: "tool-not-found" | "schema-mismatch" | "verification-failed" | "tool-call-loop" | ...;
  recoverable: boolean;
};
```

A nightly job reviews recoverable failure records and drafts new skills — a skill being a parameterized, named recipe over existing tools. If a draft skill survives a separate verifier model running it against a held-out replay of the failure, it gets registered. The next time the same intent class shows up, the planner has a path that did not exist last week.

Two things matter about this loop:

- **It is bounded.** Skills are recipes over the existing 208 tools. They cannot expand the action space. If the user actually needs a new tool, the loop produces a failure record that a human reviews. The autonomous part is "compose existing tools into named patterns," not "decide what the system can do."
- **The verifier is the bottleneck.** A skill that passes drafting but fails on the held-out replay does not register. This is what stops the system from learning superstitions — patterns that worked once because of an irrelevant correlation in the original failure context.

The number of skills auto-promoted vs. drafted vs. rejected over the last 30 days is `[NEEDS NUMBER]` / `[NEEDS NUMBER]` / `[NEEDS NUMBER]`. The rejected count is the one to watch. If it goes to zero the verifier is too lax.

## Dual-review on high-stakes outputs

Most agent outputs are low-stakes. "Block 2pm Tuesday." "Draft a Slack reply." Wrong is annoying, not damaging. Some outputs are not like this. Health, finance, legal — wrong here can be expensive or genuinely harmful.

The harness runs a domain detector on every subagent output. The detector is keyword-based with a minimum-hit-count, not an LLM call — domain detection is the wrong place to spend a model invocation, because it is in the hot path of every response. If the detector returns a non-empty domain set, the response goes through a verifier model before it reaches the user.

The verifier model is intentionally not the producer model. A different model with a verification-shaped prompt catches a different distribution of failures than the same model second-guessing itself. The verifier returns one of three states:

```ts
type VerifyResult =
  | { verified: true }
  | { verified: false; reason: string }
  | { verified: false; degraded: true; reason: "verifier-unavailable" };
```

The third state is the load-bearing one. If the verifier model is rate-limited or down, the system does not silently skip verification. It returns `degraded: true`, and the harness presents the response to the user with a `degraded` flag visible in the response envelope. The default for `verified` when verification cannot run is `false`, not `true`. Fail-safe, not fail-open.

The cost of dual-review on every output would be unacceptable. The cost of dual-review only when the keyword detector fires is `[NEEDS NUMBER]`% of total inference spend, which is a price I am happy to pay.

## Cost & cache

Three caching layers, one budget enforcer.

**Content-hash cache for expensive file processing.** Any tool that reads or processes a file computes a `sha256` over the buffer, then looks up `(userId, contentHash)` in a small Postgres table. Cache hits skip the work entirely. The compound unique key is per-user — sharing a hash across users would be a tenancy bug, even though it would be a tempting cost optimization. Different users uploading the same PDF is exactly the situation where you find out your cache key was a security boundary.

**Anthropic-style prompt caching via OpenRouter.** The planner's system prompt and domain-scoped manifest are stable across a conversation. Marking them as cache-eligible drops planner cost by `[NEEDS NUMBER]`%. The unobvious part: cache-eligible content has to be byte-identical, so the manifest has to be deterministically serialized. I had a bug where two equivalent manifests differed in key order, the cache rate dropped to near-zero, and nothing in the API surfaced the miss. Now the manifest serializer is a single function with a snapshot test.

**Per-agent monthly budget.** Each subagent has a `BudgetTag` and a monthly dollar cap. Budgets are checked before dispatch, not after. A subagent that hits its cap returns a structured `BudgetExceeded` to the planner, which can either route to a different subagent or surface to the user. Budgets are visible to the user — if you want to know why your `documents` subagent is being slow this week, the answer is in the budget panel.

A pattern I keep running into: budgets are easier to reason about than rate limits, because they compose. Two subagents with $10/month caps can serve a request that costs $5 + $5; two subagents at 100 RPM each cannot serve a 200 RPM burst without coordination. Dollars compose, requests-per-minute do not.

## The hardest debugging moment

Pick one. I will pick the meta-reply detector.

A subagent shipped a response that said something like "I have updated your calendar based on the email." It had not. The tool call had failed with a schema error, the subagent had recovered into a "summarize what I tried to do" path, and the surface text read as if the action had succeeded.

This is the worst class of bug in an agent system. The user reads a confident summary. The world has not changed. There is no error visible. Trust collapses on the next interaction.

The fix shipped on `[NEEDS DATE — verify against changelog]`: a meta-reply detector that runs over every final response and looks for *claims of completed action* without *corresponding successful tool calls in the same turn*. Concretely, the detector compares the verbs in the response surface against the verbs of `commit`-class tool calls in the trace. If the response says "updated" but no `update`-class tool call succeeded in the trace, the response is rejected and the subagent is asked to retry with the correction `do not claim completion of tool calls that did not succeed`.

What I learned: agent systems need a layer that audits the surface text against the ground truth of what tools actually did. The model will produce coherent text whether or not the world changed. The harness has to know the difference.

## What I would build differently if starting fresh today

One thing. I would have made the failure record schema part of the tool contract from day one, instead of bolting it on later. Today, every tool emits a structured failure when it fails. Originally, only some did, and the autonomous skill-from-failure loop spent its first month producing low-quality drafts because half the failure records were unstructured strings. The cost of the retrofit was higher than the cost of getting it right at design time — which is the usual lesson, except agent harnesses make it expensive in a particular way: the loop is *learning from your failure schema*, so a bad schema is a bad teacher.

Everything else I would build close to the same way. One MCP server. Domain-scoped manifests. Default-fresh subagents. Dual-review on high-stakes domains. Content-hash cache with per-user keys. Budgets in dollars, not RPM.

The public version of the MCP is at [mcp.danielsuchan.dev](https://mcp.danielsuchan.dev) — it is a smaller subset, but the contracts are the same. The full system is in stealth fine-tuning with 15 paying customers and is not public. If you are at a frontier lab and want to talk about agent harness design, the email below works.

— Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))
