# DESIGN-DECISION-RECORD — CONTRACT-02B r4

## Purpose

This document tracks the resolution state of every design item in CONTRACT-02B. Each item has exactly one status.

## Status Definitions

| Status | Meaning |
|---|---|
| AGREED_DIRECTION | Both sides agree on the direction; bilateral acceptance pending |
| PROPOSED | One side has proposed; awaiting the other side |
| OWNER_APPROVED | Owner has approved; bilateral acceptance pending |
| OPEN | Not yet discussed or no consensus reached |
| ACCEPTED_SHARED | Both T0s have signed off; code/freezes may proceed |

## Design Items

### D-01: Additive Read Query Schema (no laborProfileVersion)

- **Source**: HRP T0 MSG-022 (D-01)
- **CRM position**: AGREED_DIRECTION
- **HRP position**: AGREED_DIRECTION
- **Status**: AGREED_DIRECTION
- **Pending**: Exact envelope naming; transport path confirmation; shared contract package change

### D-02: Additive Read Result Schema (no snapshotVersion)

- **Source**: HRP T0 MSG-022 (D-02)
- **CRM position**: AGREED_DIRECTION
- **HRP position**: AGREED_DIRECTION
- **Status**: AGREED_DIRECTION
- **Pending**: Exact naming; resolvedAt semantics (query-time marker, NOT version)

### D-03: S2S Auth + DELEGATED_USER + Effective User + Org Binding

- **Source**: HRP T0 MSG-022 (D-03)
- **CRM position**: AGREED_DIRECTION
- **HRP position**: AGREED_DIRECTION
- **Status**: AGREED_DIRECTION
- **Pending**: Issuer owner, algorithm, TTL/skew/rotation, delegation format/lifetime/revocation, role allowlist, audit (all in REC-002)

### D-04: Error Contract

- **Source**: HRP T0 MSG-022 (D-04)
- **CRM position**: AGREED_DIRECTION
- **HRP position**: AGREED_DIRECTION
- **Status**: AGREED_DIRECTION
- **Pending**: Additive enum vs query-local union (REC-004b); exact naming

### REC-001: Basic Read-Only Slice

- **Source**: CONTRACT-02A r3
- **Status**: OWNER_APPROVED (via Master-Plan.V2.6.md)
- **Pending**: Implementation (B.03, H.08, H.09)

### REC-001-OPS: Operational Setup

- **Source**: CONTRACT-02A r3
- **Status**: OPEN / PROPOSED
- **Pending**: Actual orgId, credentials, delegation setup

### REC-002: Delegation, Binding, Effective User

- **Source**: HRP bilateral decision register (8a28678)
- **CRM position**: PROPOSED (10 AGREED, 1 PROPOSED on TTL)
- **HRP position**: PROPOSED
- **Status**: OPEN / PROPOSED (OWNER_DECISION_REQUIRED)
- **Pending**: T0 CRM accepts CRM REC-002 positions; T0 HRP confirms; delegation proof transport decision

### REC-003: Projection Full Name Redaction

- **Source**: CONTRACT-02B r3
- **CRM position**: AGREED (fullNameRedacted + displayOnly=true)
- **HRP position**: AGREED
- **Status**: AGREED_DIRECTION (carried in D-03)
- **Pending**: Redaction policy and test vectors (Owner decision)

### REC-004b: Error Contracts + Additive Enums

- **Source**: HRP bilateral decision register (8a28678)
- **CRM position**: PROPOSED (additive global enum preferred)
- **HRP position**: PROPOSED (query-local union preferred)
- **Status**: OPEN / PROPOSED (OWNER_DECISION_REQUIRED)
- **Pending**: T0 CRM accepts additive enum preference; T0 HRP confirms query-local alternative

## Open Questions Summary

The following questions remain OPEN and require bilateral resolution:

1. **REC-002**: Delegation proof transport — how does CRM receive delegation from HRP? (HRP/Owner decision)
2. **REC-004b**: Additive enum vs query-local union (T0 CRM/HRP decision)
3. **REC-001-OPS**: Actual orgId, credential values, delegation setup (Owner/HRP/CRM operational decision)

## Closed Items

Items that are resolved and not reopened:

- laborProfileVersion gap: resolved by D-01 (additive schema, no version on first read)
- snapshotVersion gap: resolved by D-02 (additive schema, no snapshotVersion)
- resolvedAt semantics: resolved by D-02 (query-time marker, NOT version/concurrency)
- DELEGATED_USER mandatory: resolved by D-03
- phone/CCCD exclusion: resolved by D-03
- ApiErrorCode not wire authority: resolved by D-04
- displayOnly semantics: resolved by D-03 (slice constraint, not frozen literal)
- SCHEMA_VERSION string type: resolved in frozen contract
