# Artrix local worker contract

The worker is deliberately a **manifest processor**, not a remote shell.

## Non-negotiable safeguards

- Accept only server-signed manifests matching `manifest.schema.json`.
- Verify organization, scope, authorization, testing window, exclusions, targets, rate limits, timeout, and cancellation state before doing any work.
- Use an explicit tool-and-argument allowlist selected by job type.
- Never accept an arbitrary executable path, shell string, URL outside the target list, credentials, or user-supplied flags.
- Restrict egress to verified in-scope targets and approved passive data sources.
- Stream structured status only: `queued`, `running`, `completed`, `failed`, or `cancelled`.
- Store raw artifacts in protected storage; return sanitized summaries and checksums.
- Record tool version, worker identity, manifest hash, start/end time, and cancellation events.

## Current implementation

The web demo uses a synthetic in-memory processor and intentionally does **not** execute commands or network probes. A production worker must be implemented after signed worker identity, egress controls, artifact storage, observability, and independent review are in place.
