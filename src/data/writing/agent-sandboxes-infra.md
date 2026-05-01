---
title: How to design agent sandboxes infra
slug: agent-sandboxes-infra
date: 2026-05-01
status: drafting
topic: infrastructure
teaser: What it actually takes to run untrusted agent code safely — sandbox isolation patterns (OS-level vs process-level vs network-level), when to use which, security boundaries, and the cost-vs-safety tradeoffs I hit while building Dzarvis.
---

# How to design agent sandboxes infra

The first time I let an agent execute generated code in production, I was sure I'd thought of everything. I had timeouts. I had memory limits. I had a curated tool surface. The agent immediately wrote a `while True: pass` loop, and the timeout fired correctly, and everything looked great in the trace.

Then I read the spend dashboard the next morning. The agent had been polling a search API in a tight loop for 47 minutes before the task-level timeout fired. The per-call timeout was 30 seconds, so each call was fine. The cost was three figures.

That was when I stopped thinking about sandboxing as a single decision and started thinking about it as a stack of layers, each with its own failure mode. This is what I learned building the sandbox layer for Dzarvis — a multi-agent assistant on Claude that runs untrusted, model-generated code on behalf of business users.

## The three layers of isolation

Most introductions to sandboxing collapse the problem into a single question: "is the code isolated?" That framing produces brittle systems because it treats different threat surfaces as one. The threat surfaces are not one. They split cleanly into three:

**OS-level isolation** is the answer to "can the code escape the runtime to read or write the host?" This is what containers, gVisor, Firecracker, and microVMs solve. The threat is filesystem traversal, capability escalation, kernel exploits.

**Process-level isolation** is the answer to "can the code do something the runtime allowed but I didn't?" Resource limits, syscall filters, language-level capability restrictions. The threat is the agent staying inside the runtime but consuming all available CPU, memory, network bandwidth, or external API quota.

**Network-level isolation** is the answer to "can the code reach things outside the sandbox?" Egress allowlists, DNS pinning, metadata IP blocks. The threat is data exfiltration, SSRF to internal services, calls to attacker-controlled hosts.

The mistake is picking one and assuming it covers the others. A perfectly OS-isolated container with unrestricted egress can still leak every secret it touches. A perfectly egress-locked container with no resource limits can still run up a six-figure bill on the API allowlist itself.

## When to use which (and which to skip)

In practice, you almost always need all three, but the strength of each varies by what the agent is doing:

**Agent generates code that runs against a public API.** OS isolation can be light (the surface area is small; the code rarely touches the local filesystem). Process limits are critical (the agent will retry forever if you let it). Network isolation should be a strict allowlist of the API hosts you actually want.

**Agent generates code that touches user data.** OS isolation must be hard — if the runtime breaks, all bets are off. Process limits are still critical. Network isolation must include outbound blocks on data-exfiltration paths.

**Agent generates code that operates on its own user's files** (the Dzarvis case). OS isolation must be hard AND the runtime must run as a per-user-isolated identity — one user's runtime cannot read another user's files even if both runtimes share the same physical infrastructure. Process limits are critical. Network can be moderately permissive because the agent legitimately needs to fetch from external sources.

This last case is where I spent the most time. The cross-user isolation problem is the one nobody writes about, because the obvious answer — "spin up a fresh sandbox per user" — is also the most expensive answer. Booting a fresh container per request adds latency that eats into the agent's loop budget. Pre-warmed pools are stateful and painful. Per-user persistent VMs are a billing hazard.

What I ended up with for Dzarvis: per-user identity at the sandbox-orchestrator layer (not at the container layer), shared sandbox pool with strict per-request reset, and a content-hash cache that's keyed by `[userId, contentHash]` — a compound unique. That last constraint is what stops one user's processed result from leaking to another. The cache hits are user-scoped; the misses are processed in a fresh sandbox slot. The cost-savings are real, and the boundary holds because the cache key includes the user identity.

## The cost-vs-safety frontier

The honest version of "how do you sandbox this" is: every sandbox layer has a cost, and the cost is paid in three currencies — latency, dollars, and developer ergonomics.

**Latency.** Boot time of the sandbox. Network round-trips for syscall-mediation. Per-tool-call overhead.

**Dollars.** Direct compute. Indirect: API quota consumed by retries, runaway loops, expensive model calls behind the wrong cache key.

**Developer ergonomics.** Every constraint you put on the sandbox is a constraint on what the agent can usefully do inside it. Block all network, and the agent can't fetch documentation. Block all filesystem writes, and the agent can't even untar a downloaded archive.

You can't optimize all three. The actual decision is which to spend on what:

| Pattern | Latency cost | Dollar cost | Ergonomic cost |
|---|---|---|---|
| Container per request | High | Medium | Low |
| Pre-warmed pool | Low | Medium-high | Medium |
| Shared sandbox + hard reset | Low | Low | High |
| Per-user persistent VM | Low | High | Low |
| WASM-only runtime | Lowest | Low | Highest |

I've used three of these in production for different surfaces. The shared sandbox + hard reset pattern is what backs the Dzarvis tool execution layer — fast, cheap, and the ergonomic cost is paid once at the orchestrator design step instead of repeatedly at runtime.

## What I'd do differently next time

Three things I underestimated at the start:

1. **Egress is the problem, not ingress.** I spent the first week obsessing over what could come INTO the sandbox. The actual incidents have all been about what went OUT — secrets in logs, retry storms hitting the wrong endpoint, an agent calling `localhost:169.254.169.254` for AWS metadata. The metadata-IP block is a one-line firewall rule and should be the first rule, not an afterthought.

2. **Per-call timeouts are not session timeouts.** The 47-minute API-loop incident I opened with happened because I had a per-call timeout but no aggregate-cost guard. Now I budget cost per agent-task, not just per call. If the task burns through its budget, the orchestrator stops the agent — even if every individual call returned in 200ms.

3. **Cache keys are a security boundary.** A cache that's keyed too loosely is a covert channel between users. Every cache I add now starts with the user identity in the key, even when the data "obviously" doesn't depend on the user.

The last one is the most important and the easiest to forget, because cache keys feel like a performance concern. They're not. They're a tenancy concern that happens to also be a performance concern.

---

If you're designing sandbox infrastructure for production agents and want to compare notes, I'm at [mr.sucik@gmail.com](mailto:mr.sucik@gmail.com). I'm always interested in how other teams are paying these costs.
