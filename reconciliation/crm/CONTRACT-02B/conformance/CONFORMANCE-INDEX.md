# CONFORMANCE-INDEX

## Provenance

- CRM r6 commit (content): eb586247fe1a147bc904ff69d49104e8609943ff
- CRM r7 commit (metadata): f908de06ed22a204c2cecfa8f051b5130216e8c3
- HRP response r6 commit: a2a5efa9f6e22e8beb1e858054a2585d343b4bea
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
- See cases/05-retry-vs-replay.md.

### Category 6: Consumer error parser handling
- See cases/06-error-parsing.md.

## Sources of Decision

- D-01: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (additive read query schema, no laborProfileVersion).
- D-02: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (additive read result schema, no snapshotVersion).
- D-03: r6 REC-002 + HRP r6 DESIGN-RESPONSE.md (S2S + DELEGATED_USER + effective user + org binding server-side).
- D-04: r6 REC-004B + HRP r6 DESIGN-RESPONSE.md (error envelope: reuse frozen codes; query-specific codes PROPOSED).
- REPLAY-VS-RETRY.md: r6 (replay token one-shot; retry is new request).

## Additional Source: HRP CONTRACT-02B followup r3

- Commit 8a28678: reconciliation/hrp/CONTRACT-02B-followup/r3/
- Introduces retryClass=NEVER for INTERNAL_ERROR (not RETRY_SAFE).
- Introduces STRUCT-1..3 for request envelope, actor shape, fieldAllowlist enum.
- All HRP r3 items recorded as PROPOSED in CORRECTION-DELTA.md.

## Confirmation Points for HRP

Each case notes HRP-PENDING points. See case files for "HRP confirmation points" sections.
See GAP-LIST.md for the full list of open items.
See CORRECTION-DELTA.md for the complete correction log.
