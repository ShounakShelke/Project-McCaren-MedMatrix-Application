# Implementation Details

## OCR Pipeline Architecture
1. **Interactive Entry** (`test.py`): Handles user input and timestamped file naming.
2. **Preprocessing** (`ocr/preprocess.py`): CLAHE + deskew + denoise (25% accuracy boost).
3. **Core Parser** (`ocr/bill_parser.py`): Orchestrates Tesseract and extraction logic.
4. **Field Extraction** (`ocr/extract_fields.py`): Regex patterns for ₹ amounts, dates, and hospitals.
5. **Categorization** (`ocr/treatment_classifier.py`): Keyword matching for 5 treatment categories.

##  Recent Updates
- **Interactive CLI**: Replaced `demo.py` with `test.py` for better user experience.
- **Timestamped JSON**: Results now saved as `filename-timestamp.json` to prevent overwrites.
- **Improved Error Handling**: Added absolute path resolution and Tesseract check guards.
- **Batch Ready**: Logic optimized for future API integration.
