export function extractBillData(text) {
    // Basic RegEx implementations matching track-a python code
    const amountMatch = text.match(/₹?([0-9,]+(?:\.[0-9]{2})?)/);
    let amount = 0;
    if (amountMatch && amountMatch[1]) {
        amount = parseInt(amountMatch[1].replace(/[^\d]/g, ''), 10);
    }
    // Hospital
    let hospital = "Unknown";
    const hospPattern = /([A-Za-z\s]+(?:Hospital|Clinic|Polyclinic|Care|Institute))/i;
    const hospMatch = text.match(hospPattern);
    if (hospMatch && hospMatch[1]) {
        hospital = hospMatch[1].trim();
    }
    // Date
    let date = "Unknown";
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{2,4})/i;
    const dateMatch = text.match(datePattern);
    if (dateMatch && dateMatch[1]) {
        date = dateMatch[1];
    }
    // Treatment Fallback
    let treatment = "Unknown Processing";
    const treatmentPattern = /(consultation|surgery|x-ray|mri|blood test|admission|icu|dressing)/i;
    const treatmentMatch = text.match(treatmentPattern);
    if (treatmentMatch && treatmentMatch[1]) {
        treatment = treatmentMatch[1];
    }
    return {
        hospital,
        treatment,
        amount,
        date,
        raw_text: text
    };
}
