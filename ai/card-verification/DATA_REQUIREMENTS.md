# Project McCaren - Data Collection Requirements

## Person B (Card & Fraud Detection) - Data Needed

### 1. PMJAY Card Images (Priority: HIGH)

**Create folder:** `data/cards/pmjay/`

#### Genuine Cards (10-15 images)
Collect images showing:
- [ ] Full card front with QR code visible
- [ ] Card with hologram clearly visible (angled shot)
- [ ] Card with beneficiary ID readable
- [ ] Different state variations (MH, UP, KA, etc.)
- [ ] Both old format and new ABHA format cards

**Sources:**
- Google Images: "PMJAY card", "Ayushman Bharat card"
- Twitter: #AyushmanBharat, #PMJAY
- Government websites: pmjay.gov.in

#### Fake/Tampered Cards (15-20 images - CREATE THESE)
Create in Photoshop/GIMP:
- [ ] Card with QR code removed/corrupted
- [ ] Card with wrong font (Arial instead of official)
- [ ] Card with edited beneficiary ID
- [ ] Card with missing hologram
- [ ] Card with wrong state code format
- [ ] Card with photoshopped name
- [ ] Card with misaligned text
- [ ] Card with color-shifted areas
- [ ] Card with visible copy-paste edges

### 2. ESIC Card Images (Priority: MEDIUM)

**Create folder:** `data/cards/esic/`

#### Genuine Cards (5-10 images)
- [ ] ESIC Pehchan card front
- [ ] Card with 17-digit insurance number visible
- [ ] Different regional office cards

#### Fake Cards (5-10 images)
- [ ] Tampered insurance numbers
- [ ] Wrong format cards

---

## 3. Template Images (For Reference Matching)

**Create folder:** `data/templates/`

Save clean, high-quality reference images:
- [ ] `pmjay-template-v1.png` - Current PMJAY card design
- [ ] `pmjay-template-v2.png` - ABHA format card
- [ ] `esic-template.png` - ESIC Pehchan card template
- [ ] `ayushman-logo.png` - Official Ayushman Bharat logo
- [ ] `nha-hologram.png` - Hologram reference (if available)

---

## 4. Labels (JSON Format)

**Create folder:** `data/labels/`

For each card image, create a JSON label file:

```json
// Example: data/labels/pmjay-genuine-001.json
{
  "filename": "pmjay-genuine-001.jpg",
  "card_type": "pmjay",
  "is_genuine": true,
  "validity_score": 0.95,
  "features": {
    "qr_code_present": true,
    "qr_code_valid": true,
    "hologram_present": true,
    "id_format_valid": true,
    "id_value": "MH123456789001"
  },
  "tampering_flags": []
}

// Example: data/labels/pmjay-fake-023.json
{
  "filename": "pmjay-fake-023.jpg",
  "card_type": "pmjay",
  "is_genuine": false,
  "validity_score": 0.23,
  "features": {
    "qr_code_present": false,
    "qr_code_valid": false,
    "hologram_present": true,
    "id_format_valid": false
  },
  "tampering_flags": ["font_mismatch", "missing_qr", "wrong_id_format"]
}
```

---

## 5. Quick Collection Checklist

### Immediate (30 mins):
- [ ] Download 10 PMJAY card images from Google
- [ ] Download 3 ESIC card images
- [ ] Save official logo from pmjay.gov.in

### Creation (45 mins):
- [ ] Open Photoshop/GIMP/Canva
- [ ] Create 15 fake PMJAY cards with various issues:
  - Remove QR codes
  - Change fonts
  - Edit ID numbers
  - Add visible tampering

### Labeling (20 mins):
- [ ] Create JSON labels for all images
- [ ] Verify genuine/fake classification

---

## Expected Folder Structure After Collection

```
data/
├── cards/
│   ├── pmjay/
│   │   ├── genuine/
│   │   │   ├── pmjay-genuine-001.jpg
│   │   │   ├── pmjay-genuine-002.jpg
│   │   │   └── ...
│   │   └── fake/
│   │       ├── pmjay-fake-001.jpg
│   │       ├── pmjay-fake-002.jpg
│   │       └── ...
│   └── esic/
│       ├── genuine/
│       └── fake/
├── templates/
│   ├── pmjay-template-v1.png
│   ├── pmjay-template-v2.png
│   └── esic-template.png
├── labels/
│   ├── pmjay-genuine-001.json
│   ├── pmjay-fake-001.json
│   └── ...
└── validation-rules.json
```

---

## Tampering Patterns to Create

When making fake cards, use these techniques:

1. **Font Swap** - Replace text with Arial/Times New Roman
2. **QR Removal** - Delete or blur QR code
3. **ID Edit** - Change individual digits
4. **Color Shift** - Adjust hue/saturation of edited areas
5. **Clone Stamp** - Copy-paste sections (leaves artifacts)
6. **Missing Elements** - Remove hologram/logo
7. **Wrong Format** - Invalid state codes, wrong digit count
8. **Obvious Photoshop** - Misaligned text, different backgrounds

---

## Demo Images (Must Have)

For hackathon demo, ensure you have:

1. **Perfect Genuine Card** → Shows 95%+ validity
2. **Obvious Fake Card** → Shows 20-30% validity with multiple flags
3. **Borderline Card** → Shows 50-60% validity (partial issues)

This allows demonstrating the full range of detection capabilities.
