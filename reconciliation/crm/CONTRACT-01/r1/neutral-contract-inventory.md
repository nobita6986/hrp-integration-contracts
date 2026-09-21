# CONTRACT-01 — Neutral contract inventory

Status: READY FOR TIER-0 INVENTORY REVIEW. Provisional classification only.

Baseline: `72643356a0d1355f9dccc3921b47c990ea9c31c1`. Package: `@hrp-engagement/contracts@0.0.8-g0.8-fixes`.

Repo contract không tự định nghĩa lại domain của hai app. Gate 0 freeze phía CRM không phải bằng chứng HRP đã triển khai hoặc chấp nhận wire contract.

## 1. Evidence and reproducibility

Generated from committed Git blobs, not stale dist or uncommitted runtime files. Every module/export/import record in `neutral-contract-evidence.json` carries a Git blob and source line where applicable.

Evidence appendix SHA-256: `3014a9d804767a26d5868302ed62c0e5328195dca1e40bdc13266b221ff4fb0c`.

TypeScript AST/compiler: 5.7.3. 248 code files inspected.

Read-only verification: `node scripts/contract-inventory.mjs --check`. Intentional regeneration: `node scripts/contract-inventory.mjs --write` (writes these two documents only).

No application, contract fixture or HRP runtime tests are executed by this inventory tool. Local TypeScript dependencies are needed to run the extractor.

## 2. Counts and counting units

- 29 contract source files: 28 modules plus index.ts; 24 command-directory files.
- 518 distinct root public export names: 139 type-only names and 379 value-capable names. Re-export aliases are resolved; this is not a count of commands or schemas.
- 18 active test files selected by the package test glob. Fixture counts in old CHANGELOG/audit reports are historical, not a current test run.
- 51 direct consumer files outside packages/contracts, including tests. Transitive consumers are not included in this count.

## 3. Authority and provisional classification

- ACCEPTED_SHARED = 0 verified symbols/modules. No bilateral acceptance artifact has been supplied.
- HRP_IMPLEMENTED = 0 verified symbols/modules. No pinned HRP baseline and runtime evidence have been supplied.
- TARGET_ONLY is the default for candidate wire schemas, types and validators below. It means present in CRM baseline, not approved by HRP.
- OWNER_DECISION_BLOCKED: merge-review explicitly exposes proposed/unavailable contracts and unresolved dependencies; actor delegation and capability authority also require reconciliation before promotion.
- CRM_INTERNAL candidate: Vietnamese display-label maps/errorMessagesVi are presentation conveniences. This recommendation does not authorize moving or deleting them. PACKAGE_VERSION is package metadata, not a wire command.
- UNKNOWN ownership/split: ports, gateway test hooks/clock interfaces, ConstantsSnapshot composition, AI proposal/provider-config responsibility and KPI phase placement. Keep draft pending reconciliation.
- DEPRECATED_OR_CONFLICTING: do not label current source deprecated without evidence. Excluded synthetic/legacy test artifacts are listed separately; their historical expectations are not authoritative.

These are symbol-group overlays, not disjoint module counts. No fabricated totals are obtained by adding statuses to the 29-file count.

HRP owns canonical identity/labor/application/placement/workforce lifecycle and permissions. CRM owns chat/CSKH, campaign/agent workflow, internal UI and automation state. Shared wire shape does not transfer domain authority. Shared hosting does not authorize direct HRP DB access.

Stable neutral root remains EMPTY at Stage 0. Existing CRM exports remain unchanged. A future neutral export requires explicit ACCEPTED_SHARED evidence.

## 4. Module inventory

All names below come from AST declarations. Complete resolved root symbols and declaration locations are in appendix.publicExports; full module exports/re-exports are in appendix.modules. Imported-test evidence is not coverage or execution proof.

### 4.1 packages/contracts/src/commands/ai-proposals.ts

Git blob: `1e6405bda9d342718df35f607ed2fe5b1deecf8a`. Source SHA-256: `05125fa749135be2758cbbc6fe24275ba5da7e7ce763f654d90172032f779f0f`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (9): AI_PROPOSAL_KINDS (L36; value); AIProposalKindSchema (L43; value); AIProposalUncertaintySchema (L53; value); AIProposalFieldSchema (L90; value); AIProposalContextSchema (L128; value); AIProposalSchema (L161; value); ApplyAIProposalInputSchema (L207; value); ApplyAIProposalResultSchema (L222; value); AI_PROPOSAL_PATCH_FORBIDDEN (L254; value).

Resolved root names declared here: 9. Direct named consumer files: 1.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:42; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:43; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:67; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:68; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:69; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:70; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:71; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:72; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:73; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:74; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:75.

### 4.2 packages/contracts/src/commands/ai-provider-config.ts

Git blob: `1397d28f297094b12be21b740a3116ab84b0bd94`. Source SHA-256: `d4b0298731d67073ae656500e927106222de680ec5f7388f19bb9cedc6ed55fe`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (11): AI_PROVIDER_API_STYLES (L32; value); AIProviderApiStyleSchema (L37; value); AI_PROVIDER_CAPABILITIES (L45; value); AIProviderCapabilitySchema (L55; value); AI_PROVIDER_DATA_POLICIES (L69; value); AIProviderDataPolicySchema (L75; value); SecretRefSchema (L85; value); AIProviderBudgetSchema (L109; value); AIProviderConfigWriteSchema (L133; value); AIProviderConfigReadSchema (L196; value); AI_PROVIDER_FORBIDDEN_RAW_SECRET_FIELDS (L225; value).

Resolved root names declared here: 11. Direct named consumer files: 1.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:49; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:78; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:79; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:80; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:81; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:82; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:83; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:84; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:85; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:86; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:87; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:88.

### 4.3 packages/contracts/src/commands/analytics.ts

Git blob: `ea3be58d7f03bb8ecc2b5eddf4a016b8142202b6`. Source SHA-256: `336bf8446a87cd17db014790111076a4a9fbff95bf3ae92821270e46078ca961`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (18): METRIC_GRAINS (L33; value); MetricGrainSchema (L41; value); METRIC_UNITS (L49; value); MetricUnitSchema (L57; value); METRIC_PERIODS (L65; value); MetricPeriodSchema (L71; value); METRIC_ATTRIBUTION_STATES (L81; value); MetricAttributionStateSchema (L85; value); MetricSourceSchema (L104; value); MetricDefinitionInputSchema (L119; value); MetricDefinitionSchema (L182; value); PROFILE_LIFECYCLE_METRIC_IDS (L220; value); ProfileLifecycleMetricIdSchema (L225; value); ProfileLifecycleMetricBindingSchema (L229; value); MetricValueSchema (L268; value); MetricAggregateReadRequestSchema (L327; value); MetricAggregateReadResultSchema (L348; value); ANALYTICS_PATCH_FORBIDDEN (L362; value).

Resolved root names declared here: 18. Direct named consumer files: 1.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:47; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:48; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:34; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:35; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:36; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:37; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:38; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:39; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:40; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:41; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:42; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:43; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:44; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:45; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:46; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:47; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:48; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:49.

### 4.4 packages/contracts/src/commands/availability.ts

Git blob: `d2741d0af45af37c68db66f433e9b43cdabd939e`. Source SHA-256: `78861f428cd3deb6ecaf64bec90d9264dc5a99c32accc3030cf89948ae0b4ddd`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (7): AvailabilityPatchSchema (L55; value); AvailabilityPatch (L78; type); UpdateLaborAvailabilityInputSchema (L93; value); UpdateLaborAvailabilityInput (L123; type); UpdateLaborAvailabilityResultSchema (L138; value); UpdateLaborAvailabilityResult (L174; type); AVAILABILITY_PATCH_FORBIDDEN (L183; value).

Resolved root names declared here: 7. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/availability.test.mjs:16; packages/contracts/tests/availability.test.mjs:17; packages/contracts/tests/availability.test.mjs:18; packages/contracts/tests/availability.test.mjs:19; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:34; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:35.

### 4.5 packages/contracts/src/commands/dnc.ts

Git blob: `56922d0330083c8b6097bbdc1fa86efdc1fdddaf`. Source SHA-256: `cef315f1909985fd6cc57f1ff569e14753ff32a46095e811cf73359184957e59`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (10): DNC_REASONS (L32; value); DncReason (L38; type); DncReasonSchema (L39; value); LEGACY_DNC_REASONS (L47; value); LegacyDncReason (L52; type); LegacyDncReasonSchema (L53; value); DncReasonAcceptAliasSchema (L64; value); NormalizeDncReasonResult (L72; type); normalizeDncReason (L77; value); DNC_REASON_AUTHORIZATION_NOTE (L97; value).

Resolved root names declared here: 10. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:35; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:36; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:37; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:38; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:39; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:40; packages/contracts/tests/suppression.test.mjs:23.

### 4.6 packages/contracts/src/commands/events.ts

Git blob: `98a646d96fd609fada889344b2220cbf044cc6f5`. Source SHA-256: `c011de9531859d538ddd70a212094a81d85d0965fd0fc2dbeae724a0ba8cfced`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (14): EVENT_AGGREGATE_TYPES (L41; value); EventAggregateType (L53; type); EventAggregateTypeSchema (L55; value); EventEnvelopeSchema (L76; value); EventEnvelope (L150; type); EventDuplicateKindSchema (L166; value); EventReceiptSchema (L174; value); EventWatermarkSchema (L216; value); AttributionStateSchema (L240; value); CreationActorAttributionSchema (L252; value); CreationEventLabelSchema (L311; value); ProfileCreationEventSchema (L317; value); PlacementCaseCreationEventSchema (L332; value); EVENT_PATCH_FORBIDDEN (L352; value).

Resolved root names declared here: 14. Direct named consumer files: 4.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:41; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:42; packages/contracts/tests/queries-events-mappings.test.mjs:48; packages/contracts/tests/queries-events-mappings.test.mjs:49; packages/contracts/tests/queries-events-mappings.test.mjs:50; packages/contracts/tests/queries-events-mappings.test.mjs:51; packages/contracts/tests/queries-events-mappings.test.mjs:52; packages/contracts/tests/queries-events-mappings.test.mjs:53; packages/contracts/tests/queries-events-mappings.test.mjs:54; packages/contracts/tests/queries-events-mappings.test.mjs:55; packages/contracts/tests/queries-events-mappings.test.mjs:56; packages/contracts/tests/queries-events-mappings.test.mjs:57; packages/contracts/tests/queries-events-mappings.test.mjs:58; packages/contracts/tests/queries-events-mappings.test.mjs:59.

### 4.7 packages/contracts/src/commands/evidence.ts

Git blob: `f9796b5cf85663f7b0d30a31c75223ba6517712b`. Source SHA-256: `e9b123ec0e2f3d23b460407f9ca442b4b555ab22196b0c482cbd791d3bb62c54`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (7): CommandEvidenceRefSchema (L33; value); CommandEvidenceRef (L48; type); EvidenceRefListSchema (L56; value); EVIDENCE_FORBIDDEN_CLIENT_FLAGS (L63; value); FORBIDDEN_FIELDS_EVIDENCE (L83; value); EvidenceClaimSchema (L90; value); EvidenceClaim (L108; type).

Resolved root names declared here: 7. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/identity.test.mjs:29; packages/contracts/tests/identity.test.mjs:30.

### 4.8 packages/contracts/src/commands/gateway.ts

Git blob: `cb2dde7012430f36c6f84395c5dc5b607d10a199`. Source SHA-256: `ee3e9877c95f88d9946d4ae5ce9976aee1d147de3afaa2bf916e4749f774186a`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (23): HRP_GATEWAY_TIERS (L49; value); HrpGatewayTier (L54; type); HrpGatewayTierSchema (L55; value); HrpGatewayCallContextSchema (L71; value); HrpGatewayCallContext (L153; type); HrpGatewayErrorMappingRefSchema (L164; value); HrpGatewayErrorMappingRef (L175; type); WEBHOOK_SIGNATURE_ALGORITHMS (L194; value); WebhookSignatureAlgorithm (L199; type); WebhookSignatureAlgorithmSchema (L201; value); WebhookRawHeadersSchema (L205; value); WebhookReceiverRequestSchema (L215; value); WebhookReceiverRequest (L233; type); WebhookReceiverVerifiedSchema (L241; value); WebhookReceiverVerified (L253; type); HRP_GATEWAY_METHODS (L270; value); HrpGatewayMethod (L297; type); HrpGatewayMethodSchema (L298; value); HrpGatewayMethodCapabilitySchema (L305; value); NowProvider (L333; type); FaultHooksSchema (L341; value); FaultHooks (L353; type); HrpGatewayPort (L371; type).

Resolved root names declared here: 23. Direct named consumer files: 8.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-fix-f2-gateway-hrpui.test.mjs:18; packages/contracts/tests/gateway-providers-ports.test.mjs:19; packages/contracts/tests/gateway-providers-ports.test.mjs:20; packages/contracts/tests/gateway-providers-ports.test.mjs:21; packages/contracts/tests/gateway-providers-ports.test.mjs:22; packages/contracts/tests/gateway-providers-ports.test.mjs:23; packages/contracts/tests/gateway-providers-ports.test.mjs:24; packages/contracts/tests/gateway-providers-ports.test.mjs:25; packages/contracts/tests/gateway-providers-ports.test.mjs:26; packages/contracts/tests/gateway-providers-ports.test.mjs:27; packages/contracts/tests/gateway-providers-ports.test.mjs:28; packages/contracts/tests/gateway-providers-ports.test.mjs:29.

### 4.9 packages/contracts/src/commands/identity.ts

Git blob: `d8f9d1878ba3a637b77e0bf199b3ab5d4471e104`. Source SHA-256: `7a512aa0986e5f5470cfda52dc3d6ba32e439c4e2b92e7d253232394612498b1`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (17): NormalizedPhoneSchema (L36; value); CitizenIdNumberSchema (L42; value); IdentitySignalSchema (L46; value); IdentitySignal (L66; type); IdentityProvenanceSchema (L69; value); IdentityProvenance (L82; type); CreateOrMatchLaborProfileInputSchema (L88; value); CreateOrMatchLaborProfileInput (L107; type); ExactMatchOutcomeSchema (L118; value); PossibleMatchOutcomeSchema (L128; value); NewProfileOutcomeSchema (L141; value); MatchingOutcomeResultSchema (L158; value); MatchingOutcomeResult (L164; type); CreateOrMatchLaborProfileCommandSchema (L170; value); DncActionSchema (L189; value); DncAction (L206; type); isDncActionValid (L209; value).

Resolved root names declared here: 17. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:28; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:29; packages/contracts/tests/identity.test.mjs:19; packages/contracts/tests/identity.test.mjs:20; packages/contracts/tests/identity.test.mjs:21; packages/contracts/tests/identity.test.mjs:22; packages/contracts/tests/identity.test.mjs:23; packages/contracts/tests/identity.test.mjs:24; packages/contracts/tests/identity.test.mjs:25; packages/contracts/tests/identity.test.mjs:26; packages/contracts/tests/identity.test.mjs:27; packages/contracts/tests/identity.test.mjs:28; packages/contracts/tests/profile-intake.test.mjs:39; packages/contracts/tests/profile-intake.test.mjs:40.

### 4.10 packages/contracts/src/commands/intake.ts

Git blob: `32c59f2f1842d224ae9834198a3c34fedde4da54`. Source SHA-256: `a6b89e32d5fd97dfe0634d97c81bfaa844859d9446238e2e0fec144b1950fa33`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (22): CitizenIdentitySchema (L36; value); CitizenIdentity (L44; type); BusinessIntentSchema (L53; value); BusinessIntent (L77; type); IntakeContextRefSchema (L97; value); IntakeContextRef (L126; type); IntakeSubmissionPayloadSchema (L139; value); IntakeSubmissionPayload (L178; type); DraftDigestSchema (L186; value); StaffReviewContextSchema (L190; value); StaffReviewConfirmationSchema (L204; value); StaffReviewConfirmation (L213; type); PreviewResolverRequestSchema (L222; value); PreviewResolverCandidateSchema (L243; value); PreviewResolverResultSchema (L253; value); PreviewResolverRequest (L261; type); PreviewResolverResult (L262; type); SUBMISSION_LIFECYCLE (L273; value); SubmissionLifecycle (L274; type); SubmissionLifecycleSchema (L275; value); SUBMISSION_LIFECYCLE_PROPOSED (L282; value); isConfirmationValid (L285; value).

Resolved root names declared here: 22. Direct named consumer files: 2.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:30; packages/contracts/tests/profile-intake.test.mjs:26; packages/contracts/tests/profile-intake.test.mjs:27; packages/contracts/tests/profile-intake.test.mjs:28; packages/contracts/tests/profile-intake.test.mjs:29; packages/contracts/tests/profile-intake.test.mjs:30; packages/contracts/tests/profile-intake.test.mjs:31; packages/contracts/tests/profile-intake.test.mjs:32; packages/contracts/tests/profile-intake.test.mjs:33; packages/contracts/tests/profile-intake.test.mjs:34; packages/contracts/tests/profile-intake.test.mjs:35; packages/contracts/tests/profile-intake.test.mjs:36; packages/contracts/tests/profile-intake.test.mjs:37; packages/contracts/tests/profile-intake.test.mjs:38.

### 4.11 packages/contracts/src/commands/interactions.ts

Git blob: `1cc18a1a3f561a49b9fc835fd0c92a88da49fb78`. Source SHA-256: `20a05bee6fb0fb379d8719c583009da2160e5b5149a18e18297bf1eb5c552530`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (19): INTERACTION_KINDS (L37; value); InteractionKind (L44; type); InteractionKindSchema (L45; value); INTERACTION_OUTCOMES (L50; value); InteractionOutcome (L57; type); InteractionOutcomeSchema (L58; value); InteractionContextRefSchema (L75; value); InteractionContextRef (L108; type); InteractionAssigneeRefSchema (L121; value); InteractionAssigneeRef (L130; type); RecordTalentInteractionInputSchema (L143; value); RecordTalentInteractionInput (L172; type); RecordClientInteractionInputSchema (L184; value); RecordClientInteractionInput (L212; type); InteractionTimestampsSchema (L229; value); InteractionTimestamps (L236; type); RecordInteractionResultSchema (L244; value); RecordInteractionResult (L250; type); INTERACTION_PAYLOAD_FORBIDDEN_FIELDS (L259; value).

Resolved root names declared here: 19. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:36; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:37; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:56; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:31; packages/contracts/tests/placement-case-interactions.test.mjs:30; packages/contracts/tests/placement-case-interactions.test.mjs:31; packages/contracts/tests/placement-case-interactions.test.mjs:32; packages/contracts/tests/placement-case-interactions.test.mjs:33; packages/contracts/tests/placement-case-interactions.test.mjs:34; packages/contracts/tests/placement-case-interactions.test.mjs:35; packages/contracts/tests/placement-case-interactions.test.mjs:36; packages/contracts/tests/placement-case-interactions.test.mjs:37; packages/contracts/tests/placement-case-interactions.test.mjs:38; packages/contracts/tests/placement-case-interactions.test.mjs:39; packages/contracts/tests/placement-case-interactions.test.mjs:40.

### 4.12 packages/contracts/src/commands/kpi.ts

Git blob: `7289cc8cdd54db179286b2ca0e70aa2b367219b0`. Source SHA-256: `fafe6c2a9988f4fa8cac428eaf1e0500998e416a9ea5bc71a6e8b77f2ee3ea7c`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (13): KPI_TARGET_TYPES (L39; value); KPITargetTypeSchema (L50; value); KPI_PERIODS (L58; value); KPIPeriodSchema (L64; value); KPIAssignmentInputSchema (L77; value); KPIAssignmentResultSchema (L133; value); KPIRevisionInputSchema (L159; value); KPIProposeInputSchema (L192; value); KPIProposeResultSchema (L226; value); KPIReadResultSchema (L246; value); KPI_MODULE_NAMESPACE (L292; value); KPIModuleNamespaceSchema (L294; value); KPI_PATCH_FORBIDDEN (L303; value).

Resolved root names declared here: 13. Direct named consumer files: 1.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:52; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:53; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:54; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:55; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:56; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:57; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:58; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:59; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:60; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:61; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:62; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:63; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:64.

### 4.13 packages/contracts/src/commands/mappings.ts

Git blob: `533443a94db2b2c61d674b3702706cda67c78356`. Source SHA-256: `080b1775a78b6ce2b485f8bc67c2b496373d28d7ec379ee0b507fdbe7f71db91`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (21): ExternalContactRefSchema (L47; value); ExternalContactRef (L62; type); EXTERNAL_CONTACT_LINK_STATES (L82; value); ExternalContactLinkStateSchema (L87; value); ExternalContactLinkTargetSchema (L104; value); ExternalContactLinkTarget (L130; type); ExternalContactLinkSchema (L160; value); ExternalContactLink (L235; type); TalentTargetRefSchema (L246; value); ClientTargetRefSchema (L255; value); CanonicalTargetRefSchema (L275; value); CanonicalTargetRef (L279; type); ExternalConversationRefSchema (L296; value); ExternalConversationRef (L317; type); ConversationLinkSchema (L321; value); ConversationLink (L375; type); ResolveContactByExternalRequestSchema (L386; value); ResolveContactByExternalResultSchema (L399; value); ListExternalContactLinksRequestSchema (L411; value); ListExternalContactLinksResultSchema (L424; value); MAPPING_PATCH_FORBIDDEN (L442; value).

Resolved root names declared here: 21. Direct named consumer files: 4.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:43; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:44; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:55; packages/contracts/tests/queries-events-mappings.test.mjs:62; packages/contracts/tests/queries-events-mappings.test.mjs:63; packages/contracts/tests/queries-events-mappings.test.mjs:64; packages/contracts/tests/queries-events-mappings.test.mjs:65; packages/contracts/tests/queries-events-mappings.test.mjs:66; packages/contracts/tests/queries-events-mappings.test.mjs:67; packages/contracts/tests/queries-events-mappings.test.mjs:68; packages/contracts/tests/queries-events-mappings.test.mjs:69; packages/contracts/tests/queries-events-mappings.test.mjs:70; packages/contracts/tests/queries-events-mappings.test.mjs:71; packages/contracts/tests/queries-events-mappings.test.mjs:72; packages/contracts/tests/queries-events-mappings.test.mjs:73; packages/contracts/tests/queries-events-mappings.test.mjs:74; packages/contracts/tests/queries-events-mappings.test.mjs:75; packages/contracts/tests/queries-events-mappings.test.mjs:76.

### 4.14 packages/contracts/src/commands/merge-review.ts

Git blob: `fccfa067943acba017667e9ee3bb6df4475156ac`. Source SHA-256: `ce461e9bff580157c138c4c40d8cd55e61121b5a65c25557460f6bae6abdace8`.

OWNER_DECISION_BLOCKED: proposed/unavailable review and merge boundary; retain markers.

Local declarations (23): MERGE_REVIEW_PROPOSED_DEPENDENCIES (L52; value); MergeReviewProposedDependency (L57; type); ProposedUnavailableMarkerSchema (L66; value); ProposedUnavailableMarker (L84; type); MergeLaborProfilesInputSchema (L99; value); MergeLaborProfilesInput (L117; type); MergeLaborProfilesResultSchema (L125; value); MergeLaborProfilesResult (L133; type); CommitReviewDecisionInputSchema (L144; value); CommitReviewDecisionInput (L161; type); CommitReviewDecisionResultSchema (L165; value); CommitReviewDecisionResult (L173; type); ResolvePossibleMatchInputSchema (L184; value); ResolvePossibleMatchInput (L201; type); ResolvePossibleMatchResultSchema (L205; value); ResolvePossibleMatchResult (L213; type); SupersedeReviewStatusInputSchema (L222; value); SupersedeReviewStatusInput (L239; type); SupersedeReviewStatusResultSchema (L243; value); SupersedeReviewStatusResult (L251; type); buildProposedUnavailableMarker (L261; value); isProposedUnavailable (L280; value); MERGE_REVIEW_FORBIDDEN_FIELDS (L290; value).

Resolved root names declared here: 23. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:21; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:22; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:23; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:24; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:25; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:26; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:27; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:28.

### 4.15 packages/contracts/src/commands/next-action.ts

Git blob: `10789a508f896988c4067348296ca20a32af152a`. Source SHA-256: `01fc6c2b72babf8f43bb8b333ac793be6aba347aa4d2f1e1e61c5b269d1fecdd`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (28): NEXT_ACTION_KINDS (L41; value); NextActionKind (L42; type); NextActionKindSchema (L43; value); NEXT_ACTION_TARGET_KINDS (L49; value); NextActionTargetKind (L54; type); NextActionTargetKindSchema (L56; value); NextActionPlacementCaseTargetRefSchema (L66; value); NextActionClientOpportunityTargetRefSchema (L74; value); NextActionStandaloneTargetRefSchema (L84; value); NextActionTargetRefSchema (L91; value); NextActionTargetRef (L96; type); NextActionScheduleSchema (L109; value); NextActionSchedule (L125; type); SNOOZE_MODES (L140; value); SnoozeMode (L141; type); SnoozeModeSchema (L142; value); CreateNextActionInputSchema (L152; value); CreateNextActionInput (L186; type); NextActionPatchSchema (L195; value); NextActionPatch (L205; type); UpdateNextActionInputSchema (L216; value); UpdateNextActionInput (L227; type); NextActionRevisionRefSchema (L238; value); NextActionRevisionRef (L251; type); NextActionResultSchema (L262; value); NextActionResult (L273; type); NEXT_ACTION_PATCH_FORBIDDEN (L284; value); NEXT_ACTION_STATUS_VALUES (L317; value).

Resolved root names declared here: 28. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/next-action.test.mjs:16; packages/contracts/tests/next-action.test.mjs:17; packages/contracts/tests/next-action.test.mjs:18; packages/contracts/tests/next-action.test.mjs:19; packages/contracts/tests/next-action.test.mjs:20; packages/contracts/tests/next-action.test.mjs:21; packages/contracts/tests/next-action.test.mjs:22; packages/contracts/tests/next-action.test.mjs:23; packages/contracts/tests/next-action.test.mjs:24; packages/contracts/tests/next-action.test.mjs:25; packages/contracts/tests/next-action.test.mjs:26.

### 4.16 packages/contracts/src/commands/outbox.ts

Git blob: `fe2767418ee9f6c34c1ac2ca10ec7cd5dc2e37d9`. Source SHA-256: `bf0700569f861978618ea5eba222fca11f4bc1608976f6d3a9fcd5749861be89`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (30): OutboxPublisherPortNameSchema (L58; value); OutboxTemplateEngineKindSchema (L71; value); OutboxIntentDraftSchema (L77; value); OutboxIntentDraft (L131; type); OutboxPublishHookSchema (L143; value); OutboxPublishHook (L151; type); OUTBOX_DELIVERY_CHANNELS (L174; value); OutboxDeliveryChannel (L178; type); OutboxDeliveryChannelSchema (L180; value); OutboxDeliveryIntentSchema (L184; value); OutboxDeliveryIntent (L228; type); DeliveryReceiptOutcomes (L239; value); DeliveryReceiptOutcome (L240; type); DeliveryReceiptOutcomeSchema (L242; value); OutboxDeliveryReceiptSchema (L245; value); OutboxDeliveryReceipt (L258; type); DELIVERY_REPORTING_STATES (L283; value); DeliveryReportingState (L290; type); DeliveryReportingStateSchema (L292; value); DELIVERY_FAILURE_REASONS (L308; value); DeliveryFailureReason (L317; type); DeliveryFailureReasonSchema (L319; value); DeliveryReportingEventSchema (L323; value); DeliveryReportingEvent (L388; type); OutboxClaimRequestSchema (L401; value); OutboxClaimLeaseSchema (L416; value); OutboxClaimLease (L427; type); OutboxClaimAckSchema (L429; value); OutboxClaimAck (L441; type); OUTBOX_PATCH_FORBIDDEN (L452; value).

Resolved root names declared here: 30. Direct named consumer files: 8.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/outbox.test.mjs:17; packages/contracts/tests/outbox.test.mjs:18; packages/contracts/tests/outbox.test.mjs:19; packages/contracts/tests/outbox.test.mjs:20; packages/contracts/tests/outbox.test.mjs:21; packages/contracts/tests/outbox.test.mjs:22; packages/contracts/tests/outbox.test.mjs:23; packages/contracts/tests/outbox.test.mjs:24; packages/contracts/tests/outbox.test.mjs:25; packages/contracts/tests/outbox.test.mjs:26; packages/contracts/tests/outbox.test.mjs:27; packages/contracts/tests/outbox.test.mjs:28; packages/contracts/tests/outbox.test.mjs:29.

### 4.17 packages/contracts/src/commands/placement-case.ts

Git blob: `16d1c77cb2a6b623285f5bc982ceb0799db99a87`. Source SHA-256: `2ab0ebef60fb0be4549e25d0cbec54a96bffbd3903fbbb3bef3a03c64be7d9f1`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (19): PLACEMENT_CASE_PATCH_WHITELIST (L45; value); PlacementCasePatchKey (L53; type); PLACEMENT_CASE_PATCH_FORBIDDEN (L56; value); PlacementCasePatchSchema (L95; value); PlacementCasePatch (L124; type); OpenPlacementCaseInputSchema (L137; value); OpenPlacementCaseInput (L176; type); UpdatePlacementCaseInputSchema (L182; value); UpdatePlacementCaseInput (L195; type); ClosePlacementCaseInputSchema (L206; value); ClosePlacementCaseInput (L238; type); OpenPlacementCaseResultSchema (L246; value); OpenPlacementCaseResult (L254; type); UpdatePlacementCaseResultSchema (L261; value); UpdatePlacementCaseResult (L277; type); ClosePlacementCaseResultSchema (L281; value); ClosePlacementCaseResult (L299; type); PLACEMENT_CASE_INTENDED_STAGE_ALLOWED (L318; value); isIntendedStageAllowed (L324; value).

Resolved root names declared here: 19. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:32; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:33; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:51; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:54; packages/contracts/tests/placement-case-interactions.test.mjs:19; packages/contracts/tests/placement-case-interactions.test.mjs:20; packages/contracts/tests/placement-case-interactions.test.mjs:21; packages/contracts/tests/placement-case-interactions.test.mjs:22; packages/contracts/tests/placement-case-interactions.test.mjs:23; packages/contracts/tests/placement-case-interactions.test.mjs:24; packages/contracts/tests/placement-case-interactions.test.mjs:25; packages/contracts/tests/placement-case-interactions.test.mjs:26; packages/contracts/tests/placement-case-interactions.test.mjs:27; packages/contracts/tests/placement-case-interactions.test.mjs:28; packages/contracts/tests/placement-case-interactions.test.mjs:29.

### 4.18 packages/contracts/src/commands/ports.ts

Git blob: `d6d98ccb8c6044c4dbf625f930e4405d9749cedb`. Source SHA-256: `3781573906e68e5291f25e6fb756768ee06e67ec1c5c837ae128f92c988f8ade`.

UNKNOWN ownership split: port DTOs versus application abstractions; no neutral promotion.

Local declarations (18): WorkerPortEnqueueRequestSchema (L31; value); WorkerPortEnqueueResultSchema (L46; value); WorkerPortEnqueueResult (L53; type); SchedulerPortEnqueueRequestSchema (L60; value); SchedulerPortEnqueueResultSchema (L77; value); QueuePortEnqueueRequestSchema (L88; value); QueuePortEnqueueResultSchema (L101; value); SecretPortAccessLevelSchema (L116; value); SecretPortGetRequestSchema (L122; value); SecretPortHandleSchema (L136; value); SecretPortHandle (L144; type); SECRET_PORT_FORBIDDEN_FIELDS (L152; value); ObjectStorageUploadRequestSchema (L171; value); ObjectStorageHandleSchema (L186; value); ObjectStorageHandle (L199; type); ObjectStorageReadRequestSchema (L205; value); ObjectStorageReadResultSchema (L217; value); PORTS_FORBIDDEN_IMPORTS (L234; value).

Resolved root names declared here: 18. Direct named consumer files: 2.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/gateway-providers-ports.test.mjs:44; packages/contracts/tests/gateway-providers-ports.test.mjs:45; packages/contracts/tests/gateway-providers-ports.test.mjs:46; packages/contracts/tests/gateway-providers-ports.test.mjs:47; packages/contracts/tests/gateway-providers-ports.test.mjs:48; packages/contracts/tests/gateway-providers-ports.test.mjs:49; packages/contracts/tests/gateway-providers-ports.test.mjs:50; packages/contracts/tests/gateway-providers-ports.test.mjs:51; packages/contracts/tests/gateway-providers-ports.test.mjs:52; packages/contracts/tests/gateway-providers-ports.test.mjs:53; packages/contracts/tests/gateway-providers-ports.test.mjs:54; packages/contracts/tests/gateway-providers-ports.test.mjs:55.

### 4.19 packages/contracts/src/commands/profile.ts

Git blob: `4d20203ba2828b7baf45a81c2f0d627ff29f9d04`. Source SHA-256: `6e89063e9119f800daf6f23b07ff14f6ddeee0a02ee7f1e297c619bac0c66d77`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (11): ContactAddressSchema (L33; value); PatchFieldSchema (L43; value); PROFILE_PATCH_WHITELIST (L54; value); ProfilePatchKey (L64; type); ProfilePatchSchema (L70; value); ProfilePatch (L92; type); UpdateLaborProfileInputSchema (L97; value); UpdateLaborProfileInput (L116; type); PROFILE_PATCH_FORBIDDEN_FIELDS (L121; value); ProfilePatchSafeSchema (L144; value); UpdateLaborProfileResultSchema (L164; value).

Resolved root names declared here: 11. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:30; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:31; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:52; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:53; packages/contracts/tests/profile-intake.test.mjs:20; packages/contracts/tests/profile-intake.test.mjs:21; packages/contracts/tests/profile-intake.test.mjs:22; packages/contracts/tests/profile-intake.test.mjs:23; packages/contracts/tests/profile-intake.test.mjs:24; packages/contracts/tests/profile-intake.test.mjs:25.

### 4.20 packages/contracts/src/commands/providers.ts

Git blob: `8954781c44260959aa1f9f1e27ff1873014f8c3a`. Source SHA-256: `de7af407a57479d45c929d4367f37e8d75a84d34980dee386004ed33582b0857`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (16): HRP_PROVIDER_CAPABILITIES (L37; value); HrpProviderCapability (L51; type); HrpProviderCapabilitySchema (L53; value); ProviderCapabilityTokenSchema (L61; value); ProviderConnectionRefSchema (L70; value); ProviderConnectionRef (L80; type); ChatwootMessageKindSchema (L91; value); ChatwootNormalizedWebhookSchema (L98; value); ChatwootNormalizedWebhook (L114; type); ZaloOaNormalizedWebhookSchema (L118; value); ZaloOaNormalizedWebhook (L132; type); ProviderProbeRequestSchema (L145; value); ProviderProbeOutcomeSchema (L156; value); ProviderProbeResultSchema (L165; value); ProviderProbeResult (L196; type); PROVIDER_PAYLOAD_FORBIDDEN (L205; value).

Resolved root names declared here: 16. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/gateway-providers-ports.test.mjs:32; packages/contracts/tests/gateway-providers-ports.test.mjs:33; packages/contracts/tests/gateway-providers-ports.test.mjs:34; packages/contracts/tests/gateway-providers-ports.test.mjs:35; packages/contracts/tests/gateway-providers-ports.test.mjs:36; packages/contracts/tests/gateway-providers-ports.test.mjs:37; packages/contracts/tests/gateway-providers-ports.test.mjs:38; packages/contracts/tests/gateway-providers-ports.test.mjs:39; packages/contracts/tests/gateway-providers-ports.test.mjs:40; packages/contracts/tests/gateway-providers-ports.test.mjs:41.

### 4.21 packages/contracts/src/commands/queries.ts

Git blob: `1baaf0c0edae7003dfb024f4cf125510e5ee51ca`. Source SHA-256: `ffbc49a7e15cf417255c8ea3ef42185415dbb4e3237788c2682c47f84d883c05`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (25): CursorPaginationInputSchema (L73; value); CursorPaginationOutputSchema (L80; value); QueryScopeSchema (L101; value); QueryScope (L122; type); ContextQueryRequestSchema (L131; value); ContextPanelIdentitySummarySchema (L172; value); ContextPanelPlacementCaseSchema (L185; value); ContextPanelAvailabilitySchema (L226; value); ContextPanelCurrentRelationshipSchema (L241; value); ContextPanelNextActionSummarySchema (L252; value); ContextPanelRecentInteractionSchema (L265; value); ContextPanelContactabilitySchema (L288; value); ContextPanelSuppressionSummarySchema (L299; value); ContextPanelResultSchema (L312; value); ContextPanelResult (L352; type); ReadOnlyIdentityPreviewRequestSchema (L361; value); ReadOnlyIdentityCandidateSchema (L376; value); ReadOnlyIdentityPreviewResultSchema (L392; value); AllowedActionsQueryRequestSchema (L409; value); AllowedActionSchema (L418; value); AllowedActionsQueryResultSchema (L436; value); ContactabilityCheckRequestSchema (L451; value); ContactabilityCheckResultSchema (L461; value); ConstantsSnapshotSchema (L494; value); QUERIES_PATCH_FORBIDDEN (L584; value).

Resolved root names declared here: 25. Direct named consumer files: 7.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/fixtures-coverage-0.7.test.mjs:45; packages/contracts/tests/queries-events-mappings.test.mjs:23; packages/contracts/tests/queries-events-mappings.test.mjs:24; packages/contracts/tests/queries-events-mappings.test.mjs:25; packages/contracts/tests/queries-events-mappings.test.mjs:26; packages/contracts/tests/queries-events-mappings.test.mjs:27; packages/contracts/tests/queries-events-mappings.test.mjs:28; packages/contracts/tests/queries-events-mappings.test.mjs:29; packages/contracts/tests/queries-events-mappings.test.mjs:30; packages/contracts/tests/queries-events-mappings.test.mjs:31; packages/contracts/tests/queries-events-mappings.test.mjs:32; packages/contracts/tests/queries-events-mappings.test.mjs:33; packages/contracts/tests/queries-events-mappings.test.mjs:34; packages/contracts/tests/queries-events-mappings.test.mjs:35; packages/contracts/tests/queries-events-mappings.test.mjs:36; packages/contracts/tests/queries-events-mappings.test.mjs:37; packages/contracts/tests/queries-events-mappings.test.mjs:38; packages/contracts/tests/queries-events-mappings.test.mjs:39; packages/contracts/tests/queries-events-mappings.test.mjs:40; packages/contracts/tests/queries-events-mappings.test.mjs:41; packages/contracts/tests/queries-events-mappings.test.mjs:42; packages/contracts/tests/queries-events-mappings.test.mjs:43; packages/contracts/tests/queries-events-mappings.test.mjs:44; packages/contracts/tests/queries-events-mappings.test.mjs:45.

### 4.22 packages/contracts/src/commands/routing.ts

Git blob: `946fa0c40a89f14576022fafbae7de2db6b8ad14`. Source SHA-256: `d6474264b1629eb3cba1af217f76b0aaf33a584505e7f59bdb1c2fbe6ff06f86`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (10): ROUTING_STRATEGIES (L43; value); RoutingStrategySchema (L48; value); RoutingEligibleSetSchema (L56; value); RoutingFixedOwnerSchema (L104; value); RoutingWeightEntrySchema (L116; value); RoutingPoolSchema (L139; value); RoutingReservationSchema (L245; value); RoutingDecisionSchema (L256; value); UpdateRoutingPoolInputSchema (L288; value); ROUTING_PATCH_FORBIDDEN (L318; value).

Resolved root names declared here: 10. Direct named consumer files: 3.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:22; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:23; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:24; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:25; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:26; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:27; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:28; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:29; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:30; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:31.

### 4.23 packages/contracts/src/commands/scheduling.ts

Git blob: `3792a7d2e535478fe54ecf39e59aa02294efb6d8`. Source SHA-256: `b793887446ad3b5cbd398810fb06e18bd5eec9ad2c09f6ef62019e3ee13b1407`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (21): PLANNING_BATCH_ITEM_KINDS (L37; value); PlanningBatchItemKind (L42; type); PlanningBatchItemKindSchema (L44; value); PLANNING_BATCH_ITEM_OUTCOMES (L60; value); PlanningBatchItemOutcome (L66; type); PlanningBatchItemOutcomeSchema (L68; value); PlanningBatchNextActionItemSchema (L90; value); PlanningBatchAvailabilityItemSchema (L102; value); PlanningBatchSuppressionItemSchema (L138; value); PlanningBatchItemSchema (L163; value); PlanningBatchItem (L168; type); PlanningBatchInputSchema (L181; value); PlanningBatchInput (L190; type); PlanningBatchItemErrorSchema (L196; value); PlanningBatchItemError (L212; type); PlanningBatchItemResultSchema (L238; value); PlanningBatchItemResult (L322; type); PlanningBatchSummarySchema (L332; value); PlanningBatchSummary (L355; type); PlanningBatchResultSchema (L368; value); PlanningBatchResult (L387; type).

Resolved root names declared here: 21. Direct named consumer files: 3.

Test import locations (active and reference artifacts; see §6): apps/context-panel/tests/assistant-api.test.mjs:913; apps/context-panel/tests/assistant-service.test.mjs:23; apps/context-panel/tests/assistant-service.test.mjs:24; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:39; packages/contracts/tests/scheduling.test.mjs:16; packages/contracts/tests/scheduling.test.mjs:17; packages/contracts/tests/scheduling.test.mjs:18; packages/contracts/tests/scheduling.test.mjs:19; packages/contracts/tests/scheduling.test.mjs:20; packages/contracts/tests/scheduling.test.mjs:21; packages/contracts/tests/scheduling.test.mjs:22.

### 4.24 packages/contracts/src/commands/suppression.ts

Git blob: `bf2d693b8fdf28b7459cab46c44291d680c712d7`. Source SHA-256: `f32b33c4defa7f786aeb8a4c41ca6f76fbc4dc2384b3a20ea9cbf0dd88f33be6`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (27): SUPPRESSION_TARGET_KINDS (L61; value); SuppressionTargetKind (L66; type); SuppressionTargetKindSchema (L67; value); LaborProfileTargetRefSchema (L74; value); LaborProfileTargetRef (L87; type); ExternalContactTargetRefSchema (L96; value); ExternalContactTargetRef (L109; type); RecipientFenceTokenRefSchema (L118; value); RecipientFenceTokenRef (L131; type); SuppressionTargetRefSchema (L135; value); SuppressionTargetRef (L140; type); CommitSuppressionInputSchema (L171; value); CommitSuppressionInput (L208; type); CommitSuppressionResultSchema (L222; value); CommitSuppressionResult (L255; type); ContactChannelIdSchema (L264; value); DispatchAuthorizationCheckInputSchema (L282; value); DispatchAuthorizationCheckInput (L299; type); DISPATCH_AUTHORIZATION_OUTCOMES (L312; value); DispatchAuthorizationOutcome (L317; type); DispatchAuthorizationOutcomeSchema (L319; value); DISPATCH_DENY_REASONS (L332; value); DispatchDenyReason (L340; type); DispatchDenyReasonSchema (L341; value); DispatchAuthorizationCheckResultSchema (L343; value); DispatchAuthorizationCheckResult (L388; type); SUPPRESSION_PATCH_FORBIDDEN (L404; value).

Resolved root names declared here: 27. Direct named consumer files: 2.

Test import locations (active and reference artifacts; see §6): apps/integration-api/tests/orchestrator.test.mjs:21; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:38; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:57; packages/contracts/tests/suppression.test.mjs:15; packages/contracts/tests/suppression.test.mjs:16; packages/contracts/tests/suppression.test.mjs:17; packages/contracts/tests/suppression.test.mjs:18; packages/contracts/tests/suppression.test.mjs:19; packages/contracts/tests/suppression.test.mjs:20; packages/contracts/tests/suppression.test.mjs:21; packages/contracts/tests/suppression.test.mjs:22; packages/contracts/tests/suppression.test.mjs:24.

### 4.25 packages/contracts/src/enums.ts

Git blob: `e3835d183496605eec9089605ec06b4500ff16bc`. Source SHA-256: `ff6ee50aada938843bfa4546ef0d268ef8eac702bfa4690d18f396520f1d1581`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (35): PLACEMENT_CASE_STAGES (L18; value); PlacementCaseStage (L28; type); PlacementCaseStageSchema (L29; value); PLACEMENT_CASE_STAGE_LABELS_VI (L31; value); CLOSED_CASE_STATUS (L49; value); ClosedCaseStatus (L50; type); ClosedCaseStatusSchema (L51; value); CASE_CLOSE_REASONS (L53; value); CaseCloseReason (L64; type); CaseCloseReasonSchema (L65; value); CASE_CLOSE_REASON_LABELS_VI (L67; value); CloseCommandSchema (L82; value); AVAILABILITIES (L93; value); Availability (L100; type); AvailabilitySchema (L101; value); AVAILABILITY_LABELS_VI (L103; value); CURRENT_RELATIONSHIPS (L117; value); CurrentRelationship (L124; type); CurrentRelationshipSchema (L125; value); CURRENT_RELATIONSHIP_LABELS_VI (L127; value); CURRENT_RELATIONSHIP_READONLY (L141; value); NEXT_ACTION_STATUSES (L147; value); NextActionStatus (L148; type); NextActionStatusSchema (L149; value); MATCHING_OUTCOMES (L158; value); MatchingOutcome (L163; type); MatchingOutcomeSchema (L164; value); EXTERNAL_CONTACT_MATCH_STATES (L178; value); ExternalContactMatchState (L183; type); ExternalContactMatchStateSchema (L185; value); EVIDENCE_KINDS (L193; value); EvidenceKind (L194; type); EvidenceKindSchema (L195; value); FORBIDDEN_CLOSED_VARIANTS (L201; value); SCHEMA_VERSION (L209; value).

Resolved root names declared here: 36. Direct named consumer files: 14.

Test import locations (active and reference artifacts; see §6): apps/integration-api/tests/outbox.test.mjs:30; packages/contracts/tests/availability.test.mjs:22; packages/contracts/tests/availability.test.mjs:23; packages/contracts/tests/enums-extra.test.mjs:23; packages/contracts/tests/enums-extra.test.mjs:24; packages/contracts/tests/enums-extra.test.mjs:25; packages/contracts/tests/enums.legacy.mjs:4; packages/contracts/tests/enums.legacy.mjs:5; packages/contracts/tests/enums.legacy.mjs:6; packages/contracts/tests/enums.legacy.mjs:7; packages/contracts/tests/enums.legacy.mjs:8; packages/contracts/tests/enums.legacy.mjs:9; packages/contracts/tests/enums.legacy.mjs:10; packages/contracts/tests/enums.legacy.mjs:11; packages/contracts/tests/enums.legacy.mjs:12; packages/contracts/tests/enums.legacy.mjs:13; packages/contracts/tests/enums.legacy.mjs:14; packages/contracts/tests/enums.legacy.mjs:15; packages/contracts/tests/enums.legacy.mjs:16; packages/contracts/tests/enums.legacy.mjs:17; packages/contracts/tests/enums.legacy.mjs:18; packages/contracts/tests/enums.legacy.mjs:19; packages/contracts/tests/enums.legacy.mjs:20; packages/contracts/tests/enums.test.mjs:16; packages/contracts/tests/enums.test.mjs:17; packages/contracts/tests/enums.test.mjs:18; packages/contracts/tests/enums.test.mjs:19; packages/contracts/tests/enums.test.mjs:20; packages/contracts/tests/enums.test.mjs:21; packages/contracts/tests/enums.test.mjs:22; packages/contracts/tests/enums.test.mjs:23; packages/contracts/tests/enums.test.mjs:24; packages/contracts/tests/enums.test.mjs:25; packages/contracts/tests/enums.test.mjs:26; packages/contracts/tests/enums.test.mjs:27; packages/contracts/tests/enums.test.mjs:28; packages/contracts/tests/enums.test.mjs:29; packages/contracts/tests/enums.test.mjs:30; packages/contracts/tests/enums.test.mjs:31; packages/contracts/tests/enums.test.mjs:32; packages/contracts/tests/envelopes.legacy.mjs:17; packages/contracts/tests/envelopes.test.mjs:34; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:17; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:45; packages/contracts/tests/fixtures-fix-f2-gateway-hrpui.test.mjs:17; packages/contracts/tests/gateway-providers-ports.test.mjs:57; packages/contracts/tests/identity.test.mjs:32; packages/contracts/tests/next-action.test.mjs:28; packages/contracts/tests/outbox.test.mjs:31; packages/contracts/tests/placement-case-interactions.test.mjs:41; packages/contracts/tests/profile-intake.test.mjs:41; packages/contracts/tests/queries-events-mappings.test.mjs:78; packages/contracts/tests/routing-analytics-kpi-ai.test.mjs:90; packages/contracts/tests/scheduling.test.mjs:24; packages/contracts/tests/suppression.test.mjs:26.

### 4.26 packages/contracts/src/envelopes.ts

Git blob: `b8b45dc6c863dca046660717684cbed764d2d9c7`. Source SHA-256: `f68ea4866c4f33786b03298ca531b454ff97437200d31457d5ac89d1f32af4d2`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (16): RequestEnvelopeBaseSchema (L15; value); RequestEnvelopeBase (L27; type); commandRequest (L30; value); OperationReferenceSchema (L34; value); OperationQuerySchema (L42; value); OperationQuery (L51; type); AcceptedResponseSchema (L59; value); AppliedResponseBaseSchema (L68; value); applyApplied (L77; value); FailedResponseSchema (L88; value); commandResponse (L96; value); ResponseEnvelopeSchema (L104; value); AcceptedResponse (L110; type); FailedResponse (L111; type); canonicalize (L118; value); idempotencyDigest (L135; value).

Resolved root names declared here: 16. Direct named consumer files: 3.

Test import locations (active and reference artifacts; see §6): apps/integration-api/tests/gateway.test.mjs:30; apps/integration-api/tests/gateway.test.mjs:31; packages/contracts/tests/envelopes.legacy.mjs:5; packages/contracts/tests/envelopes.legacy.mjs:7; packages/contracts/tests/envelopes.legacy.mjs:11; packages/contracts/tests/envelopes.legacy.mjs:14; packages/contracts/tests/envelopes.legacy.mjs:15; packages/contracts/tests/envelopes.legacy.mjs:16; packages/contracts/tests/envelopes.legacy.mjs:19; packages/contracts/tests/envelopes.legacy.mjs:20; packages/contracts/tests/envelopes.legacy.mjs:21; packages/contracts/tests/envelopes.legacy.mjs:22; packages/contracts/tests/envelopes.test.mjs:20; packages/contracts/tests/envelopes.test.mjs:22; packages/contracts/tests/envelopes.test.mjs:27; packages/contracts/tests/envelopes.test.mjs:30; packages/contracts/tests/envelopes.test.mjs:31; packages/contracts/tests/envelopes.test.mjs:32; packages/contracts/tests/envelopes.test.mjs:33; packages/contracts/tests/envelopes.test.mjs:36; packages/contracts/tests/envelopes.test.mjs:37; packages/contracts/tests/envelopes.test.mjs:38; packages/contracts/tests/envelopes.test.mjs:39; packages/contracts/tests/envelopes.test.mjs:40; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:22; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:23.

### 4.27 packages/contracts/src/errors.ts

Git blob: `e4c94d7487f2c3bfd0214a5aa4a18abb742d27c7`. Source SHA-256: `54df177848033b509789607377dd92f7319a08988b29558e8100f6c5e7e867e0`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (17): ErrorCodeSchema (L3; value); ErrorCode (L15; type); RetryClassSchema (L17; value); RetryClass (L25; type); ERROR_POLICIES (L31; value); errorMessagesVi (L65; value); ErrorFieldPathSchema (L79; value); ContractErrorSchema (L100; value); StructuredErrorSchema (L109; value); ContractError (L110; type); StructuredError (L111; type); ErrorListSchema (L113; value); makeError (L115; value); ERROR_RETRYABLE_DEFAULT (L123; value); ERROR_HTTP_HINT (L131; value); ContractValidationResult (L144; type); validateContract (L152; value).

Resolved root names declared here: 17. Direct named consumer files: 3.

Test import locations (active and reference artifacts; see §6): apps/integration-api/tests/orchestrator.test.mjs:21; packages/contracts/tests/envelopes.legacy.mjs:23; packages/contracts/tests/envelopes.test.mjs:41; packages/contracts/tests/errors.legacy.mjs:4; packages/contracts/tests/errors.legacy.mjs:5; packages/contracts/tests/errors.legacy.mjs:6; packages/contracts/tests/errors.legacy.mjs:7; packages/contracts/tests/errors.legacy.mjs:8; packages/contracts/tests/errors.legacy.mjs:9; packages/contracts/tests/errors.legacy.mjs:10; packages/contracts/tests/errors.legacy.mjs:11; packages/contracts/tests/errors.legacy.mjs:12; packages/contracts/tests/errors.test.mjs:23; packages/contracts/tests/errors.test.mjs:24; packages/contracts/tests/errors.test.mjs:25; packages/contracts/tests/errors.test.mjs:26; packages/contracts/tests/errors.test.mjs:27; packages/contracts/tests/errors.test.mjs:28; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:25; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:26.

### 4.28 packages/contracts/src/index.ts

Git blob: `5f924dfbca218c47bda866537cea280fccf5f90a`. Source SHA-256: `be9e99f29e59a0191bf404a0cc0a8ef39bdf4ef72c8f20099d7f0c73ade2df3e`.

Package export facade; existing CRM surface only.

Local declarations (1): PACKAGE_VERSION (L52; value).

Resolved root names declared here: 1. Direct named consumer files: 0.

Test import locations (active and reference artifacts; see §6): None found by direct named-import matching; not proof of missing tests..

### 4.29 packages/contracts/src/primitives.ts

Git blob: `7fcab769d188cc96a9e93a2d4544c4d4c9115154`. Source SHA-256: `359a37758e18069ed69e5e1015b8ea00ed18c6b2f598b6125afce01962ef56ac`.

TARGET_ONLY by default; symbol-group qualifications in §3 apply.

Local declarations (28): SchemaVersionSchema (L5; value); BUSINESS_TIMEZONE (L13; value); BusinessTimezoneSchema (L14; value); CorrelationIdSchema (L23; value); CommandIdSchema (L24; value); IdempotencyKeySchema (L30; value); OrganizationIdSchema (L36; value); CanonicalIdSchema (L37; value); ExpectedVersionSchema (L38; value); CommandNameSchema (L40; value); IdempotencyScopeSchema (L46; value); IdempotencyScope (L53; type); IsoTimestampSchema (L56; value); CalendarDateSchema (L63; value); ProviderNameSchema (L71; value); ConnectionIdSchema (L76; value); UserActorClaimSchema (L83; value); ServiceActorClaimSchema (L86; value); DelegatedUserActorClaimSchema (L89; value); ActorSchema (L97; value); ActorClaim (L102; type); HrpUiCommandSourceSchema (L108; value); IntegrationCommandSourceSchema (L115; value); CommandSourceSchema (L122; value); CommandSourceClaim (L126; type); InboundSourceSchema (L128; value); EvidenceIdSchema (L139; value); EvidenceRefSchema (L140; value).

Resolved root names declared here: 29. Direct named consumer files: 6.

Test import locations (active and reference artifacts; see §6): packages/contracts/tests/enums-extra.test.mjs:26; packages/contracts/tests/enums-extra.test.mjs:27; packages/contracts/tests/enums-extra.test.mjs:28; packages/contracts/tests/envelopes.legacy.mjs:6; packages/contracts/tests/envelopes.legacy.mjs:8; packages/contracts/tests/envelopes.legacy.mjs:9; packages/contracts/tests/envelopes.legacy.mjs:10; packages/contracts/tests/envelopes.legacy.mjs:12; packages/contracts/tests/envelopes.legacy.mjs:13; packages/contracts/tests/envelopes.legacy.mjs:18; packages/contracts/tests/envelopes.test.mjs:21; packages/contracts/tests/envelopes.test.mjs:23; packages/contracts/tests/envelopes.test.mjs:24; packages/contracts/tests/envelopes.test.mjs:25; packages/contracts/tests/envelopes.test.mjs:26; packages/contracts/tests/envelopes.test.mjs:28; packages/contracts/tests/envelopes.test.mjs:29; packages/contracts/tests/envelopes.test.mjs:35; packages/contracts/tests/envelopes.test.mjs:42; packages/contracts/tests/envelopes.test.mjs:43; packages/contracts/tests/envelopes.test.mjs:44; packages/contracts/tests/errors.legacy.mjs:13; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:18; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:19; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:20; packages/contracts/tests/fixtures-coverage-0.7.test.mjs:58; packages/contracts/tests/fixtures-fix-f1-f5.test.mjs:33; packages/contracts/tests/identity.test.mjs:31.

## 5. Direct consumer map

T = explicit type-only syntax. V = value-capable import syntax, not proof of execution. R = direct syntactic parse/safeParse call. Imported schemas can also be composed into local schemas without direct parse calls. Appendix includes reference lines and namespace members.

### apps/context-panel/src/assistant/service.ts

Git blob: `8371eff5900485d67c4f6091e741ceeea9c458ab`.

- V L27: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/assistant/types.ts

Git blob: `6314d5e7bc5cc19fddb59dea1f8817ae310aebda`.

- T L22: `AIProposalSchema` as `AIProposalSchema` from `@hrp-engagement/contracts` (named).
- T L23: `ApplyAIProposalInputSchema` as `ApplyAIProposalInputSchema` from `@hrp-engagement/contracts` (named).
- T L24: `AIProviderConfigReadSchema` as `AIProviderConfigReadSchema` from `@hrp-engagement/contracts` (named).
- T L26: `PlanningBatchItemOutcome` as `PlanningBatchItemOutcome` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/dashboard/types.ts

Git blob: `2e2af6aab6d97e34f9ff2444e2cf299130ccb286`.

- V L34: `METRIC_GRAINS` as `METRIC_GRAINS` from `@hrp-engagement/contracts` (named).
- V L35: `METRIC_PERIODS` as `METRIC_PERIODS` from `@hrp-engagement/contracts` (named).
- V L36: `METRIC_UNITS` as `METRIC_UNITS` from `@hrp-engagement/contracts` (named).
- V L37: `METRIC_ATTRIBUTION_STATES` as `METRIC_ATTRIBUTION_STATES` from `@hrp-engagement/contracts` (named).
- V L38: `KPI_TARGET_TYPES` as `KPI_TARGET_TYPES` from `@hrp-engagement/contracts` (named).
- V L39: `KPI_PERIODS` as `KPI_PERIODS` from `@hrp-engagement/contracts` (named).
- T L43: `MetricGrainSchema` as `MetricGrainSchema` from `@hrp-engagement/contracts` (named).
- T L44: `MetricUnitSchema` as `MetricUnitSchema` from `@hrp-engagement/contracts` (named).
- T L45: `MetricPeriodSchema` as `MetricPeriodSchema` from `@hrp-engagement/contracts` (named).
- T L46: `MetricAttributionStateSchema` as `MetricAttributionStateSchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/orchestrator-wire.ts

Git blob: `efb842414096542348b9d8d23011b2d69f715ff2`.

- T L78: `ActorClaim` as `ActorClaim` from `@hrp-engagement/contracts` (named).
- T L78: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/routing/config-store.ts

Git blob: `df9af242e13b41c7e4e0b424fbc1def906029492`.

- V L15: `UpdateRoutingPoolInputSchema` as `UpdateRoutingPoolInputSchema` from `@hrp-engagement/contracts` (named).
- V L16: `RoutingPoolSchema` as `RoutingPoolSchema` from `@hrp-engagement/contracts` (named).

- R L47: `RoutingPoolSchema.parse(…)`.
- R L85: `RoutingPoolSchema.parse(…)`.
- R L93: `RoutingPoolSchema.parse(…)`.

### apps/context-panel/src/routing/service.ts

Git blob: `a3bf8c026572196f6240271b68f4a133f7b0522f`.

- V L29: `RoutingPoolSchema` as `RoutingPoolSchema` from `@hrp-engagement/contracts` (named).
- V L30: `ROUTING_PATCH_FORBIDDEN` as `ROUTING_PATCH_FORBIDDEN` from `@hrp-engagement/contracts` (named).

- R L166: `RoutingPoolSchema.parse(…)`.

### apps/context-panel/src/routing/types.ts

Git blob: `b277c46bc6b68db09069d9f1b27e93624443c5e3`.

- V L17: `RoutingPoolSchema` as `RoutingPoolSchema` from `@hrp-engagement/contracts` (named).
- V L18: `RoutingDecisionSchema` as `RoutingDecisionSchema` from `@hrp-engagement/contracts` (named).
- V L19: `ROUTING_STRATEGIES` as `ROUTING_STRATEGIES` from `@hrp-engagement/contracts` (named).
- V L20: `RoutingWeightEntrySchema` as `RoutingWeightEntrySchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/availability.tsx

Git blob: `d639e77da037a82321633549a30a46630db93dda`.

- T L9: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).
- V L11: `AVAILABILITIES` as `AVAILABILITIES` from `@hrp-engagement/contracts` (named).
- V L12: `AVAILABILITY_LABELS_VI` as `AVAILABILITY_LABELS_VI` from `@hrp-engagement/contracts` (named).
- T L14: `Availability` as `Availability` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/close-reason-select.tsx

Git blob: `29baf45cd6377a9a998ad0b8c3a884695bf65e99`.

- V L10: `CASE_CLOSE_REASONS` as `CASE_CLOSE_REASONS` from `@hrp-engagement/contracts` (named).
- V L11: `CASE_CLOSE_REASON_LABELS_VI` as `CASE_CLOSE_REASON_LABELS_VI` from `@hrp-engagement/contracts` (named).
- T L13: `CaseCloseReason` as `CaseCloseReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/context-panel.tsx

Git blob: `cd06a033ec97b5621df1cfe9996bbce734d254e5`.

- T L12: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).
- V L14: `CURRENT_RELATIONSHIP_LABELS_VI` as `CURRENT_RELATIONSHIP_LABELS_VI` from `@hrp-engagement/contracts` (named).
- T L16: `CurrentRelationship` as `CurrentRelationship` from `@hrp-engagement/contracts` (named).
- T L21: `CaseCloseReason` as `CaseCloseReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/current-relationship.tsx

Git blob: `082cda0c7ab3e9badd21669d5f8acd7bc30df4c9`.

- V L10: `CURRENT_RELATIONSHIPS` as `CURRENT_RELATIONSHIPS` from `@hrp-engagement/contracts` (named).
- V L11: `CURRENT_RELATIONSHIP_LABELS_VI` as `CURRENT_RELATIONSHIP_LABELS_VI` from `@hrp-engagement/contracts` (named).
- T L13: `CurrentRelationship` as `CurrentRelationship` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/intake-review.tsx

Git blob: `62e2906bc06fa917e40e5b79b9a93b17fb792026`.

- V L20: `AVAILABILITIES` as `AVAILABILITIES` from `@hrp-engagement/contracts` (named).
- V L21: `AVAILABILITY_LABELS_VI` as `AVAILABILITY_LABELS_VI` from `@hrp-engagement/contracts` (named).
- V L22: `PLACEMENT_CASE_STAGES` as `PLACEMENT_CASE_STAGES` from `@hrp-engagement/contracts` (named).
- V L23: `PLACEMENT_CASE_STAGE_LABELS_VI` as `PLACEMENT_CASE_STAGE_LABELS_VI` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/placement-case.tsx

Git blob: `f34f4940d66f87d423bdeca66885b84c44032efd`.

- T L11: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).
- V L13: `PLACEMENT_CASE_STAGES` as `PLACEMENT_CASE_STAGES` from `@hrp-engagement/contracts` (named).
- V L14: `PLACEMENT_CASE_STAGE_LABELS_VI` as `PLACEMENT_CASE_STAGE_LABELS_VI` from `@hrp-engagement/contracts` (named).
- V L15: `CASE_CLOSE_REASONS` as `CASE_CLOSE_REASONS` from `@hrp-engagement/contracts` (named).
- V L16: `CASE_CLOSE_REASON_LABELS_VI` as `CASE_CLOSE_REASON_LABELS_VI` from `@hrp-engagement/contracts` (named).
- T L20: `CaseCloseReason` as `CaseCloseReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/components/talent-panel.tsx

Git blob: `fd4216e49b5ef82b9d98090359a2ba0bc4d7e3b5`.

- T L9: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/mock-api.ts

Git blob: `8bffda19f3231193809eccd199eefdf434b18565`.

- T L18: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/src/ui/types.ts

Git blob: `3977bf96e6be0481255cce803f15e635610a0dd6`.

- T L11: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (named).
- T L18: `ContextPanelResult` as `ContextPanelResult` from `@hrp-engagement/contracts` (re-export).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/context-panel/tests/assistant-api.test.mjs

Git blob: `1b46a5395e75728a0d07c94f7bf40af4fceb2a46`.

- V L913: `PlanningBatchResultSchema` as `PlanningBatchResultSchema` from `../../../packages/contracts/dist/commands/scheduling.js` (named).

- R L952: `PlanningBatchResultSchema.safeParse(…)`.

### apps/context-panel/tests/assistant-service.test.mjs

Git blob: `1a6aa91a4b73283816b27e12001822ecb05c29a9`.

- V L23: `PlanningBatchResultSchema` as `PlanningBatchResultSchema` from `../../../packages/contracts/dist/commands/scheduling.js` (dynamic-destructure).
- V L24: `PlanningBatchItemResultSchema` as `PlanningBatchItemResultSchema` from `../../../packages/contracts/dist/commands/scheduling.js` (dynamic-destructure).

- R L661: `PlanningBatchResultSchema.safeParse(…)`.
- R L697: `PlanningBatchResultSchema.safeParse(…)`.
- R L720: `PlanningBatchResultSchema.safeParse(…)`.
- R L746: `PlanningBatchResultSchema.safeParse(…)`.
- R L788: `PlanningBatchResultSchema.safeParse(…)`.
- R L818: `PlanningBatchResultSchema.safeParse(…)`.
- R L863: `PlanningBatchResultSchema.safeParse(…)`.
- R L891: `PlanningBatchResultSchema.safeParse(…)`.
- R L1034: `PlanningBatchResultSchema.safeParse(…)`.
- R L1067: `PlanningBatchResultSchema.safeParse(…)`.
- R L1096: `PlanningBatchResultSchema.safeParse(…)`.
- R L1127: `PlanningBatchResultSchema.safeParse(…)`.
- R L1160: `PlanningBatchResultSchema.safeParse(…)`.
- R L770: `PlanningBatchItemResultSchema.safeParse(…)`.
- R L916: `PlanningBatchItemResultSchema.safeParse(…)`.
- R L933: `PlanningBatchItemResultSchema.safeParse(…)`.

### apps/context-panel/tests/panel-ui.test.mjs

Git blob: `1626e3a38d9e67c5a57228bbba5eb2d4045055ca`.

- V L18: `*` as `ENUMS` from `@hrp-engagement/contracts` (dynamic-namespace).

- R L78: `ENUMS.CaseCloseReasonSchema.safeParse(…)`.
- R L83: `ENUMS.AvailabilitySchema.safeParse(…)`.
- R L88: `ENUMS.CurrentRelationshipSchema.safeParse(…)`.

### apps/core-1.10-media/src/evidence-store.ts

Git blob: `b8041ca6979dcbda347db1d5de33a8b11f900230`.

- V L24: `OrganizationIdSchema` as `OrganizationIdSchema` from `@hrp-engagement/contracts` (named).
- V L25: `SchemaVersionSchema` as `SchemaVersionSchema` from `@hrp-engagement/contracts` (named).

- R L166: `OrganizationIdSchema.parse(…)`.
- R L167: `SchemaVersionSchema.parse(…)`.

### apps/core-1.10-media/src/policy-harness.ts

Git blob: `13998708599664d8007767fae7afe872ef04ec54`.

- V L26: `ObjectStorageReadRequestSchema` as `ObjectStorageReadRequestSchema` from `@hrp-engagement/contracts` (named).
- T L27: `ObjectStorageHandle` as `ObjectStorageHandle` from `@hrp-engagement/contracts` (named).

- R L75: `ObjectStorageReadRequestSchema.parse(…)`.

### apps/core-1.10-media/src/secret-provider.ts

Git blob: `080f8196919d708b13ee5036cad414cd48227595`.

- V L30: `SecretPortHandleSchema` as `SecretPortHandleSchema` from `@hrp-engagement/contracts` (named).
- V L31: `SecretPortGetRequestSchema` as `SecretPortGetRequestSchema` from `@hrp-engagement/contracts` (named).
- V L32: `OrganizationIdSchema` as `OrganizationIdSchema` from `@hrp-engagement/contracts` (named).
- T L33: `SecretPortHandle` as `SecretPortHandle` from `@hrp-engagement/contracts` (named).
- V L35: `SECRET_PORT_FORBIDDEN_FIELDS` as `SECRET_PORT_FORBIDDEN_FIELDS` from `@hrp-engagement/contracts` (named).

- R L149: `SecretPortHandleSchema.parse(…)`.
- R L142: `SecretPortGetRequestSchema.parse(…)`.
- R L143: `OrganizationIdSchema.parse(…)`.

### apps/integration-api/src/dlq/index.ts

Git blob: `7c9dc897e99a3a9e6e7606b95879c1e682019292`.

- V L30: `OUTBOX_PATCH_FORBIDDEN` as `OUTBOX_PATCH_FORBIDDEN` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/gateway/ledger.ts

Git blob: `c5450a3c182bafd06ae17a08466f0ee09e2ad156`.

- T L15: `HrpGatewayMethod` as `HrpGatewayMethod` from `@hrp-engagement/contracts` (named).
- T L15: `HrpGatewayTier` as `HrpGatewayTier` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/gateway/mock-gateway.ts

Git blob: `258a7d780b01300753c27d6c4d0c37b1a4fc01d4`.

- T L22: `HrpGatewayMethod` as `HrpGatewayMethod` from `@hrp-engagement/contracts` (named).
- T L23: `HrpGatewayTier` as `HrpGatewayTier` from `@hrp-engagement/contracts` (named).
- V L25: `makeError` as `makeError` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/gateway/scenarios.ts

Git blob: `e7adc8bc3a063c4f6f94cb4bf53e2afe9f51c802`.

- T L17: `MatchingOutcome` as `MatchingOutcome` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/gateway/types.ts

Git blob: `d68a1ae475ea15a23ff63f10831b8aacc1d723ef`.

- V L19: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (named).
- V L20: `MatchingOutcomeSchema` as `MatchingOutcomeSchema` from `@hrp-engagement/contracts` (named).
- T L21: `MatchingOutcome` as `MatchingOutcome` from `@hrp-engagement/contracts` (named).
- T L22: `AcceptedResponse` as `AcceptedResponse` from `@hrp-engagement/contracts` (named).
- V L25: `CommandIdSchema` as `CommandIdSchema` from `@hrp-engagement/contracts` (named).
- V L26: `IdempotencyKeySchema` as `IdempotencyKeySchema` from `@hrp-engagement/contracts` (named).
- V L27: `OrganizationIdSchema` as `OrganizationIdSchema` from `@hrp-engagement/contracts` (named).
- V L28: `SchemaVersionSchema` as `SchemaVersionSchema` from `@hrp-engagement/contracts` (named).
- V L29: `ActorSchema` as `ActorSchema` from `@hrp-engagement/contracts` (named).
- V L32: `HrpGatewayMethodSchema` as `HrpGatewayMethodSchema` from `@hrp-engagement/contracts` (named).
- V L33: `HrpGatewayTierSchema` as `HrpGatewayTierSchema` from `@hrp-engagement/contracts` (named).
- V L34: `HrpGatewayCallContextSchema` as `HrpGatewayCallContextSchema` from `@hrp-engagement/contracts` (named).
- T L35: `HrpGatewayMethod` as `HrpGatewayMethod` from `@hrp-engagement/contracts` (named).
- T L36: `HrpGatewayTier` as `HrpGatewayTier` from `@hrp-engagement/contracts` (named).
- T L37: `HrpGatewayCallContext` as `HrpGatewayCallContext` from `@hrp-engagement/contracts` (named).
- V L40: `AcceptedResponseSchema` as `AcceptedResponseSchema` from `@hrp-engagement/contracts` (named).
- V L41: `OperationReferenceSchema` as `OperationReferenceSchema` from `@hrp-engagement/contracts` (named).
- V L42: `ErrorCodeSchema` as `ErrorCodeSchema` from `@hrp-engagement/contracts` (named).
- T L43: `ContractError` as `ContractError` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/orchestrator/dnc-handler.ts

Git blob: `4d9d3d9228762f96cad0d67c775828d80d93dcb8`.

- V L25: `IntegrationCommandSourceSchema` as `IntegrationCommandSourceSchema` from `@hrp-engagement/contracts` (named).
- V L26: `IntakeContextRefSchema` as `IntakeContextRefSchema` from `@hrp-engagement/contracts` (named).
- V L27: `ActorSchema` as `ActorSchema` from `@hrp-engagement/contracts` (named).
- V L28: `CommitSuppressionInputSchema` as `CommitSuppressionInputSchema` from `@hrp-engagement/contracts` (named).
- T L29: `ActorClaim` as `ActorClaim` from `@hrp-engagement/contracts` (named).
- T L32: `HrpGatewayMethod` as `HrpGatewayMethod` from `@hrp-engagement/contracts` (named).

- R L73: `IntegrationCommandSourceSchema.parse(…)`.
- R L93: `IntakeContextRefSchema.parse(…)`.
- R L148: `ActorSchema.parse(…)`.
- R L137: `CommitSuppressionInputSchema.parse(…)`.
- R L153: `CommitSuppressionInputSchema.parse(…)`.

### apps/integration-api/src/orchestrator/intake-orchestrator.ts

Git blob: `a7b40a978f78a225f84b07cb74f7124bf12750bd`.

- V L45: `isConfirmationValid` as `isConfirmationValid` from `@hrp-engagement/contracts` (named).
- V L46: `StaffReviewContextSchema` as `StaffReviewContextSchema` from `@hrp-engagement/contracts` (named).
- T L47: `StaffReviewConfirmation` as `StaffReviewConfirmation` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/orchestrator/steps.ts

Git blob: `d700a7e7d1531099fc15702ca89cb0f305749fa5`.

- T L16: `HrpGatewayMethod` as `HrpGatewayMethod` from `@hrp-engagement/contracts` (named).
- T L16: `MatchingOutcome` as `MatchingOutcome` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/outbox/ac3-handler.ts

Git blob: `75b5536d0647fe6b6cd302db06d87e5653577c90`.

- V L20: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/outbox/delivery-receipt.ts

Git blob: `0aa349baaf63b4ad7ed5a899dc7c44ee54494630`.

- V L21: `OutboxDeliveryReceiptSchema` as `OutboxDeliveryReceiptSchema` from `@hrp-engagement/contracts` (named).
- T L22: `OutboxDeliveryReceipt` as `OutboxDeliveryReceipt` from `@hrp-engagement/contracts` (named).

- R L70: `OutboxDeliveryReceiptSchema.safeParse(…)`.

### apps/integration-api/src/outbox/delivery-reporting.ts

Git blob: `2cfabcd0bcf6e5d3c1b5e53e66b447d426a18cd0`.

- V L27: `DeliveryReportingEventSchema` as `DeliveryReportingEventSchema` from `@hrp-engagement/contracts` (named).
- T L28: `DeliveryReportingEvent` as `DeliveryReportingEvent` from `@hrp-engagement/contracts` (named).
- T L29: `DeliveryReportingState` as `DeliveryReportingState` from `@hrp-engagement/contracts` (named).
- T L30: `DeliveryFailureReason` as `DeliveryFailureReason` from `@hrp-engagement/contracts` (named).

- R L112: `DeliveryReportingEventSchema.safeParse(…)`.

### apps/integration-api/src/outbox/dispatcher.ts

Git blob: `d1d11c52453f56a82bfff5e302d123d98d5c3334`.

- V L23: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/outbox/http-handler.ts

Git blob: `a42b91a57a1db4ede202b12737421a26747d92af`.

- T L20: `DeliveryReportingEvent` as `DeliveryReportingEvent` from `@hrp-engagement/contracts` (named).
- T L20: `DeliveryFailureReason` as `DeliveryFailureReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/outbox/reconciliation.ts

Git blob: `bf7ea087eb341c517cecd569b0bbc3d2cd34f8fc`.

- T L26: `DeliveryReportingEvent` as `DeliveryReportingEvent` from `@hrp-engagement/contracts` (named).
- T L27: `DeliveryFailureReason` as `DeliveryFailureReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/outbox/unknown-handler.ts

Git blob: `8058042ae1e3ea0c78563ba6a3302f188a5079cc`.

- T L25: `DeliveryReportingEvent` as `DeliveryReportingEvent` from `@hrp-engagement/contracts` (named).
- T L26: `DeliveryFailureReason` as `DeliveryFailureReason` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/receiver/connection-registry.ts

Git blob: `fb6c56d1842bd691f28aa3cad33764ba8d6de1d2`.

- T L40: `WebhookSignatureAlgorithm` as `WebhookSignatureAlgorithm` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/receiver/dedupe.ts

Git blob: `388c4b2b40b675ab5c59f04d756088de1e13a2f6`.

- T L23: `EventReceiptSchema` as `EventReceiptSchema` from `@hrp-engagement/contracts` (named).
- T L24: `OutboxDeliveryIntentSchema` as `OutboxDeliveryIntentSchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/receiver/handler.ts

Git blob: `b6b0fcf141661b0d91ff5f2c6c934f529532b8f4`.

- V L45: `WebhookReceiverRequestSchema` as `WebhookReceiverRequestSchema` from `@hrp-engagement/contracts` (named).
- T L45: `WebhookReceiverVerified` as `WebhookReceiverVerified` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-api/src/receiver/scope-verify.ts

Git blob: `f31afc5672f42e3709349ef6a2fab7a6b8a56719`.

- V L22: `OrganizationIdSchema` as `OrganizationIdSchema` from `@hrp-engagement/contracts` (named).
- V L23: `ConnectionIdSchema` as `ConnectionIdSchema` from `@hrp-engagement/contracts` (named).
- V L24: `ProviderNameSchema` as `ProviderNameSchema` from `@hrp-engagement/contracts` (named).

- R L61: `OrganizationIdSchema.safeParse(…)`.
- R L69: `ConnectionIdSchema.safeParse(…)`.
- R L77: `ProviderNameSchema.safeParse(…)`.

### apps/integration-api/tests/gateway.test.mjs

Git blob: `e66358ac7e2d1fe6e7deeb96cd37ade2b4380750`.

- V L30: `AcceptedResponseSchema` as `AcceptedResponseSchema` from `@hrp-engagement/contracts` (dynamic-destructure).
- V L31: `OperationReferenceSchema` as `OperationReferenceSchema` from `@hrp-engagement/contracts` (dynamic-destructure).

- R L136: `AcceptedResponseSchema.safeParse(…)`.
- R L584: `AcceptedResponseSchema.safeParse(…)`.
- R L608: `AcceptedResponseSchema.safeParse(…)`.
- R L609: `AcceptedResponseSchema.safeParse(…)`.
- R L622: `AcceptedResponseSchema.safeParse(…)`.
- R L643: `AcceptedResponseSchema.parse(…)`.

### apps/integration-api/tests/orchestrator.test.mjs

Git blob: `f43b4243d339e1038b7e401489d3e9385d375366`.

- V L21: `ErrorCodeSchema` as `ErrorCodeSchema` from `@hrp-engagement/contracts` (named).
- V L21: `CommitSuppressionInputSchema` as `CommitSuppressionInputSchema` from `@hrp-engagement/contracts` (named).

- R L609: `ErrorCodeSchema.safeParse(…)`.
- R L853: `CommitSuppressionInputSchema.safeParse(…)`.
- R L868: `CommitSuppressionInputSchema.safeParse(…)`.
- R L901: `CommitSuppressionInputSchema.safeParse(…)`.
- R L969: `CommitSuppressionInputSchema.safeParse(…)`.

### apps/integration-api/tests/outbox.test.mjs

Git blob: `ab22125938f79d022c97f8445acf25e7bac9bd69`.

- V L30: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (dynamic-promise-all).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### apps/integration-worker/src/shared-types.ts

Git blob: `28a4fa21044f492204d75a22aae77e00898ef019`.

- V L17: `HrpGatewayMethodSchema` as `HrpGatewayMethodSchema` from `@hrp-engagement/contracts` (named).
- V L18: `HrpGatewayCallContextSchema` as `HrpGatewayCallContextSchema` from `@hrp-engagement/contracts` (named).
- V L19: `AcceptedResponseSchema` as `AcceptedResponseSchema` from `@hrp-engagement/contracts` (named).
- V L20: `AppliedResponseBaseSchema` as `AppliedResponseBaseSchema` from `@hrp-engagement/contracts` (named).
- V L21: `FailedResponseSchema` as `FailedResponseSchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/config/src/types.ts

Git blob: `84d33d8011cd46fca07b9a11d887b6b7ed925e17`.

- V L16: `SCHEMA_VERSION` as `SCHEMA_VERSION` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/integration-store/src/adapters.ts

Git blob: `20f46d10079dd897af89d6dbbe5eea2bb91d6c53`.

- T L10: `ExternalContactLinkSchema` as `ExternalContactLinkSchema` from `@hrp-engagement/contracts` (named).
- T L11: `ConversationLinkSchema` as `ConversationLinkSchema` from `@hrp-engagement/contracts` (named).
- T L12: `EventReceiptSchema` as `EventReceiptSchema` from `@hrp-engagement/contracts` (named).
- T L13: `ExternalContactLinkTarget` as `ExternalContactLinkTarget` from `@hrp-engagement/contracts` (named).
- T L14: `CanonicalTargetRef` as `CanonicalTargetRef` from `@hrp-engagement/contracts` (named).
- T L15: `ExternalConversationRef` as `ExternalConversationRef` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/integration-store/src/repos/contact-link.ts

Git blob: `29e025d45f3844316797bc573a36353f17425cfb`.

- T L18: `ExternalContactLink` as `ContractExternalContactLink` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/integration-store/src/repos/conversation-link.ts

Git blob: `7be26c33168917c1f5e69140dccd4b2574247462`.

- T L11: `ConversationLink` as `ContractConversationLink` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/integration-store/src/repos/event-receipt.ts

Git blob: `c04ecbbf72bdcd7665d2b248a6e263f558685d01`.

- T L37: `EventReceiptSchema` as `EventReceiptSchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

### packages/integration-store/src/types.ts

Git blob: `e10c3dd75fcc845229bdb507d0de22083ef03bbc`.

- T L11: `ExternalContactLinkSchema` as `ExternalContactLinkSchema` from `@hrp-engagement/contracts` (named).
- T L12: `ConversationLinkSchema` as `ConversationLinkSchema` from `@hrp-engagement/contracts` (named).
- T L13: `ExternalContactRefSchema` as `ExternalContactRefSchema` from `@hrp-engagement/contracts` (named).
- T L14: `ExternalConversationRefSchema` as `ExternalConversationRefSchema` from `@hrp-engagement/contracts` (named).
- T L15: `EventReceiptSchema` as `EventReceiptSchema` from `@hrp-engagement/contracts` (named).
- T L16: `OutboxDeliveryIntentSchema` as `OutboxDeliveryIntentSchema` from `@hrp-engagement/contracts` (named).
- T L17: `OutboxDeliveryReceiptSchema` as `OutboxDeliveryReceiptSchema` from `@hrp-engagement/contracts` (named).

No direct imported-validator parse call found; no claim about transitive/manual validation.

## 6. Test artifacts

Package script: `npm run build && node --test tests/*.test.mjs`.

Active glob files:

- packages/contracts/tests/availability.test.mjs
- packages/contracts/tests/enums-extra.test.mjs
- packages/contracts/tests/enums.test.mjs
- packages/contracts/tests/envelopes.test.mjs
- packages/contracts/tests/errors.test.mjs
- packages/contracts/tests/fixtures-coverage-0.7.test.mjs
- packages/contracts/tests/fixtures-fix-f1-f5.test.mjs
- packages/contracts/tests/fixtures-fix-f2-gateway-hrpui.test.mjs
- packages/contracts/tests/gateway-providers-ports.test.mjs
- packages/contracts/tests/identity.test.mjs
- packages/contracts/tests/next-action.test.mjs
- packages/contracts/tests/outbox.test.mjs
- packages/contracts/tests/placement-case-interactions.test.mjs
- packages/contracts/tests/profile-intake.test.mjs
- packages/contracts/tests/queries-events-mappings.test.mjs
- packages/contracts/tests/routing-analytics-kpi-ai.test.mjs
- packages/contracts/tests/scheduling.test.mjs
- packages/contracts/tests/suppression.test.mjs

Other tracked test-directory artifacts (not selected directly by that glob; helpers can be imported by tests):

- packages/contracts/tests/_synthetic-coverage.md
- packages/contracts/tests/_synthetic-pending.md
- packages/contracts/tests/contracts.synthetic.mjs
- packages/contracts/tests/enums.legacy.mjs
- packages/contracts/tests/envelopes.legacy.mjs
- packages/contracts/tests/errors.legacy.mjs
- packages/contracts/tests/test-helpers.mjs

The appendix testCases list contains AST test declarations, not a runtime fixture count. Namespace imports and helper-composed validators can cover more symbols than the module-level named-import map shows.

## 7. Corrections to prior inventory

- packages/config/src/types.ts imports SCHEMA_VERSION as a value and uses it in schema composition. The earlier ProviderConfig/GatewayTier/AiProviderConfig type-only import claim was incorrect.
- packages/integration-store contains explicit type imports from contracts. Absence of direct imported parse calls does not mean absence of manual validation.
- integration-worker shared-types imports contract validators and also declares a local gateway transport wrapper. It is not wholly disconnected from the shared package; wrapper semantic reconciliation remains pending.
- Scheduling is consumed by the CORE/1.13 assistant. It must not be described as uniformly unwired.
- Merge/review input/result schemas have active tests in fixtures-fix-f1-f5.test.mjs. Prior claims of no test file/coverage evidence were incorrect; see appendix imports and testCases.
- No KpiSnapshot export is present in the resolved root surface. Do not classify that invented symbol as an implemented module.
- Zod schema exports are runtime validator values; inferred TypeScript types are separate declarations. A runtime schema is not HRP runtime implementation.

## 8. Pending reconciliation evidence

- CRM_CONTRACT_GAP_REPORT.md and THIN_SLICE_CAPABILITY_MATRIX.md: pending HRP-side evidence; do not invent method acceptance or capability keys.
- HRP baseline commit/version and accepted module list: pending. A future hrp-contract-baseline.json must cite supplied evidence, not a CRM assumption.
- Authority hierarchy/P0-C discovery: pending cross-repo reconciliation.
- Actor delegation/authentication, DNC canonical mapping, review/merge availability and delivery semantics: pending authoritative HRP decisions.
- RecordClientInteraction, ConstantsSnapshot, SecretPort/other ports, KPI namespace and AI proposal/provider config ownership: pending allocation/reconciliation.

UNKNOWN means evidence missing. OWNER_DECISION_BLOCKED means an identified semantic choice needs its authorized decision-maker. Neither status permits implementation or stable promotion.

## 9. History and future extraction proposal

Actual package history at baseline:

- 7f21a270c98f24e8e0bce0fdf8297f58ee65b1c9 chore: checkpoint accepted V7.9a integration core and mock

The package was introduced by one snapshot commit. This is not evidence that subtree extraction fails. No split/extraction has been attempted in this task.

After explicit authorization, try git subtree split for packages/contracts in an isolated checkout and verify source/history before pushing. Do not invent a history-percentage threshold or discard provenance.

Target repo proposed by Owner: https://github.com/nobita6986/hrp-integration-contracts.git. Its live remote state was not queried in this inventory task.

Later neutral bootstrap remains DRAFT_RECONCILIATION with empty stable root until bilateral acceptance. No consumer migration, CRM package removal, version/exports change, publish or tag is authorized here.

## 10. Verification limitations

- Consumer references/parse calls are syntactic evidence, not control-flow proof or test coverage/pass claims; aliases passed through helpers and shadowed names require manual tracing.
- Direct package imports, contract-relative imports/re-exports and literal dynamic imports are scanned; transitive consumer graph and computed imports are not claimed exhaustive.
- Non-type import syntax may be used only in a type context; actual runtime behavior is not inferred from syntax alone.
- Root export checker uses pinned baseline source and installed TypeScript; dependency declarations are local, not evidence of HRP support.
- Computed imports, symbol shadowing and helper alias/control-flow paths need targeted follow-up when deciding migrations.
- AST import/export evidence demonstrates source presence, not correct business behavior, coverage completeness or successful runtime execution.
- Historical 385/398 fixture counts are not reproduced by this task. No new PASS or independent audit verdict is issued.

## 11. Change boundaries and handoff

This task changes only this inventory, its JSON evidence appendix and the inspection script. Preserve the pre-existing docs/contracts/inventory.md delta. Frozen contracts, runtime apps, dependencies, old manifests and Git history remain unchanged.

No bootstrap, split, commit, push, tag, publish, merge, deployment or HRP runtime work. STOP at READY FOR TIER-0 INVENTORY REVIEW. CONTRACT-02 requires a separate brief.
