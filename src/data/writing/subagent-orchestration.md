---
title: How I orchestrate 14-20 narrow subagents per user via LLM classification
slug: subagent-orchestration
date: 2026-05-01
status: drafting
topic: multi-agent
teaser: Routing logic without hand-rolled if/else — how Dzarvis decides which subagent to spin up, when to spawn vs reuse, working memory across sessions, and the part nobody writes about — when NOT to call the model at all.
---

# How I orchestrate 14-20 narrow subagents per user via LLM classification

Most multi-agent systems I've read about have one design flaw in common: they assume the routing problem is solvable with code. It's not. Or rather — it is, until you actually try to use the system, and then you discover that the routing rules you wrote yesterday don't match the user requests you got today, and the routing layer is now the bottleneck.

This is what I learned moving Dzarvis — a multi-agent assistant on Claude — from a hand-rolled router to an LLM-classification router that picks between 14-20 narrow subagents per user. The post is about the routing layer specifically: the spawning logic, the reuse policy, the cross-session memory, and the case nobody writes about — when the right answer is to skip the model entirely.

## The problem with `if/else`

The first version of the orchestrator had a hand-rolled router. The user request came in, a function ran a series of regex checks and string contains, and the matching subagent got dispatched. This worked for the demo. It survived for about three days in beta.

What broke it:

- A user asked "can you check if my mortgage rate is competitive" — which I'd routed to the `finance` subagent. The user actually wanted the `legal` subagent because the question was about a contract clause.
- A user asked "schedule a call with my CPA next Tuesday" — three subagents could plausibly handle this: `calendar`, `contacts`, and `tasks`.
- A user asked "summarize the meeting I had this morning" — which subagent owns "meeting"? `calendar`? `recordings`? `notes`?

The if/else router has no way to disambiguate between subagents that are individually plausible candidates. You can keep adding rules until you've built a worse version of a classifier. I did that for two days before giving up.

## Why an LLM is the right router

The replacement is a small, fast classifier model that takes the user's request and returns a ranked list of subagent slugs. The classifier has access to:

- The list of available subagents and a one-line description of each.
- The user's recent conversation history (last ~10 turns).
- A small set of "non-routing" exits ("respond directly", "ask for clarification", "skip to background task").

The classifier doesn't *do* anything. It just produces a routing decision. The decision is then validated against the available subagent list and dispatched.

What this gets you that if/else can't:

- Disambiguation across plausible candidates ("schedule a call with my CPA" → `calendar` because the user mentions "next Tuesday" + "schedule", not `contacts`).
- Context awareness ("summarize the meeting I had this morning" → `recordings` if the user has been talking about a meeting bot in recent turns, `calendar` otherwise).
- Graceful failure ("respond directly" — for cases where no subagent is the right answer and the orchestrator should just answer in plain text).

The cost is that the classifier itself is a model call. So the question becomes: can you afford to pay for that call on every user turn? The answer is yes, if you pick the right model. I use Gemini Flash Lite for classification, which costs roughly nothing per call relative to the downstream Claude Sonnet calls. The classifier is the cheapest part of the loop, not the most expensive.

## Spawn vs reuse

Once the classifier picks a subagent, the next decision is whether to spawn a fresh instance or reuse one that's still warm.

The naive answer is "always spawn fresh — it's cleaner." This produces a system that is slow and expensive. Every spawn pays a cold-start cost: model context warm-up, tool-list loading, memory hydration.

The other naive answer is "always reuse — it's fast." This produces a system that leaks state between sessions. The `finance` subagent that just helped a user think about their mortgage shouldn't have that mortgage context still in memory three hours later when a different user's request comes in.

The actual answer is per-user persistence with an aggressive reset policy:

- Subagent instances are scoped to the user. One user's `finance` subagent never sees another user's `finance` subagent's memory.
- Within a user's session, subagents are reused for ~5 minutes of inactivity, then reset. The 5-minute window is long enough to handle natural conversation flow ("ask about mortgage" → "and what about insurance" → "and how does that compare to last year") but short enough to avoid stale context bleeding into unrelated requests.
- Reset is hard, not soft. The subagent's working memory is dropped, not summarized. (Summarization across resets is its own problem; doing it badly is worse than doing it not at all.)

In Dzarvis this means I'm running 14-20 narrow subagents per active user — not 14-20 globally. Per-user. The implication: the system scales linearly with concurrent users, not super-linearly with the total subagent surface. Every subagent gets reset on its own clock; I'm not coordinating across users.

## Working memory across sessions

The harder question: what gets persisted across sessions?

The wrong answer is "everything in a vector database, retrieve the top-K most similar". This works in the demo and fails in production because vector retrieval is fuzzy in a way users find frustrating. They expect "the thing I told you yesterday" to be retrievable verbatim, not as a semantically-close paraphrase.

The right answer in my experience:

- **Structured memory** for facts the user explicitly stated ("my CPA is Lucie", "the meeting is on Thursday at 3pm") — these go into a typed key-value memory that the orchestrator can hand to subagents on dispatch. The keys are typed; the retrieval is exact.
- **Conversational memory** for recent turns — last ~10 turns are passed verbatim, not summarized. Cheap because Claude's context is large, and verbatim is what users expect.
- **Pattern memory** for routing decisions — the orchestrator remembers which subagent it picked for similar past requests, biases the classifier toward those, but doesn't override it. This is the layer where vector retrieval is actually appropriate, because it's a hint to the classifier, not user-facing.

The result is that "the thing I told you yesterday" is retrievable exactly, and the routing layer gets gradually better at user-specific patterns without requiring offline re-training.

## When NOT to call the model at all

This is the section that I think most multi-agent systems get wrong by default, and it's the section I want to spend the most time on.

Every model call costs money and adds latency. Every multi-agent system is going to make a lot of model calls. Therefore, every multi-agent system needs an aggressive answer to "do we actually need a model call here?"

The cases where the answer is "no, skip the model":

- **Identity-preserving operations.** "What's my email address?" doesn't need a model. It needs a lookup against the user's profile and a verbatim response.
- **Cached previous answers.** If the user asked "what was the score of the Knicks game" five minutes ago and is asking again now, the answer is identical and doesn't need a fresh API call to the news API, much less a fresh Claude call.
- **Deterministic transformations.** "Format this list as bullet points" can be done with a one-line string operation. Sending it to Claude is a billing decision, not a correctness decision.
- **Empty-query edge cases.** "Hi", "thanks", "ok" — these are conversational acknowledgments, not requests. Respond with a templated reply and don't burn a model call.

In Dzarvis I have a "pre-classification" layer that runs before the LLM classifier. It catches these cases with simple rules and short-circuits the rest of the pipeline. The pre-classification layer is the most important code in the orchestrator by a wide margin, because it's the only layer that can take a request OUT of the model-call path entirely.

The metric I watch is: what fraction of user turns trigger zero model calls? Right now it's around 30-40% on a typical day, and that fraction is the largest single driver of the per-user cost holding flat at $6/day.

## The summary

A multi-agent orchestrator is not a routing system. It's a budget allocator. The model calls cost money. Every layer of the system either justifies a model call or eliminates one. The hard work is on the elimination side, not the routing side.

The routing side is solved by an LLM classifier with a small fast model. That part is tractable. The elimination side is where the real engineering happens — pre-classification rules, aggressive caches keyed on user identity, structured memory that returns verbatim, conversational memory that doesn't compress, and a hard answer to "do we actually need a model call here" before every subagent dispatch.

If your multi-agent system is expensive in production, it's almost never the agents that are the problem. It's the routing layer asking the wrong question.

---

If you're building a multi-agent harness in production and want to compare notes, I'm at [mr.sucik@gmail.com](mailto:mr.sucik@gmail.com). Always interested in how other teams structure their orchestrator's elimination layer.
