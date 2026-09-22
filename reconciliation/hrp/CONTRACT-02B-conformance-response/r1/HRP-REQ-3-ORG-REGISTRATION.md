# HRP-REQ-3 — canonical organization and service registration

## Current capability gap

HRP has not supplied a canonical production `organizationId`, service
registration, issuer, audience, key material, or credential through this
evidence bundle. The surveyed HRP read path does not establish a CRM service
identity/org-binding capability. No value may be inferred from `neondb`, a
database/branch name, a tenant-like request field, or a client claim.

Accordingly, this item is `OPEN` and blocks any real-path configuration.

## Proposed restricted registration record

Before a controlled pilot, HRP Operations/Security should create one approved
server-side registration record through a restricted internal change channel,
not this repository. The record should contain:

- opaque `serviceId` and its named CRM owner;
- one canonical HRP `organizationId` supplied by HRP authority;
- permitted query audience and fixed scope `talent-context.read.display`;
- issuer identifier, allowed algorithm, active `kid` fingerprint, and key
  rotation overlap metadata (never private key material);
- approved role/capability policy and fixed display-only projection;
- maximum assertion/delegation lifetimes, status, creation/change approver,
  and revocation contact.

The restricted record must be access-controlled to HRP Operations/Security
and the named integration owners. Credential values and private key material
remain in the existing secret-management channel only; neither is committed,
logged, nor copied into a manifest.

Owner must approve the exact canonical organization and registration
governance. A single configured organization is not evidence of
multi-organization isolation and does not replace object authorization.
