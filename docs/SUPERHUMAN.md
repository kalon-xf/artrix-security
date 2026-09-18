# AIFIX3R Superhuman

## Product boundary

AIFIX3R Superhuman is an evidence-grounded orchestration layer for explicitly authorized bug-bounty and application-security work. It is not an unrestricted autonomous exploitation agent. The model can plan and analyze, but execution authority remains in the scope service, typed worker manifests, and human approvals.

## Control loop

1. **Gate** — verify registered target, current written authorization, in-scope asset, permitted technique, non-destructive plan, and rate/time limits.
2. **Plan** — build a dependency graph across the relevant phases of the Artrix 22-phase methodology.
3. **Execute** — emit a typed allowlisted job request. Never emit a shell command.
4. **Normalize** — store sanitized evidence with provenance and integrity metadata.
5. **Recall** — retrieve evidence, public-disclosure pattern cards, and human decisions through pgvector. Similarity is relevance, not proof.
6. **Hypothesize** — record falsifiable candidates with confidence, evidence references, assumptions, and missing evidence.
7. **Approve** — require a security-lead decision before non-destructive validation.
8. **Learn** — write only human-validated findings and retest outcomes to durable memory.

## Implemented vertical slice

- `/superhuman` mission-control UI.
- `GET/POST /api/superhuman` and lead-only `POST /api/superhuman/:id/approve`.
- Six-fact deny-by-default authorization gate.
- Eight-node inspectable mission graph mapped to the 22-phase method.
- Evidence-linked memory and low-confidence candidate hypotheses.
- Human checkpoint that approves a plan without falsely validating a finding.
- PostgreSQL tables for missions, tasks, memories, hypotheses, and approvals.
- pgvector embedding column and HNSW cosine index for production retrieval.
- Tenant RLS and lead-only mutation of approvals and hypothesis state.

The development demo remains synthetic and does not access the network or execute tools. It uses the existing `.test` workspace and generates sanitized synthetic evidence.

## Production integration still required

- Replace the in-memory demo store with the PostgreSQL repositories.
- Generate embeddings server-side with an explicitly configured provider and record model/dimension metadata.
- Connect the planner to a BYO LLM through structured output schemas and strict token/cost limits.
- Retrieve a bounded set of AIFIX3R pattern cards; never place the full corpus in context.
- Sign worker manifests, authenticate workers, enforce egress allowlists, and re-check cancellation immediately before execution.
- Add append-only evidence integrity records and object-storage retention controls.
- Add independent reviewer workflows for validation, rejection, retest, and memory promotion.
- Complete threat modeling and an independent security review before production use.

## Non-negotiable invariants

- No approved scope means no job.
- No arbitrary command is accepted from a browser or model.
- No candidate becomes a finding without human validation.
- No impact claim exists without cited, sanitized evidence.
- Unexpected sensitive data, cross-tenant effects, scope uncertainty, or availability impact stops the mission.
