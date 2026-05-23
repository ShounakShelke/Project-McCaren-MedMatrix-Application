# Project McCaren AI Run Guide

## 1. Prerequisites (For Both Tracks)
- **Install Tesseract OCR**: Download from UB-Mannheim and ensure it is installed.
- **Configure Path**: The code already points to the default Windows installation path (`C:\Program Files\Tesseract-OCR\tesseract.exe`). If yours differs, update it in `track-a/ocr/bill_parser.py`, `track-b/card_validator/mrn_validator.py`, and `track-b/tamper_detector/font_analyzer.py`.

## 2. Environment Setup
You should set up the virtual environment within the specific track you want to run.

### For Track A (Hospital Bill OCR)
```bash
cd ai/track-a
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### For Track B (Document Verification)
```bash
cd ai/track-b
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Running the Systems

Each track has its own interactive tester script named `test.py`.

### Running Track A
Activate the Track A environment, then run:
```bash
python test.py
```
When prompted, enter the path to a bill image (e.g., `test_bills/bill1.jpg`) and an expected validation amount.

### Running Track B
Activate the Track B environment, then run:
```bash
python test.py
```
When prompted, enter the path to a card image (e.g., `test_cards/real1.jpg` or `test_cards/fake1.jpg`).

## 4. Viewing Results
Processed data will be saved in the `output/` folder located inside the specific track directory.
- **Track A Output**: JSON files containing `hospital`, `treatment`, `amount`, `date`, `validation` flags, and `savings_engine` calculations.
- **Track B Output**: JSON files containing a calculated `validity` score, boolean pass/fail flags for QR and MRN, and a list of detected `issues` (tampering flags).
