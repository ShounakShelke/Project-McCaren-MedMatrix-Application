# Project McCaren - Machine Learning Fraud Detection Setup

## 🎯 Overview

Project McCaren uses a machine learning approach to detect genuine vs fake/tampered insurance cards:

1. **Training Phase**: Learn baseline features from 5 genuine PMJAY cards
2. **Inference Phase**: When users upload cards, compare against baseline → show **Approve ✅** or **Decline ❌**

---

## 📋 Quick Start

### Step 1: Prepare Your Card Images
You should already have 10 card images organized as:
```
data/cards/pmjay/
├── genuine/
│   ├── pmjay-genuine-001.png
│   ├── pmjay-genuine-002.png
│   ├── pmjay-genuine-003.png
│   ├── pmjay-genuine-004.png
│   └── pmjay-genuine-005.png
└── fake/
    ├── pmjay-fake-001.png
    ├── pmjay-fake-002.png
    ├── pmjay-fake-003.png
    ├── pmjay-fake-004.png
    └── pmjay-fake-005.png
```

### Step 2: Train the Model
Run the training script on the 5 genuine cards:

```bash
node train-model.js
```

**Output:**
- Creates `data/trained-model.json`
- Extracts features from all 5 genuine cards
- Builds baseline model with mean/std for each feature
- Displays statistics:
  - Average QR detection rate
  - Color distribution ranges
  - Font consistency average
  - Approval threshold: 85% match

**Example output:**
```
🚀 Starting Model Training...

🔍 Extracting features from 5 genuine cards...

  [1/5] Processing: pmjay-genuine-001.png
       ✓ Color (R/G/B): 185/180/175
       ✓ Texture Variance: 50.2
       ✓ Font Consistency: 91.3%
       ✓ QR Confidence: 92.1%

  [2/5] Processing: pmjay-genuine-002.png
       ...

✅ Model saved to: data/trained-model.json

📈 Model Summary:
   • Training samples: 5
   • QR detection rate: 100%
   • Average confidence: 91.4%
   • Approval threshold: 85% match
```

### Step 3: Use the App with Model Inference
Open `index.html` in your browser:

1. **Upload a card** (genuine or fake)
2. **Tap "Analyze Card"**
3. **View decision:**
   - ✅ **APPROVED** - Matches baseline (≥85% similarity)
   - ⚠️ **SUSPICIOUS** - Possible tampering (50-85% similarity)
   - ❌ **DECLINED** - Fake/Heavily tampered (<50% similarity)

---

## 🔧 How It Works

### Training Phase (`train-model.js`)
Extracts features from each genuine card:
- **Color Distribution**: RGB mean values
- **Texture Variance**: Pixel variance analysis
- **Font Consistency**: Text pattern normalization
- **QR Confidence**: QR code detection quality
- **Hologram Features**: Brightness/color variance
- **Edge Density**: Document sharpness
- **Compression Artifacts**: JPEG quality indicators

**Output**: `trained-model.json` containing:
```json
{
  "baseline": {
    "color_distribution": { 
      "red_mean": { "mean": 185, "std": 5, "min": 180, "max": 192 }
      // ... (green, blue)
    },
    "texture_variance": { "mean": 50.2, "std": 8.5 },
    "font_consistency": { "mean": 0.91, "std": 0.02 },
    // ... (other features)
  },
  "thresholds": {
    "min_match_score": 0.85
  },
  "training_data": {
    "sample_count": 5,
    "qr_detection_rate": 1.0,
    "avg_qr_confidence": 0.914
  }
}
```

### Inference Phase (In `index.html`)
When a card is uploaded:

1. **Extract same features** from uploaded card
2. **Compare each feature** against baseline:
   - For numeric features: How many standard deviations away?
   - For binary features: Match or mismatch?
3. **Calculate match score** (0-1):
   - 1.0 = Perfect match with baseline
   - 0.0 = Complete deviation from baseline
4. **Make decision**:
   - **Score ≥ 0.85** → ✅ APPROVED
   - **Score 0.50-0.85** → ⚠️ SUSPICIOUS
   - **Score < 0.50** → ❌ DECLINED

---

## 🧪 Testing the System

### Test Genuine Cards
Upload `pmjay-genuine-001.png` → Should show **✅ APPROVED** (≥85%)

### Test Fake Cards
- `pmjay-fake-001.png` (No QR) → **❌ DECLINED** (<50%)
- `pmjay-fake-002.png` (Font forgery) → **❌ DECLINED**
- `pmjay-fake-003.png` (No hologram) → **❌ DECLINED**
- `pmjay-fake-004.png` (ID tampering) → **❌ DECLINED**
- `pmjay-fake-005.png` (Color shift) → **❌ DECLINED**

---

## 📊 Understanding the Results

### Successful Training
```
✅ All genuine cards: 85-95% approval
✅ All fake cards: 10-45% approval
✅ Clear separation between genuine/fake
```

### If Thresholds Need Adjustment

**Problem**: Genuine cards showing <85%
- **Solution**: Lower threshold in `ModelInference.makeDecision()` or
- **Solution**: Retrain model with different feature extraction

**Problem**: Fake cards showing >50%
- **Solution**: Increase validator strictness for anomaly detection or
- **Solution**: Adjust `tamper-detector.js` sensitivity

Edit in [js/main.js](js/main.js):
```javascript
// Line ~330: Adjust threshold if needed
const APPROVAL_THRESHOLD = 0.85; // Increase to be stricter
```

---

## 🔐 Security Notes

- **Baseline Model**: Stored in `data/trained-model.json` (load before use)
- **Feature Extraction**: Done locally in browser (no server needed)  
- **Privacy**: Card images never leave your device
- **Offline**: App works fully offline once model is trained

---

## 🚀 Next Steps (Person A Integration)

When Person A completes bill parsing:

1. Combine results:
   ```
   Card Validation (Person B): ✅ APPROVED
   Bill Verification (Person A): ✅ VALID
   → Claim Status: ELIGIBLE ✅
   ```

2. Integration point: `proceedToClaim()` in [js/main.js](js/main.js)

---

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `train-model.js` | Extract features from genuine cards, build baseline |
| `data/trained-model.json` | Trained model (created after `train-model.js`) |
| `js/utils/model-inference.js` | Load model & compare features |
| `js/main.js` | Extract features from uploads, show Approve/Decline |
| `index.html` | Main app (calls training + inference) |

---

## ❓ FAQ

**Q**: Do I need to retrain every time?
**A**: No. Train once with your genuine cards. Model is reusable.

**Q**: Can the model be shared with Person A?
**A**: Yes! Send `data/trained-model.json` for their claims processing.

**Q**: What if I want to add more genuine cards later?
**A**: Retrain with all 5+ genuine cards: `node train-model.js`

**Q**: Can this detect all forgeries?
**A**: Detects most common tampering. Edge cases may need manual review.

---

## 🎓 How Person B Contributed

✅ Built card validators (QR, hologram, tamper detection)
✅ Created feature extraction system
✅ Developed baseline model training
✅ Implemented model inference for approve/decline decisions
✅ Integrated fraud detection into main app

**Result**: Fully automated, ML-powered fraud detection for insurance claims!

---

**Status**: ✅ Ready for hackathon demo

Run `node train-model.js` first, then open `index.html` in browser!
