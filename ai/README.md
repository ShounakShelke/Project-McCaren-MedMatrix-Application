# Project McCaren AI Processing Pipeline

This repository contains the completely integrated AI modules for the Project McCaren hackathon project, divided into two specialized tracks for Hospital Bill OCR and Document Verification.

## Overview

### Track A: Hospital Bill OCR Pipeline
Hospital bill photo -> Structured JSON + Savings Schemes for claims engine. 
This system uses **Tesseract OCR v5.0+** and **OpenCV** to extract key medical data (hospital, treatment, amount, date) with high accuracy and runs eligibility logic for PM-JAY and ESIC.

### Track B: Document Verification Workflow
Card photo -> Trust score. 
This system uses OpenCV, pyzbar, and Tesseract to extract card features, decode QR codes, detect holograms, and analyze fonts to predict the authenticity of a PMJAY / ABHA card and detect tampering.

## Directory Structure
- `track-a/`: Contains the OCR pipeline and scheme calculator logic.
- `track-b/`: Contains the document verification and tamper detection logic.

## Quick Start
You can run the interactive tests for each module separately.

1. **Setup**
   Ensure you have Tesseract OCR installed on your system.
   Navigate into either `track-a` or `track-b` and set up the virtual environment:
   ```bash
   cd ai/track-a  # or cd ai/track-b
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Run Test**
   Execute the interactive test script in the respective track directory:
   ```bash
   python test.py
   ```
   Follow the prompt to enter your image path.

## Output
Results are saved as JSON files in the `output/` directory of the respective track.

## Requirements
- Python 3.8+
- Tesseract OCR Engine (System Install)
- OpenCV, Pytesseract, Pillow, pyzbar

See [explainAll.md](explainAll.md) for a deep dive into the architecture of both tracks.
