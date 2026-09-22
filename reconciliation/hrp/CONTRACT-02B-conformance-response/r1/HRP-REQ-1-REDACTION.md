# HRP-REQ-1 — fullNameRedacted proposal and synthetic vectors

## Proposed algorithm

\`identitySummary.fullNameRedacted\` is optional and is the only personal
presentation field in this slice. \`displayOnly\` is always \`true\`. It is not
a canonical name, a matching key, or an authorization input.

1. Read the canonical HRP display-name value only after the effective-user
   object permission check has passed.
2. Normalize to Unicode NFC, trim Unicode whitespace, and collapse internal
   whitespace to a single ASCII space.
3. Reject and omit the field when the resulting value is empty, contains a
   control character, a bidi-format/control character, an emoji/pictograph,
   a digit, or a character outside letters, combining marks, apostrophe,
   hyphen, and spaces.
4. Segment each whitespace-delimited token into Unicode grapheme clusters.
   If any token has fewer than two graphemes, omit the entire field. Do not
   infer a substitute from phone, email, document data, or another profile
   field.
5. For every remaining token, emit its first grapheme followed by exactly two
   bullet characters (\`••\`). Join masked tokens with one space. The output
   therefore reveals initials only, not original token length or suffix.
6. If the required Unicode grapheme segmentation facility is unavailable or
   produces an error, omit the field fail-closed.

Implementation must use a Unicode-aware grapheme segmenter, not UTF-16 code
units or a byte count. It must return omission rather than throw personal data
into an error message or log.

## Synthetic test vectors

These are invented examples, not production data.

| Input | Expected \`fullNameRedacted\` | Rationale |
| --- | --- | --- |
| \`Nguyễn Văn An\` | \`N•• V•• A••\` | NFC Vietnamese letters; three safe tokens. |
| \`Élodie Durand\` | \`É•• D••\` | Decomposed accent normalizes to NFC before segmentation. |
| \`李 小龍\` | \`李•• 小••\` | Unicode letters; each token has at least two graphemes. |
| \`O'Connor\` | \`O••\` | Apostrophe is permitted but not reproduced. |
| \`Жан-Поль\` | \`Ж••\` | Hyphen is permitted but not reproduced. |
| \`A\` | omitted | One-grapheme token cannot be safely redacted. |
| whitespace only | omitted | No presentation value. |
| \`A1pha Name\` | omitted | Digits are outside the safe input class. |
| \`User\\u202EName\` | omitted | Bidi control is rejected. |
| \`👩‍💻 Test\` | omitted | Pictograph input is rejected. |

No phone number, national ID/CCCD, raw \`LaborProfileDetailDto\`, source name,
or unsupported requested field is emitted when omission occurs.

