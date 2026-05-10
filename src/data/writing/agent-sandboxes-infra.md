---
title: How to design agent sandboxes infra
slug: agent-sandboxes-infra
date: 2026-05-10
status: published
topic: infrastructure
teaser: What it actually takes to run untrusted agent code safely — sandbox isolation patterns, security boundaries, and the cost-vs-safety tradeoffs from production agent infrastructure work.
---

# How to design agent sandboxes infra

The hardest part of running untrusted agent code is not isolation. It is getting the cost-vs-safety frontier right without destroying developer ergonomics. A few notes from production work.

## Three layers, not one

Sandbox isolation lives at three layers — OS-level, process-level, network-level. Most teams collapse them into a single decision and end up brittle in either direction. Too permissive and a process escape becomes a host compromise. Too restrictive and every legitimate fetch fails, which kills the agent's usefulness.

Treat them independently:

- **OS-level** is the hard boundary. Firecracker microVMs, gVisor, or per-tenant containers. Fail closed.
- **Process-level** controls what the agent can do *inside* the sandbox. Drop privileges, restrict capabilities, apply seccomp filters.
- **Network-level** is where agents will probe first.

## Egress beats ingress

Agents do not accept inbound traffic. They make outbound calls — to LLMs, to user-supplied URLs, to package registries, to your own internal services if you let them. SSRF lives there. Token exfiltration lives there. The cloud-metadata endpoint at `169.254.169.254` lives there, and it will cheerfully hand back IAM credentials to any process that asks.

The first firewall rule should be the metadata-IP block. Then RFC1918. Then everything else by default with a per-task allowlist. Reverse the conventional inbound-first firewall mindset.

## The cost-vs-safety frontier

Three knobs, optimize at most two:

- **Latency** — a Firecracker microVM cold-start is ~150ms. A container is ~30ms. In-process is microseconds.
- **Dollars** — Firecracker isolation costs real money at scale. Per-request microVMs, even more.
- **Ergonomics** — the looser you are, the more your agent works "out of the box" without the developer fighting policy.

A research agent can sit at slow + safe + ergonomic. A user-facing chatbot needs fast + ergonomic and accepts a softer safety story. There is no universally right answer; there is a deliberate one. Picking two is the actual design decision.

## Tenancy boundaries are everywhere

The cache is a tenancy boundary. The vector index is a tenancy boundary. The job queue is a tenancy boundary. Anywhere two users' data flows through one pipe, the cache key is part of the security model — not a performance optimization.

Cross-user cache hits silently leak data. They do not throw, they do not log, they do not raise an alert. You discover them when a user emails to ask why the agent knows their boss's calendar.

The fix is mechanical: every key that touches user data must include the user-scoped identifier. Every shared resource must be designed with the question "what happens when user A and user B both query this?" written down somewhere.

---

*Working note. The full version covers Firecracker tuning, per-tenant allowlist generation, and the three audit incidents that taught me each of these. — Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))*
