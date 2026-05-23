# System Explanation & Workflow

This document explains the overarching purpose and logic behind the Project McCaren AI system, combining the workflows for Hospital Bill OCR (Track A) and Document Verification (Track B).

## Track A: Hospital Bill OCR Extraction Workflow

1.  **START**: User runs `test.py` and provides an image path and expected amount.
2.  **PRE-PROCESS**: `ocr/preprocess.py` cleans the image (removes noise, aligns text).
3.  **OCR**: `ocr/bill_parser.py` uses Tesseract to read the raw text.
4.  **EXTRACT**: `ocr/extract_fields.py` uses RegEx to find amounts, dates, and hospital names.
5.  **CLASSIFY**: `ocr/treatment_classifier.py` looks at keywords to decide the treatment category.
6.  **SCHEMES**: `ocr/scheme_engine.py` applies logic to recommend PM-JAY or ESIC coverage.
7.  **SAVE**: `test.py` writes the final dataset to `output/` with a timestamp.

**File-by-File Breakdown for Track A**
- `ocr/bill_parser.py`: The Orchestrator. Connects image processing to extraction and validation.
- `ocr/preprocess.py`: Converts images to high-contrast grayscale and rotates them.
- `ocr/extract_fields.py`: Finds currency symbols, numbers, and date formats.
- `ocr/treatment_classifier.py`: Matches medical terms to specific insurance categories.
- `ocr/scheme_engine.py`: Calculates eligible savings and outputs frontend-ready data.
- `test.py`: Interactive CLI interface.

## Track B: Document Verification Workflow

1.  **START**: User runs `test.py` on a PMJAY or ABHA card image.
2.  **QR DECODE**: `card_validator/qr_scanner.py` parses the identifier from the QR code.
3.  **MRN CHECK**: `card_validator/mrn_validator.py` applies a checksum test to OCR'd IDs.
4.  **HOLOGRAM**: `card_validator/hologram_detector.py` uses HSV thresholding to find reflective security marks.
5.  **TAMPERING**: `tamper_detector/font_analyzer.py` calculates variance in bounding box sizes to spot Photoshop alterations.
6.  **SCORE**: `verify_pipeline.py` applies a weighted trust calculation.
7.  **SAVE**: `test.py` writes the final data to `output/` with a timestamp.

**File-by-File Breakdown for Track B**
- `verify_pipeline.py`: The Orchestrator. Connects all validators and computes the trust score.
- `card_validator/qr_scanner.py`: Locates and decodes the QR code for a valid Beneficiary ID.
- `card_validator/mrn_validator.py`: OCRs the card and validates the 12-to-17-digit MRN/ABHA string.
- `card_validator/hologram_detector.py`: Detects authenticity artifacts like bright reflective spots.
- `tamper_detector/font_analyzer.py`: Identifies mismatched font sizes indicating a photoshopped image.
- `test.py`: Interactive CLI interface.

## Key Technologies (System-Wide)
- **Tesseract OCR (v5)**: The industry standard for reading text from photos. Used in both tracks.
- **OpenCV**: Powering the advanced image enhancement, deskewing, and hologram threshold pipelines.
- **pyzbar**: QR code decoding engine used in Document Verification.
- **Python Pillow (PIL)**: Used extensively for synthetic mock image generation for both bills and ABHA cards.
- **RegEx (Regular Expressions)**: For surgical precision in extracting data and identifying formatted IDs.
