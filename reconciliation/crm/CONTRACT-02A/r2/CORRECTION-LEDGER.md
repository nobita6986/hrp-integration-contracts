# Correction Ledger — CONTRACT-02A r2 (changes from r1)

r1 commit: 89dabd9e65836c521137ccea5ab9b391f1d3982a
r2 supersedes: r1

This ledger records every factual correction applied in r2. Each entry has a CR-ID, source of the finding, the inaccuracy in r1, and the correction applied.

| CR-ID | Source | Section | Inaccuracy in r1 | Correction Applied |
|---|---|---|---|---|
| CR-1 | T0 review | thin-slice-brief §4 | Listed fabricated symbol names: LaborProfileSchema, ApplicationSchema, RelationshipSchema, VersionSchema, IdSchema, QueryReadModelSchema, QueryInputSchema. NONE of these 7 names exist at baseline 72643356. | Replaced with verified actual symbol names from CRM source: UpdateLaborProfileInputSchema, ProfilePatchSchema, ProfilePatch, ContextPanelResultSchema, ContextPanelNextActionSummarySchema, ContextPanelAvailabilitySchema, ContextPanelCurrentRelationshipSchema, QueryScopeSchema, CursorPaginationInputSchema, ReadOnlyIdentityPreviewRequestSchema, ExpectedVersionSchema, IsoTimestampSchema, CanonicalIdSchema. Path+line evidence provided per symbol. |
| CR-2 | T0 review | thin-slice-brief §4 | Claimed displayName is non-PII. displayName is personal data; it remains personal data even without CCCD. POC uses synthetic data, not personal data. | Corrected: displayName is personal data; POC synthetic does not change this classification. |
| CR-3 | T0 review | thin-slice-brief §2 | Listed NextAction summary and expectedVersion as minimum data needed. These serve future mutation paths, not the initial read. | Removed from minimum required. Marked as available in result if returned by HRP query. |
| CR-4 | T0 review | thin-slice-brief §6 | Listed H.02/H.08 as hard prerequisites for read-only slice. | Reframed as milestone-level dependencies in backlog. Read-only slice can proceed once HRP provides a query capability; milestone gate (H.09) is acknowledged. |
| CR-5 | T0 review | thin-slice-brief §6 | Listed H.09 as prerequisite before any B.03 work starts. | Retained H.09 acknowledgment; clarified it is the gate that authorizes switching, not a blocker for starting slice planning work. |
| CR-6 | T0 review | thin-slice-brief §6 | Listed AFF-03B as a blocker for B.03 and B.04. | Removed AFF-03B from B.03 and B.04 blocker lists. AFF-03B blocks its own path only. |
| CR-7 | T0 review | owner-decision-rec-001-record §5 | Labeled acknowledgement as INTEGRITY_ONLY. REC-001 is OWNER_APPROVED. | Corrected label to OWNER_APPROVED; INTEGRITY_ONLY applies to the evidence bundle ACK, not to REC-001 approval. |
| CR-8 | T0 review | owner-decision-rec-001-record §5 | Did not distinguish between Owner decision, ACK integrity, bilateral wire acceptance, and runtime implementation. | Added explicit distinctions: (a) Owner decision APPROVED, (b) evidence bundle ACK is INTEGRITY_ONLY, (c) bilateral wire acceptance not occurred, (d) runtime implementation not authorized. |
| CR-9 | T0 review | owner-decision-rec-001-record §3 | Stated MSG-008 created PlacementCase authority. MSG-008 reminded/affirmed existing authority, not created it. | Corrected: MSG-008 is a reminder/affirmation, not the source of authority. |
| CR-10 | T0 review | owner-decision-rec-001-record §3 | Placed authority fact and supplement caveat as two equal conclusions. | Reordered: correct fact first, then supplement caveat (not co-equal). |
| CR-11 | T0 review | hrp-questions.md | Sent 9 questions as a full request list. | Trimmed to 5 questions needed for read-only slice. |
| CR-12 | T0 review | hrp-questions.md | Listed PlacementCase mapping, AFF-03B, REC-001-OPS, enum policy as common blockers. | Moved to backlog reference. |
| CR-13 | T0 review | hrp-questions.md | Included Client timing and KPI/Phase10 ordering as active questions. | Marked DEFERRED beyond current task scope. |
| CR-14 | T0 review | hrp-questions.md | Suggested re-opening bilateral acceptance mechanism. | Removed (already agreed per RECONCILIATION_PROTOCOL). |
| CR-15 | T0 review | t1-a-note §1 | Listed full POC scope incorrectly. | Corrected to P9/B.01 only (Chatwoot local/test, synthetic, edition verification). |
| CR-16 | T0 review | t1-a-note §1 | Listed Chatwoot webhook signature as B.01 item. | Removed; webhook signature is B.02. |
| CR-17 | T0 review | t1-a-note §1 | Listed suppression and routing as B.01 scope. | Removed; separate tasks. |

