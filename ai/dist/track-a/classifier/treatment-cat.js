export function classifyTreatment(treatmentText) {
    const defaultRes = { category: "general", confidence: 0.5 };
    if (!treatmentText)
        return defaultRes;
    const txt = treatmentText.toLowerCase();
    if (txt.includes("surgery") || txt.includes("icu"))
        return { category: "major_surgery", confidence: 0.9 };
    if (txt.includes("x-ray") || txt.includes("mri"))
        return { category: "investigation", confidence: 0.9 };
    if (txt.includes("consultation"))
        return { category: "opd", confidence: 0.9 };
    return defaultRes;
}
