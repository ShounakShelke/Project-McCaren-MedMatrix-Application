# Implementation Details

This log tracks the simultaneous integration of the OCR Pipeline and Document Verification engines into the central Project McCaren AI framework.

## Track A: OCR Pipeline Architecture
1. **Interactive Entry** (`test.py`): Handles user input, validation checks, and timestamped file naming.
2. **Preprocessing** (`ocr/preprocess.py`): CLAHE + deskew + denoise (significant accuracy boost).
3. **Core Parser** (`ocr/bill_parser.py`): Orchestrates Tesseract and extraction logic.
4. **Field Extraction** (`ocr/extract_fields.py`): RegEx patterns for parsing currency amounts, dates, and hospitals.
5. **Categorization** (`ocr/treatment_classifier.py`): Keyword matching for treatment categories.
6. **Savings Engine** (`ocr/scheme_engine.py`): Logic algorithm to simulate backend eligibility for PM-JAY/ESIC based on hospital and treatment type.

## Track B: Verification Pipeline Architecture
1. **Interactive Entry** (`test.py`): Handles user input and timestamped file naming.
2. **QR Decoder** (`card_validator/qr_scanner.py`): Parses the PMJAY/ABHA identifier from the QR code and checks for validity.
3. **MRN Validator** (`card_validator/mrn_validator.py`): Applies a validation check to OCR'd IDs (Supports hyphenated ABHA 14-digit IDs).
4. **Hologram Detector** (`card_validator/hologram_detector.py`): Uses HSV thresholding to find reflective security marks.
5. **Font Analyzer** (`tamper_detector/font_analyzer.py`): Calculates bounding box height variance mapped by Tesseract to spot Photoshop alterations.
6. **Main Pipeline** (`verify_pipeline.py`): Orchestrates checks and compiles the final validity trust score (0.0 to 1.0).

## System-Wide Updates
- **Mock Generators Created**: Built dynamic python image generators in both `track-a/test_bills/` and `track-b/test_cards/` to synthesize authentic replicas of Government/Private bills and ABHA health cards.
- **Interactive CLI standardization**: Unified `test.py` structures across both modules for consistent user experience.
- **Timestamped JSON Architecture**: Results in both tracks are now saved as `filename-timestamp.json` inside localized `output/` folders to prevent overwrites.
- **Standardized Error Handling**: Detailed failure outputs returning the error type and a recommendation. 
- **ABHA Formatting Optimization**: RegEx pipelines shifted to properly validate the 14 digit dashed formats (`91-XXXX-XXXX-XXXX`) used in modern health identification cards.
