import os
from PIL import Image, ImageDraw, ImageFont

# Set up destination path
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "demo_files"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

def draw_header(draw, title, y, font, color=(255, 128, 0), width=600):
    text_w = 200 # approximate
    draw.text(((width - text_w) // 2, y), title, fill=color, font=font)

def create_bill_1_legitimate():
    # Size: 600x800, white background
    img = Image.new("RGB", (600, 800), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw premium borders
    draw.rectangle([10, 10, 590, 790], outline=(255, 128, 0), width=3)
    draw.rectangle([15, 15, 585, 785], outline=(200, 200, 200), width=1)
    
    # Hospital Name Header
    draw.rectangle([20, 20, 580, 90], fill=(26, 26, 26))
    draw.text((40, 30), "FORTIS HOSPITAL, MULUND", fill=(255, 128, 0))
    draw.text((40, 60), "Mulund Goregaon Link Road, Mumbai - 400078", fill=(200, 200, 200))
    
    # Bill Details
    draw.text((40, 120), "PATIENT TREATMENT INVOICE & DISCHARGE SUMMARY", fill=(0, 0, 0))
    draw.line([40, 145, 560, 145], fill=(200, 200, 200), width=1)
    
    # Patient info
    draw.text((40, 160), "Patient Name: Raju Kumar", fill=(0, 0, 0))
    draw.text((40, 190), "Age/Sex: 45 / Male", fill=(0, 0, 0))
    draw.text((320, 160), "Admission Date: 12/05/2026", fill=(0, 0, 0))
    draw.text((320, 190), "Discharge Date: 18/05/2026", fill=(0, 0, 0))
    
    # Diagnosis
    draw.rectangle([40, 230, 560, 310], fill=(245, 245, 245), outline=(220, 220, 220))
    draw.text((50, 240), "Diagnosis: Left Tibia Compound Fracture (CRIF Surgery)", fill=(0, 0, 0))
    draw.text((50, 270), "Department: Orthopedics & Trauma Surgery", fill=(100, 100, 100))
    
    # Itemized Charges Table
    draw.text((40, 340), "Itemized Hospital Charges", fill=(255, 128, 0))
    draw.line([40, 365, 560, 365], fill=(255, 128, 0), width=2)
    
    charges = [
        ("1. Operation Theatre Charges", "INR 35,000.00"),
        ("2. Surgical Implants & Casts", "INR 18,500.00"),
        ("3. Room Rent (Semi-Private Ward)", "INR 7,500.00"),
        ("4. Post-Op Pharmacy & Consumables", "INR 4,000.00")
    ]
    
    y = 380
    for item, price in charges:
        draw.text((40, y), item, fill=(50, 50, 50))
        draw.text((430, y), price, fill=(50, 50, 50))
        draw.line([40, y+25, 560, y+25], fill=(240, 240, 240), width=1)
        y += 35
        
    # Total
    draw.rectangle([40, y+10, 560, y+60], fill=(255, 245, 230), outline=(255, 128, 0))
    draw.text((50, y+22), "GRAND TOTAL AMOUNT", fill=(0, 0, 0))
    draw.text((410, y+22), "INR 65,000.00", fill=(255, 128, 0))
    
    # Signatures
    draw.text((40, 700), "Authorized Medical Signatory:", fill=(100, 100, 100))
    draw.text((40, 730), "Dr. Ramesh Kumar (Orthopedic Chief)", fill=(0, 0, 0))
    draw.line([40, 725, 280, 725], fill=(150, 150, 150), width=1)
    
    path = os.path.join(OUTPUT_DIR, "bill_1_legitimate.png")
    img.save(path)
    print(f"Generated Legitimate Bill at {path}")

def create_bill_2_emergency():
    # Size: 600x800, white background
    img = Image.new("RGB", (600, 800), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw premium red/black borders
    draw.rectangle([10, 10, 590, 790], outline=(220, 20, 60), width=3)
    draw.rectangle([15, 15, 585, 785], outline=(200, 200, 200), width=1)
    
    # Hospital Name Header (AIIMS style red theme)
    draw.rectangle([20, 20, 580, 90], fill=(220, 20, 60))
    draw.text((40, 30), "ALL INDIA INSTITUTE OF MEDICAL SCIENCES (AIIMS)", fill=(255, 255, 255))
    draw.text((40, 60), "Ansari Nagar, New Delhi - 110029", fill=(240, 240, 240))
    
    # Bill Details
    draw.text((40, 120), "DEPARTMENT OF EMERGENCY MEDICINE & TRAUMA CARE", fill=(0, 0, 0))
    draw.line([40, 145, 560, 145], fill=(200, 200, 200), width=1)
    
    # Patient info
    draw.text((40, 160), "Patient Name: Raju Kumar", fill=(0, 0, 0))
    draw.text((40, 190), "Age/Sex: 45 / Male", fill=(0, 0, 0))
    draw.text((320, 160), "Admission Date: 15/05/2026", fill=(0, 0, 0))
    draw.text((320, 190), "Discharge Date: 22/05/2026", fill=(0, 0, 0))
    
    # Diagnosis
    draw.rectangle([40, 230, 560, 310], fill=(245, 245, 245), outline=(220, 220, 220))
    draw.text((50, 240), "Clinical Diagnosis: Multiple High-Velocity Trauma Injuries", fill=(0, 0, 0))
    draw.text((50, 270), "Specialty: Emergency Critical ICU Monitoring & Wound Management", fill=(100, 100, 100))
    
    # Itemized Charges Table
    draw.text((40, 340), "Emergency Billing Summary", fill=(220, 20, 60))
    draw.line([40, 365, 560, 365], fill=(220, 20, 60), width=2)
    
    charges = [
        ("1. ICU Intensive Monitoring (4 Days)", "INR 48,000.00"),
        ("2. Emergency Trauma Surgery Fees", "INR 42,000.00"),
        ("3. Life Support Systems & Ventilator", "INR 18,000.00"),
        ("4. Emergency Lab Tests & Scans", "INR 12,000.00")
    ]
    
    y = 380
    for item, price in charges:
        draw.text((40, y), item, fill=(50, 50, 50))
        draw.text((430, y), price, fill=(50, 50, 50))
        draw.line([40, y+25, 560, y+25], fill=(240, 240, 240), width=1)
        y += 35
        
    # Total
    draw.rectangle([40, y+10, 560, y+60], fill=(255, 240, 240), outline=(220, 20, 60))
    draw.text((50, y+22), "TOTAL DUES PAYABLE", fill=(0, 0, 0))
    draw.text((410, y+22), "INR 120,000.00", fill=(220, 20, 60))
    
    # Signatures
    draw.text((40, 700), "Department Chief Approval:", fill=(100, 100, 100))
    draw.text((40, 730), "Dr. S. K. Gupta (Emergency Trauma Unit)", fill=(0, 0, 0))
    draw.line([40, 725, 280, 725], fill=(150, 150, 150), width=1)
    
    path = os.path.join(OUTPUT_DIR, "bill_2_emergency.png")
    img.save(path)
    print(f"Generated Emergency Bill at {path}")

def draw_abha_qr(draw, x, y, size=80):
    # Draw simple grid mock QR code
    draw.rectangle([x, y, x+size, y+size], fill=(0, 0, 0))
    # Add white inner blocks
    step = size // 5
    for i in range(1, 4):
        for j in range(1, 4):
            if (i+j) % 2 == 0:
                draw.rectangle([x+i*step, y+j*step, x+(i+1)*step, y+(j+1)*step], fill=(255, 255, 255))
    # Anchor boxes
    draw.rectangle([x, y, x+2*step, y+2*step], fill=(0, 0, 0), outline=(255, 255, 255), width=2)
    draw.rectangle([x+size-2*step, y, x+size, y+2*step], fill=(0, 0, 0), outline=(255, 255, 255), width=2)
    draw.rectangle([x, y+size-2*step, x+2*step, y+size], fill=(0, 0, 0), outline=(255, 255, 255), width=2)

def create_card_1_pmjay_genuine():
    # Card aspect ratio 1.58: size 632x400
    img = Image.new("RGB", (632, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Saffron border
    draw.rectangle([5, 5, 627, 395], outline=(255, 128, 0), width=3)
    
    # Premium background gradient effect (saffron-gold top bar)
    draw.rectangle([10, 10, 622, 70], fill=(255, 128, 0))
    draw.rectangle([10, 70, 622, 75], fill=(255, 215, 0))
    
    # Text headers
    draw.text((25, 20), "AYUSHMAN BHARAT — PRADHAN MANTRI JAN AROGYA YOJANA", fill=(255, 255, 255))
    draw.text((25, 45), "NATIONAL HEALTH AUTHORITY | GOVT OF INDIA", fill=(245, 245, 245))
    
    # Hologram emblem (Gold circle with sparkles)
    draw.ellipse([45, 100, 105, 160], fill=(255, 215, 0), outline=(255, 255, 255), width=2)
    draw.text((58, 120), "NHA", fill=(255, 128, 0))
    
    # Patient Data
    draw.text((130, 100), "Beneficiary Name: Raju Kumar", fill=(0, 0, 0))
    draw.text((130, 130), "Gender / Age: Male / 45 Years", fill=(0, 0, 0))
    draw.text((130, 160), "Beneficiary ID: MH-4009-8871-3329", fill=(255, 128, 0))
    draw.text((130, 190), "State Registration: MH (Maharashtra)", fill=(50, 50, 50))
    
    # Draw valid security QR code
    draw_abha_qr(draw, 490, 100, 90)
    
    # Footer info
    draw.rectangle([10, 330, 622, 390], fill=(26, 26, 26))
    draw.text((25, 340), "Eligibility: Family Cover of up to INR 5,00,000 per Year", fill=(255, 255, 255))
    draw.text((25, 365), "Paperless, Cashless, and Portable treatment across India", fill=(200, 200, 200))
    
    path = os.path.join(OUTPUT_DIR, "card_1_pmjay_genuine.png")
    img.save(path)
    print(f"Generated Genuine PMJAY Card at {path}")

def create_card_2_pmjay_fraudulent():
    # Card size 632x400, flat white background
    img = Image.new("RGB", (632, 400), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    # Low quality thin gray border
    draw.rectangle([5, 5, 627, 395], outline=(150, 150, 150), width=1)
    
    # Saffron top bar
    draw.rectangle([10, 10, 622, 70], fill=(220, 100, 0))
    
    # Badly spaced text
    draw.text((25, 20), "AYUSHMAN BHARAT — PRADHAN MANTRI JAN AROGYA YOJANA", fill=(255, 255, 255))
    draw.text((25, 45), "NATIONAL HEALTH AUTHORITY | GOVT OF INDIA", fill=(200, 200, 200))
    
    # Missing Hologram (just a flat gray empty circle, indicates counterfeit)
    draw.ellipse([45, 100, 105, 160], fill=(180, 180, 180), outline=(100, 100, 100), width=1)
    draw.text((58, 120), "MOCK", fill=(80, 80, 80))
    
    # Patient Data - Invalid state code and fake layout
    draw.text((130, 100), "Beneficiary Name: Raju Kumar", fill=(0, 0, 0))
    draw.text((130, 130), "Gender / Age: Male / 45 Years", fill=(0, 0, 0))
    # Incorrect ID format with "INVALID" prefix
    draw.text((130, 160), "Beneficiary ID: MH-INVALID-9981-FORGED", fill=(200, 0, 0))
    draw.text((130, 190), "State Registration: UNKNOWN", fill=(100, 100, 100))
    
    # Distorted/Corrupted QR Code
    draw.rectangle([490, 100, 580, 190], fill=(50, 50, 50))
    draw.text((510, 135), "TAMPERED", fill=(255, 255, 255))
    
    # Footer
    draw.rectangle([10, 330, 622, 390], fill=(50, 50, 50))
    draw.text((25, 340), "Eligibility check failed - Digital Duplication Alert", fill=(255, 100, 100))
    
    path = os.path.join(OUTPUT_DIR, "card_2_pmjay_fraudulent.png")
    img.save(path)
    print(f"Generated Fraudulent PMJAY Card at {path}")

def create_card_3_esic_genuine():
    # Card size 632x400
    img = Image.new("RGB", (632, 400), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # ESIC Deep Blue Border
    draw.rectangle([5, 5, 627, 395], outline=(0, 51, 153), width=3)
    
    # ESIC deep blue header block
    draw.rectangle([10, 10, 622, 70], fill=(0, 51, 153))
    draw.rectangle([10, 70, 622, 75], fill=(255, 153, 51)) # Orange strip
    
    # Headers
    draw.text((25, 20), "EMPLOYEES' STATE INSURANCE CORPORATION", fill=(255, 255, 255))
    draw.text((25, 45), "MINISTRY OF LABOUR & EMPLOYMENT | GOVT OF INDIA", fill=(230, 240, 255))
    
    # ESIC Emblem / Logo mock
    draw.ellipse([45, 100, 105, 160], fill=(0, 102, 204), outline=(255, 255, 255), width=2)
    draw.text((58, 120), "ESIC", fill=(255, 255, 255))
    
    # Patient Data
    draw.text((130, 100), "Insured Person: Raju Kumar", fill=(0, 0, 0))
    draw.text((130, 130), "Gender / Age: Male / 45 Years", fill=(0, 0, 0))
    # Correct 17 digit insurance ID
    draw.text((130, 160), "Insurance Number: 21008894726190013", fill=(0, 51, 153))
    draw.text((130, 190), "Empanelled Clinic: ESIS Hospital Mumbai", fill=(50, 50, 50))
    
    # Draw genuine QR code
    draw_abha_qr(draw, 490, 100, 90)
    
    # Footer
    draw.rectangle([10, 330, 622, 390], fill=(26, 26, 26))
    draw.text((25, 340), "ESIC Cashless Treatment and Social Security Cover", fill=(255, 255, 255))
    
    path = os.path.join(OUTPUT_DIR, "card_3_esic_genuine.png")
    img.save(path)
    print(f"Generated Genuine ESIC Card at {path}")

def create_card_4_esic_fraudulent():
    # Card size 632x400
    img = Image.new("RGB", (632, 400), color=(245, 245, 245))
    draw = ImageDraw.Draw(img)
    
    # Bad border
    draw.rectangle([5, 5, 627, 395], outline=(120, 120, 120), width=1)
    
    # Flat blue header
    draw.rectangle([10, 10, 622, 70], fill=(0, 30, 100))
    
    # Badly printed header
    draw.text((25, 20), "EMPLOYEES STATE INSURANCE CORPORATION (INVALID)", fill=(255, 255, 255))
    
    # Emblem mock
    draw.ellipse([45, 100, 105, 160], fill=(100, 100, 100), outline=(50, 50, 50), width=1)
    draw.text((58, 120), "FAKE", fill=(200, 200, 200))
    
    # Patient Data
    draw.text((130, 100), "Insured Person: Raju Kumar", fill=(0, 0, 0))
    draw.text((130, 130), "Gender / Age: Male / 45 Years", fill=(0, 0, 0))
    # Bad 11-digit invalid ID (ESIC requires 10 or 17 digits)
    draw.text((130, 160), "Insurance Number: 21008894726-BAD", fill=(200, 0, 0))
    draw.text((130, 190), "Empanelled Clinic: UNKNOWN", fill=(100, 100, 100))
    
    # Blurred/Messed QR Mock
    draw.rectangle([490, 100, 580, 190], fill=(100, 100, 100))
    draw.text((515, 135), "BLURRED", fill=(255, 255, 255))
    
    # Footer
    draw.rectangle([10, 330, 622, 390], fill=(50, 50, 50))
    draw.text((25, 340), "Validation Failure - Insufficient digit length", fill=(255, 100, 100))
    
    path = os.path.join(OUTPUT_DIR, "card_4_esic_fraudulent.png")
    img.save(path)
    print(f"Generated Fraudulent ESIC Card at {path}")

if __name__ == "__main__":
    print("Generating High-Fidelity Demo Assets...")
    create_bill_1_legitimate()
    create_bill_2_emergency()
    create_card_1_pmjay_genuine()
    create_card_2_pmjay_fraudulent()
    create_card_3_esic_genuine()
    create_card_4_esic_fraudulent()
    print("All demo assets successfully generated in /demo_files!")
