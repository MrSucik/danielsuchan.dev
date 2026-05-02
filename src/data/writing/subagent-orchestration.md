---
title: How I orchestrate narrow subagents via LLM classification
slug: subagent-orchestration
date: 2026-05-01
status: drafting
topic: multi-agent
teaser: Routing logic without hand-rolled if/else — how a multi-agent harness decides which subagent to spin up, when to spawn vs reuse, and the part nobody writes about — when NOT to call the model at all.
---

# How I orchestrate narrow subagents via LLM classification

*Draft in progress.*

Writing this one up properly. Topics I want to cover when it's ready:

- Why hand-rolled if/else routing breaks once real users start asking ambiguous questions.
- Using a small, fast classifier model as the router — and why the classifier is the cheapest part of the loop, not the most expensive.
- Spawn vs reuse: per-user persistence with aggressive resets, and why hard reset beats summarized reset.
- Working memory split: structured (typed key-value) for verbatim recall, conversational (recent turns verbatim) for context, pattern (vector retrieval) only as a hint to the classifier.
- The most important part of the orchestrator — the elimination layer that takes requests OUT of the model-call path entirely.

Full version when I'm satisfied with what I can share publicly.

— Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))
