#  System Explanation & Workflow

This document explains the purpose and logic behind every file in the Project McCaren OCR system.

##  The Extraction Workflow

1.  **START**: User runs `test.py` and provides an image path.
2.  **PRE-PROCESS**: `ocr/preprocess.py` cleans the image (removes noise, aligns text).
3.  **OCR**: `ocr/bill_parser.py` uses Tesseract to read the raw text.
4.  **EXTRACT**: `ocr/extract_fields.py` uses RegEx to find amounts, dates, and hospital names.
5.  **CLASSIFY**: `ocr/treatment_classifier.py` looks at keywords to decide the treatment category.
6.  **SAVE**: `test.py` writes the final data to `output/` with a timestamp.

---

##  File-by-File Breakdown

###  Core AI Logic (`ocr/`)
- **`bill_parser.py`**: The "Brain". It connects the image processing to the text extraction.
- **`preprocess.py`**: The "Eyes". It converts images to high-contrast grayscale and rotates them so Tesseract can read clearly.
- **`extract_fields.py`**: The "Logic". It finds currency symbols (₹), numbers, and date formats using Patterns.
- **`treatment_classifier.py`**: The "Expert". It matches medical terms (like 'fracture' or 'OPD') to specific insurance categories.
- **`medical_dict.json`**: The "Vocabulary". Stores keywords for classification.
- **`hospital_types.json`**: The "Patterns". Stores common suffixes (Govt, Pvt, Clinic) to detect hospital types.

###  Testing & Entry
- **`test.py`**: The main interface. It handles user input, logs the process, and manages output file naming.
- **`test_bills/`**: Contains mock images for verification.
- **`output/`**: Stores every extraction result as a permanent JSON record.

###  Documentation & Setup
- **`README.md`**: High-level project summary.
- **`RUN_GUIDE.md`**: Technical steps to get started.
- **`CHANGELOG.md`**: History of technical improvements.
- **`requirements.txt`**: List of Python libraries needed.

---

##  Track B: Document Verification Workflow

1.  **START**: User runs `test.py` or `.demo.py` on a PMJAY card/form image.
2.  **QR DECODE**: `card_validator/qr_scanner.py` parses the PMJAY identifier from the QR code.
3.  **MRN CHECK**: `card_validator/mrn_validator.py` applies a checksum test to OCR'd IDs.
4.  **HOLOGRAM**: `card_validator/hologram_detector.py` uses HSV thresholding to find reflective security marks.
5.  **TAMPERING**: `tamper_detector/font_analyzer.py` calculates font size variance to spot Photoshop alterations.
6.  **SCORE**: `verify_pipeline.py` applies a weighted trust calculation and returns JSON.

---

##  Key Technologies (System-Wide)
- **Tesseract OCR (v5)**: The industry standard for reading text from photos.
- **pyzbar**: QR code decoding engine.
- **OpenCV**: Powering the advanced image enhancement and hologram pipeline.
- **RegEx (Regular Expressions)**: For surgical precision in extracting data and IDs.
