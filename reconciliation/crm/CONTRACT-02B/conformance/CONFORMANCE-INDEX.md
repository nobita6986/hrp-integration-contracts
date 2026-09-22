# CONFORMANCE-INDEX

## Provenance

- CRM r6 commit (content): eb586247fe1a147bc904ff69d49104e8609943ff
- CRM r7 commit (metadata): f908de06ed22a204c2cecfa8f051b5130216e8c3
- HRP response r6 commit: a2a5efa9f6e22e8beb1e858054a2585d343b4bea
- HRP followup r4 bundle (MSG-025): commit 53e6db53a929409b1dc7b512a1ec897a3af5b659
  - Bundle: reconciliation/hrp/CONTRACT-02B-followup/r4/
  - Manifest raw SHA-256: e6f9dd0e2810525fde4743af16aca4bc6b2045dbe7c8de2f86c5aa8a49ee99f8 (T0 verified 5/5 entries)
- Bundle location: reconciliation/crm/CONTRACT-02B/conformance/
- Status: DRAFT, READY FOR T0 REVIEW

## Existing ACs (from r6 REC-002) - covered, do NOT re-propose

These ACs are documented in r6 REC-002 and intentionally NOT regenerated here:

1. Unknown / missing kid -> AUTHENTICATION_REQUIRED 401
2. Wrong algorithm (including none) -> AUTHENTICATION_REQUIRED 401
3. Expired assertion -> AUTHENTICATION_REQUIRED 401
4. Body hash mismatch with signed claims -> AUTHENTICATION_REQUIRED 401
5. Concurrent replay (duplicate jti) -> AUTHENTICATION_REQUIRED 401
6. Revoked delegation -> FORBIDDEN 403
7. Delegation-service mismatch -> FORBIDDEN 403
8. Delegation-user mismatch -> FORBIDDEN 403
9. Disabled user -> FORBIDDEN 403
10. Insufficient permission -> FORBIDDEN 403
11. Wrong organization -> FORBIDDEN 403
12. Unknown field in fieldAllowlist -> VALIDATION_ERROR 422
13. Raw phone / CCCD leak attempt -> FORBIDDEN 403
14. Replay store unavailable -> DEPENDENCY_UNAVAILABLE 503

Source: r6 REC-002, status PROPOSED, awaiting HRP confirmation.

## New ACs (this supplement)

### Category 1: Read hợp lệ
See cases/01-valid-read.md and cases/04-fields.md.

### Category 2: Auth/Perm/Service-only/Delegation
- REC-002 ACs above cover most cases.
- This supplement ADDS:
  - 2.1 Service-only without delegation (no actor body).
  - 2.2 Service-only with stub actor but missing delegation token.
  - 2.3 User inactive vs User revoked distinction.
  - 2.4 Pinned organization mismatch.
- See cases/02-auth-perm.md.

### Category 3: Hidden vs Nonexistent
- Both return the same response to avoid existence oracle.
- See cases/03-hidden-object.md.

### Category 4: requested-supported / requested-unsupported / unrequested
- See cases/04-fields.md.

### Category 5: Retry valid query vs replay credential
- See cases/05-retry-vs-replay.md (replay one-shot: AGREED_DIRECTION).
- See cases/05A-retry-reauthorize.md (retry semantics per r4: same correlationId, new jti, reauthorize; PROPOSED).
- See cases/05B-exchange-cancel-receipt.md (issuance/exchange/cancel; NEW capability, PROPOSED).
- See cases/05C-seven-code-parser.md (seven-code query parser; BOUNDED_NEW_ASSERTION literal; PROPOSED).

### Category 6: Consumer error parser handling
- See cases/06-error-parsing.md.

## Sources of Decision

- D-01: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (additive read query schema, no laborProfileVersion).
- D-02: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (additive read result schema, no snapshotVersion).
- D-03: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (S2S + DELEGATED_USER + effective user + org binding server-side).
- D-04: r6 REC-004B + HRP r6 DESIGN-RESPONSE.md (error envelope: reuse frozen codes; query-specific codes PROPOSED).
- REPLAY-VS-RETRY.md: r6 (replay token one-shot; retry distinction per r4: same logical correlationId + new jti).
- r4 REC-002 §1-5: issuance/exchange/cancel/retry/revoke (NEW capability).
- r4 REC-004B §3: seven-code parser + BOUNDED_NEW_ASSERTION literal.

## Additional Source: HRP CONTRACT-02B followup r4 (MSG-025)

- Commit 53e6db53a929409b1dc7b512a1ec897a3af5b659: reconciliation/hrp/CONTRACT-02B-followup/r4/
- Delta over r3:
  - Exchange/cancel/receipt lifecycle (NEW capability, HRP-owned).
  - Retry corrections: same logical correlationId + new jti + reauthorize (not "must succeed" or "new correlationId each retry").
  - BOUNDED_NEW_ASSERTION literal proposal (not frozen; query-only).
  - Seven-code query parser (frozen 5 codes + 2 query additions + query-only retry literal).
  - Revocation race; authority store unavailability.
  - Exact issuance/exchange/cancel transport shapes still OPEN (HRP-PENDING).
- All r4 items recorded as PROPOSED in CORRECTION-DELTA.md.
- r3 followup items (8a28678) remain valid: retryClass=NEVER for INTERNAL_ERROR, STRUCT-1..3.

## Owner Disposition (MSG-026)

Source: reconciliation/hrp/CONTRACT-02B-owner-disposition/r1/OWNER-DECISION.md @ commit c0ede9aeaba3ba26d620ae4e535d9e6a77cf9343
Manifest raw SHA-256: f2a7a4cb5ee7c3c7483f73298e2c703170a270bfacc72104473aa51a66e00612 (T0 verified 1/1)

### Approved (OWNER_APPROVED, in scope of HRP current authorities)
- 3 roles (ADMIN, HR_MANAGER, HR_STAFF): use Talent context from CRM, with conditions (HRP checks effective user/role/permissions per query; no expansion beyond HRP; service-only cannot read LaborProfile; sole projection is identitySummary.fullNameRedacted + displayOnly=true; one organizationId from HRP, bind server-side).
- Delegation UX/lifetime: 15 minutes, no auto-refresh; controlled pilot. User approves at HRP.
- Revoke network-failure window: revoke may not be instant; approved within Owner-confirmed scope (HRP revoke-commit; checkpoint reject thereafter).

### OPEN (Owner not yet closed; do NOT request Owner to reopen approved items)
- ORG-1: Canonical organizationId value (HRP-supplied).
- AUDIT-1: Audit metadata access/retention/recovery (Owner/Operations).

## Confirmation Points for HRP

Each case notes HRP-PENDING points. See case files for "HRP confirmation points" sections.
See GAP-LIST.md for the full list of open items.
See CORRECTION-DELTA.md for the complete correction log.
