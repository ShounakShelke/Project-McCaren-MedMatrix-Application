#  RUN GUIDE

## 1. Prerequisites
- **Install Tesseract OCR**: [Download Here](https://github.com/UB-Mannheim/tesseract/wiki)
- **Configure Path**: Ensure `ocr/bill_parser.py` points to your `tesseract.exe` location.

## 2. Environment Setup
```bash
cd ai/track-a
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Running Extraction
Run the interactive tester:
```bash
python test.py
```
When prompted, enter the path to a bill image:
- `test_bills/bill1.jpg`
- `test_bills/bill2.jpg`

## 4. Viewing Results
Check the `output/` folder for timestamped JSON files. Each file contains:
- `hospital`: Detected facility type
- `treatment`: Medical category
- `amount`: Extracted ₹ value
- `date`: Extracted service date
