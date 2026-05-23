# Project McCaren OCR Pipeline (Person A Track)

##  Overview
Hospital bill photo → Structured JSON for claims engine. 
This system uses **Tesseract OCR v5.0+** and **OpenCV** to extract key medical data with high accuracy.

##  Quick Start
1. **Setup**
   ```bash
   cd ai/track-a
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Run Test**
   ```bash
   python test.py
   ```
   *Follow the prompt to enter your image path (e.g., `test_bills/bill1.jpg`).*

##  Output
Results are saved as `billname-timestamp.json` in the `output/` directory.

##  Requirements
- Python 3.8+
- Tesseract OCR Engine (System Install)
- OpenCV, Pytesseract, Pillow

See [explainAll.md](explainAll.md) for a deep dive into the architecture.
