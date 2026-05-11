---
title: Why I deleted half my landing page
slug: honest-audit
date: 2026-05-09
status: published
topic: process
teaser: An honest audit of my own marketing copy, what I cut, and the rule I'm using going forward. The market knows when you're stretching. The cheaper move in 2026 is to say things that are verifiably true.
---

# Why I deleted half my landing page

I shipped an honest audit of this site last week. The diff:

- Removed: fabricated metrics on the Dzarvis page (subagent counts that weren't accurate, latency claims I hadn't actually measured)
- Removed: a Dzarvis pricing table that wasn't real yet
- Removed: composite testimonials — quotes that weren't traceable to a single named customer
- Kept: the architecture description, the open-source MCP server, the case study with a real named customer behind it

The part that stings: I wrote most of the deleted copy myself, and I knew at the time it was load-bearing on optimism rather than evidence. The internal justification was "the directionally correct version" — that this is what we'll be in six months, so it's fine to claim it now.

It isn't fine.

## The cost of even small lies

The model I had in my head was: minor exaggeration → faster funnel → real customers → claim becomes true retroactively.

The model that actually plays out: minor exaggeration → prospects who care about precision detect it → those prospects are the same ones who would have been your best customers → you keep the bottom-half of the funnel and lose the top.

Buyers in B2B AI right now are exhausted from vendors over-claiming. Every demo is rigged, every benchmark is cherry-picked, every "customer logo" is a free trial that lapsed six months ago. The market knows this. Saying things that are *verifiably true*, even if they're less impressive, is a stronger position than the typical landing page.

## The rule going forward

For everything I publish on this site about Dzarvis, Blaze, or any project:

1. **Numbers are auditable.** Every claim links to a public commit, a benchmark script, or a named customer who agreed to be referenced.
2. **No fake constraints.** "First 50 customers" only when there is, in fact, a queue of 50 people. Otherwise it's just a number.
3. **No composite testimonials.** If I can't ship a real quote with a real name, I don't ship a quote at all.
4. **Working software over stated capability.** Replace "Dzarvis has X" with "here's Dzarvis doing X" wherever possible.
5. **Public changelog as primary marketing.** If I haven't shipped it this month, I'm not claiming it.

## What survived the audit

The things that survived are stronger because the surrounding noise is gone:

- `mcp.danielsuchan.dev` is a real public MCP server with 100% test coverage on logic, daily-budget circuit breakers, and Cloudflare Workers AI bindings. Anyone can call it right now.
- `/case-studies/dzarvis` describes one specific customer's workflow, with their permission.
- `/labs` ships two demos you can run yourself — a subagent decomposer and an MCP inspector.
- `/changelog` is a daily public log of what shipped across all projects. If I miss a day, the gap is visible.

That's a smaller surface area than what was there before. It's also unfakeable. If a prospect wants to test whether I can do what I claim, they can — in three clicks, without talking to me.

## The honest version of the pitch

Most of what AI agencies sell right now is: *we'll build something custom for you, here's a vague capability list, trust us.*

What I want to sell is: *here is a working multi-agent system you can poke at. Here is the public MCP server it runs on. Here is the customer who runs it in production. Here is the changelog showing it improving every day. Buy access to it.*

The first is faster to write. The second is the only one worth paying attention to in 2026.

## Aftermath

The page is shorter. The signup form is the same. The funnel will tell me whether buyers respond better to this or worse. I'll publish the result either way.

— Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))
