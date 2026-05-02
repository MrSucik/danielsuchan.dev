---
title: How to design agent sandboxes infra
slug: agent-sandboxes-infra
date: 2026-05-01
status: drafting
topic: infrastructure
teaser: What it actually takes to run untrusted agent code safely — sandbox isolation patterns, security boundaries, and the cost-vs-safety tradeoffs from production agent infrastructure work.
---

# How to design agent sandboxes infra

*Draft in progress.*

Writing this one up properly. Topics I want to cover when it's ready:

- The three layers of isolation — OS-level, process-level, network-level — and why collapsing them into one decision produces brittle systems.
- When egress matters more than ingress, and why the metadata-IP block should be the first firewall rule, not an afterthought.
- The cost-vs-safety frontier: latency, dollars, and developer ergonomics — you can't optimize all three.
- Cross-user isolation in shared sandbox pools, and why cache keys are a tenancy boundary.

Full version when I'm satisfied with what I can share publicly.

— Daniel ([mr.sucik@gmail.com](mailto:mr.sucik@gmail.com))
