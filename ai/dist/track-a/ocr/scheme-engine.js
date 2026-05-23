export function calculateSchemes(amount, hospital, treatment) {
    const hosp = hospital.toLowerCase();
    const treat = treatment.toLowerCase();
    let schemes = [];
    let totalSavings = 0;
    // 1. PM-JAY (Ayushman Bharat Scheme)
    // Eligible if Govt/Civil/District hospital or Major treatment
    if (hosp.includes('govt') || hosp.includes('district') || hosp.includes('civil') || treat.includes('major') || treat.includes('surgery')) {
        const pmjayBenefit = Math.round(amount * 0.60); // Roughly 60% coverage
        schemes.push({
            name: "PM-JAY",
            description: "Ayushman Bharat Scheme",
            amount: pmjayBenefit,
            status: "ELIGIBLE",
            instruction: "Ask at hospital for PM-JAY desk. Show your ID. They handle everything."
        });
        totalSavings += pmjayBenefit;
    }
    else {
        schemes.push({
            name: "PM-JAY",
            description: "Ayushman Bharat Scheme",
            amount: 0,
            status: "NOT ELIGIBLE",
            instruction: "Only applicable at empanelled Govt/Private hospitals."
        });
    }
    // 2. ESIC (Worker Insurance)
    // Eligible if ESIC hospital
    if (hosp.includes('esic') || hosp.includes('esi')) {
        const esicBenefit = Math.round(amount * 0.40); // Typical 40% added coverage or specific logic
        schemes.push({
            name: "ESIC",
            description: "Worker Insurance",
            amount: esicBenefit,
            status: "ELIGIBLE",
            instruction: "Find your ESIC card. Visit ESIC office nearby with card & bank passbook."
        });
        totalSavings += esicBenefit;
    }
    else {
        // Fallback generic logic for demo if not ESIC specifically
        const esicBenefit = Math.round(amount * 0.20);
        schemes.push({
            name: "ESIC",
            description: "Worker Insurance",
            amount: esicBenefit,
            status: "ELIGIBLE",
            instruction: "Find your ESIC card. Visit ESIC office nearby with card & bank passbook."
        });
        totalSavings += esicBenefit;
    }
    // 3. Group Policy (Corporate / Employer)
    schemes.push({
        name: "Group Policy",
        description: "Corporate / Employer",
        amount: 0,
        status: "X NOT FOUND",
        instruction: "Check with your HR to see if corporate insurance covers this."
    });
    const savingPercentage = amount > 0 ? Math.round((totalSavings / amount) * 100) : 0;
    return {
        summary: {
            total_get_back: totalSavings,
            save_percentage: savingPercentage,
            headline: savingPercentage > 0 ? `Save ${savingPercentage}% of your bill!` : "No savings found"
        },
        schemes
    };
}
