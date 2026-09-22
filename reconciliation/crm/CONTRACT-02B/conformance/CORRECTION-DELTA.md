# T0 correction over Delta-r5
Authorization: Owner explicitly asked T0 to fix the handoff directly rather than return it to T1-B.
Previous immutable conformance commit: 4bf0931b5ab849bd3f90579f8eb844f9b04c249e.
Scope: documentation and synthetic fixtures only. No source implementation.

Verified old manifest matched bytes, but semantic inconsistencies remained:
1. README count still 18 data and role/lifetime OPEN despite MSG-026.
2. GAP-LIST assigned bilateral decisions solely to HRP and reopened approved roles/delegation lifetime.
3. Request allowlists used dotted paths instead of projection names.
4. Success examples lacked target wrapper/correlationId/org/nested schemaVersion/unavailableFields; one omitted required displayOnly and leaked an annotation into body.
5. Phone was treated as known unsupported, empty allowlist as optional success; both contradict MSG-025.
6. Retry fixtures still changed correlationId.
7. 401 retryClass was NEVER instead of REAUTHENTICATE; NOT_FOUND used obsolete messageKey.
8. INTERNAL_ERROR had a note inside strict error object.
9. Multiple errors were treated as valid; empty errors were converted to command UNKNOWN_COMMAND_OUTCOME.
10. Distribution conflated private:true with registry publication, and per-file hashes with npm tarball integrity.
11. Frozen enum summaries were incomplete; removed duplicate pseudo-authoritative enum lists. Use pinned actual source instead.

Corrections:
- Align current docs/examples to MSG-025 proposed query shapes and exact triples.
- Split valid examples and EXPECT_REJECT_PROTOCOL_FAILURE inputs.
- Withdraw prior CORR-4 fallback; command-only code remains only a negative fixture.
- Owner decisions represented per MSG-026; concrete org and audit policy still OPEN.
- Keep annotations outside wire and record auth failure precedence as OPEN rather than invent a status.
- Use empty ID negative, not an unsupported UUID-only rule.
- Proposal for immutable tarball distribution; no package/build/install executed.
- Regenerate raw-byte manifest; old commits unchanged.

Validation is limited to integrity, encoding, JSON syntax and explicit consistency checks against the pinned proposal.
No claim of Zod conformance, runnable S2S tests, independent audit PASS or bilateral acceptance.
