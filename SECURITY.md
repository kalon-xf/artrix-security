# Artrix security policy

## Product safety boundary

Artrix supports explicitly authorized security testing only. It must not be used for unapproved targets, arbitrary shell execution, credential collection, destructive testing, or mass scanning.

## Reporting a security issue

Do not open public issues for vulnerabilities. Contact the project owner privately with:

- A clear description and affected version/commit
- Reproduction steps that avoid real customer data
- Expected and observed behavior
- Suggested mitigation where available

## Secure contribution requirements

- Never commit credentials, API keys, customer data, raw evidence, or real target inventories.
- Keep job execution manifest-based and allowlisted.
- Preserve scope checks, tenant isolation, audit logging, and human validation gates.
- Add tests for security-sensitive changes.
