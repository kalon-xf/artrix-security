# Safe worker protocol

## Why manifests

Artrix does not pass a command line from a browser to a worker. A server creates a typed manifest after checking authorization, scope, asset ownership, exclusions, allowed test type, rate limit, and testing window.

## Worker flow

1. Worker authenticates using a signed service identity.
2. Worker receives a job manifest and validates its schema and signature.
3. Worker re-checks the job's current cancellation and authorization state.
4. Worker maps the approved job type to a pre-pinned internal tool profile.
5. Worker executes only against verified manifest targets, within rate and timeout limits.
6. Worker uploads raw artifacts to protected storage and sends sanitized parsed results.
7. Worker records immutable job-run metadata and exits.

## Allowlisted job types

- Passive subdomain discovery
- DNS resolution
- Permitted HTTP probing
- Technology fingerprinting
- URL collection from approved sources
- Controlled template checks when explicitly approved

No arbitrary shell execution, mass scanning, credential access, destructive testing, or unapproved targeting is permitted.
