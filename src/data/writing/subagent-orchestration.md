---
title: How I orchestrate narrow subagents via LLM classification
slug: subagent-orchestration
date: 2026-05-10
status: published
topic: multi-agent
teaser: Routing logic without hand-rolled if/else — how a multi-agent harness decides which subagent to spin up, when to spawn vs reuse, and the part nobody writes about — when NOT to call the model at all.
---

# How I orchestrate narrow subagents via LLM classification

Routing to subagents is where multi-agent systems usually go wrong. Notes from running ~30 narrow specialists in production.

## Hand-rolled if/else breaks fast

Every multi-agent harness starts with a router built from `if (text.includes("calendar"))`. It works for a week. Then a real user asks something ambiguous, you hand-write a third condition, then a fourth, and three months later you have a 400-line cascade with no tests and a habit of misrouting anything that mentions two domains.

The exit ramp is a small classifier model. Not a big router model — a small, fast one whose only job is to pick the right specialist. Send it the user message + a short list of available subagents and their domains. Ask for a label. Done.

## The classifier is the cheapest part of the loop

Counterintuitive but consistent: routing is rarely the expensive call. The expensive call is whatever the specialist does next — a tool execution, a long-context retrieval, a multi-step plan. So stop optimizing the classifier and start optimizing the elimination layer (more on that below).

A small router model also gives you something a hard-coded cascade cannot: graceful degradation. When the classifier is uncertain, ask it for a confidence score. If it's low, surface "I'm not sure what you want" instead of routing wrong silently.

## Spawn vs reuse: hard reset beats summarized reset

Per-user agents accumulate state. Two strategies for keeping them honest:

- **Summarized reset** — every N turns, compress the prior conversation and seed the next session with the summary
- **Hard reset** — drop everything, start fresh, accept that the agent forgets the conversation

Summarized reset sounds smarter. In practice it caches subtle hallucinations that compound over weeks. The agent starts believing things that were once said and never corrected. Hard reset wins. Persistence belongs in structured stores, not in the agent's working memory.

## Working memory has three layers

- **Structured** — typed key-value, verbatim recall (calendar entries, contact records, task IDs). Source of truth.
- **Conversational** — the recent N turns verbatim, no compression. Use for "what did I just say."
- **Pattern** — vector retrieval, used as a *hint* to the classifier, never as ground truth.

Mixing them produces agents that confidently misremember. Keeping them separate produces agents that say "I don't know" more often, which is usually correct.

## The most important part is the elimination layer

The biggest performance win is the layer that takes requests OUT of the model-call path entirely. Cached answers, deterministic short-circuits, "this isn't a question" gates, "the user already asked this an hour ago" gates.

If you are routing 100% of incoming messages to an LLM, you are paying for nothing 30%+ of the time. The agent is doing real work on 70% of calls and theatrically processing "thanks" on the other 30%. The fix is unsexy: a small set of regex + context checks at the front, ahead of any model call.

This is the part of the orchestrator that nobody writes blog posts about, and it is the highest-impact optimization in any production multi-agent system.

---

*Working note. The full version goes into the classifier prompt structure, the elimination-layer rule set, and the failure modes I have not yet solved. — Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))*
