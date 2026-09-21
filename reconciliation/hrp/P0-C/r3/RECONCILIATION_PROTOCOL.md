# RECONCILIATION PROTOCOL (Revision 3)

TÃ i liá»‡u nÃ y Ä‘á»‹nh nghÄ©a giao thá»©c giao tiáº¿p vÃ  Ä‘á»“ng thuáº­n báº±ng chá»©ng (Evidence Reconciliation) giá»¯a Há»‡ thá»‘ng HRP vÃ  Há»‡ thá»‘ng CRM, diá»…n ra thÃ´ng qua Neutral Repository `hrp-integration-contracts`.

## 1. LÆ°u trá»¯ vÃ  Giao tiáº¿p (Message Sequence)
- **Git lÆ°u artifact:** Má»i báº±ng chá»©ng, káº¿t luáº­n vÃ  quyáº¿t Ä‘á»‹nh pháº£i Ä‘Æ°á»£c commit dÆ°á»›i dáº¡ng file Markdown/JSON vÃ o Git cá»§a Neutral Repository (`reconciliation/hrp/...` hoáº·c `reconciliation/crm/...`).
- **Message Sequence:** Viá»‡c giao tiáº¿p giá»¯a Tier 0 HRP vÃ  Tier 0 CRM do Owner thá»±c hiá»‡n thÃ´ng qua tuáº§n tá»± Message-ID (VÃ­ dá»¥: `HRP-CRM-MSG-001` -> `CRM-HRP-MSG-002`). KhÃ´ng dÃ¹ng bot, service hay webhook tá»± Ä‘á»™ng.
- **KhÃ´ng tá»± Ä‘á»™ng:** YÃªu cáº§u sá»± can thiá»‡p thá»§ cÃ´ng cá»§a Tier 0 Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh phÃ¡p lÃ½ vÃ  kiáº¿n trÃºc.

## 2. CÃ¡c Má»©c Äá»™ XÃ¡c Nháº­n
- **Integrity ACK:** Tin nháº¯n ACK (nhÆ° `CRM-HRP-MSG-002`) chá»‰ xÃ¡c nháº­n Ä‘Ã£ nháº­n bundle vÃ  verify manifest thÃ nh cÃ´ng (INTEGRITY_ONLY). NÃ³ **KHÃ”NG** mang Ã½ nghÄ©a cháº¥p thuáº­n nghiá»‡p vá»¥ (Semantic acceptance).
- **Semantic Response:** Sau khi ACK, bÃªn nháº­n pháº£i cÃ³ pháº£n há»“i chi tiáº¿t vá» ná»™i dung (Semantic Response) cho cÃ¡c Ä‘á» xuáº¥t hoáº·c GAP report.
- **Decision Acceptance (ACCEPTED_SHARED):** Tráº¡ng thÃ¡i nÃ y chá»‰ Ä‘áº¡t Ä‘Æ°á»£c khi Cáº¢ HAI PHÃA (Tier 0 HRP vÃ  Tier 0 CRM) Ä‘á»u xÃ¡c nháº­n Ä‘á»“ng thuáº­n (Bilateral Acceptance) trÃªn CÃ™NG Má»˜T REVISION vÃ  CÃ™NG Má»˜T BASELINE. HRP xÃ¡c nháº­n khÃ´ng cÃ³ nghÄ©a CRM Ä‘Ã£ xÃ¡c nháº­n vÃ  ngÆ°á»£c láº¡i.

## 3. Acceptance Anchor, Supersedes Rule & Revision Pinning
- **Revision Pinning (Immutable commit SHA):** Äiá»ƒm neo (Anchor) Ä‘á»ƒ kiá»ƒm Ä‘á»‹nh sá»± cháº¥p thuáº­n pháº£i lÃ  má»™t mÃ£ bÄƒm Git (Full SHA) báº¥t biáº¿n. KhÃ´ng bao giá» dÃ¹ng tÃªn nhÃ¡nh (branch name) lÃ m báº±ng chá»©ng cho tráº¡ng thÃ¡i `ACCEPTED_SHARED`.
- **Supersedes Rule:** Má»—i khi cÃ³ sá»± thay Ä‘á»•i, pháº£i táº¡o thÆ° má»¥c/revision má»›i (VD: `r2` ghi Ä‘Ã¨ logic cá»§a `r1`). Pháº£i ghi chÃº rÃµ revision má»›i `supersedesCommit` cá»§a revision cÅ©.
- **KhÃ´ng sá»­a Ã¢m tháº§m (No stealth edits):** KhÃ´ng sá»­a láº¡i ná»™i dung cá»§a má»™t revision Ä‘Ã£ Ä‘Æ°á»£c review. R1 váº«n immutable vÃ  khÃ´ng bá»‹ ghi Ä‘Ã¨.
- **KhÃ´ng force-push:** Tuyá»‡t Ä‘á»‘i khÃ´ng dÃ¹ng `git push --force` lÃªn nhÃ¡nh lÆ°u báº±ng chá»©ng.

## 4. Encoding Policy & Quy táº¯c Manifest
- **Encoding Policy:** Táº¥t cáº£ cÃ¡c file Markdown, JSON vÃ  manifest pháº£i Ä‘Æ°á»£c lÆ°u vá»›i Ä‘á»‹nh dáº¡ng UTF-8, Line Endings lÃ  LF (khÃ´ng dÃ¹ng CRLF) vÃ  KhÃ´ng cÃ³ BOM (No BOM).
- **Manifest báº£o vá»‡ tÃ­nh toÃ n váº¹n:** Má»—i bundle pháº£i cÃ³ file `manifest.sha256` chá»©a mÃ£ bÄƒm SHA-256 cá»§a toÃ n bá»™ cÃ¡c file trong thÆ° má»¥c.
- **Raw Git Blob Hash Verification:** Manifest hash raw bytes cá»§a file theo Ä‘Ãºng chuáº©n LF Ä‘á»ƒ trÃ¡nh sai lá»‡ch hash giá»¯a cÃ¡c há»‡ Ä‘iá»u hÃ nh (Windows CRLF vs Linux LF).
- **KhÃ´ng hash chÃ­nh nÃ³:** `manifest.sha256` khÃ´ng Ä‘Æ°á»£c chá»©a hash cá»§a chÃ­nh nÃ³.
