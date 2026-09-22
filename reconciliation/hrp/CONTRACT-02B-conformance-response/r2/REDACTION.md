# C-01 — deterministic redaction and projection omission

## Proposed algorithm

Apply only after canonical object authorization, and only when
identitySummary was requested. A failure to redact is not an authorization
denial and cannot conceal an object-permission failure.

1. Require a string. Reject Cc/Cf controls and format characters, including
   bidi controls, before whitespace normalization. Reject non-strings,
   empty input and unsupported input safely.
2. Normalize Unicode NFC. Trim Unicode White_Space and collapse its internal
   runs to ASCII space. Empty output is unsafe.
3. Split on that space. Each token must match the complete grammar
   `^\p{L}[\p{L}\p{M}]*(?:['-]\p{L}[\p{L}\p{M}]*)*$` with Unicode mode.
   Only ASCII apostrophe U+0027 and hyphen U+002D are separators. Thus a token
   cannot begin/end with punctuation, begin with a combining mark, or have
   consecutive punctuation. Other punctuation, digits and pictographs fail.
4. Segment tokens into Unicode extended grapheme clusters using a conforming
   grapheme segmenter. Each token must contain at least two grapheme clusters
   beginning with a Unicode letter. Punctuation never counts toward this
   minimum. This refines r1 so punctuation cannot make a one-letter name safe.
5. Emit the first letter-led grapheme of each token plus exactly U+2022 U+2022
   (`••`); join with one ASCII space. Do not reveal suffix or token length.
   Initials and token count remain observable; this is redaction, not anonymity.
6. Missing/unavailable segmenter, malformed input or segmentation failure
   causes omission. Do not substitute phone, email, CCCD, another field or the
   unredacted input.

The successful projection has exactly
`{ schemaVersion: '1', fullNameRedacted: <masked value>, displayOnly: true }`.
fullNameRedacted is REQUIRED whenever identitySummary is present.

If requested but unsafe, omit the entire identitySummary object and include
identitySummary exactly once in unavailableFields. Never return null, an
empty object, an empty name, or an object containing only displayOnly.
If unrequested, omit both the projection and its unavailableFields marker.
Existing rules for other requested/unsupported fields remain unchanged.

## Synthetic vectors

REDACTION-VECTORS.json uses real JSON escapes (not literal backslash text) for
decomposed accents and controls. expectedName=null denotes omission, not a
wire null. These cases include Unicode, short/missing input, unsafe initials,
punctuation, controls, requested omission and unrequested omission.

In particular, 李 小龍 is omitted because 李 is one grapheme. A token starting
with apostrophe, hyphen or a combining mark is rejected rather than skipping
forward to invent an initial. O'Connor and Жан-Поль remain supported.

All examples are synthetic. Vector checks do not execute HRP runtime or prove
the final shared result schema. That conformance gate remains outstanding.
