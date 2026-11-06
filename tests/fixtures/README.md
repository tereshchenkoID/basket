# Receipt regression fixtures

- `lidl-overlap.json`: manually checked transcription of the supplied overlapping Lidl photos; 11 paid lines, three separate cheeses, RON 141.18.
- `lidl-ocr.json`: captured local PaddleOCR output from those photos, with transaction identifiers and merchant address removed. Product text is not hand-corrected.
- `dm-ocr.json`: captured local PaddleOCR output for the supplied dm pair; five products, RON 91.75, fiscal timestamp after the card-payment timestamp. Bank identifiers and address removed.

- `lidl-jysk-ocr.json`: uncorrected local OCR for the 24-line Lidl pair (RON 288.87) and one-line JYSK receipt (RON 32.50). Identifiers/address removed; detached prices, genuine duplicate products and parenthesized weights remain intact.

The JSON fixtures test parser/merge regressions. They do not run model inference in CI. The actual browser worker was additionally tested on the original four JPEGs, including the normal orientation/compression path; original photos stay outside the repository. Low-level unit tests cover worker cancellation, timeout and repeated jobs.
